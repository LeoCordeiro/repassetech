// Testes de unidade em node puro (sem navegador): preço do formulário, mensagem do WhatsApp, CNPJ (numérico e alfanumérico),
// textos da conferência do IMEI nos dois modos, versão dos documentos amarrada ao texto e o leitor do .env.production.
//   npm test   (ou node scripts/unidade.mjs)
// Sai ≠ 0 se reprovar.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { cnpjValido, erroCnpj, mascararCnpj, normalizarCnpj, posicaoNaMascara } from '../src/lib/cnpj.js'
import { formatarPreco, lerPreco } from '../src/lib/preco.js'
import { cortar, cortarSemSegmenter, montarMensagem } from '../src/lib/whatsapp.js'
import { LINHA_ACEITE, SITE, dataBr } from '../src/config/site.js'
import { textosImei } from '../src/data/conferencia-imei.js'
import { conferirVersaoDocs, hashDocs, textoDoTemplate } from './lib/versao-docs.mjs'
import { numeroOficial } from './lib/env-producao.mjs'

const RAIZ = fileURLToPath(new URL('..', import.meta.url))

/** Roda os casos e devolve a lista de falhas (texto). `log` recebe cada linha. */
export function rodarUnidade(log = console.log) {
  const falhas = []
  const ok = (cond, msg, extra = '') => {
    log(`  ${cond ? 'ok     ' : 'REPROVA'} ${msg}${extra !== '' ? ` → ${extra}` : ''}`)
    if (!cond) falhas.push(`unidade: ${msg} ${extra}`)
  }

  // ---- preço: o jeito brasileiro de digitar
  const PRECOS = [
    ['1.250', 'R$ 1.250,00'],
    ['1.250,50', 'R$ 1.250,50'],
    ['1250', 'R$ 1.250,00'],
    ['12,5', 'R$ 12,50'],
    ['2.100', 'R$ 2.100,00'],
    ['12.500', 'R$ 12.500,00'],
    ['1250.5', 'R$ 1.250,50'],
    ['850', 'R$ 850,00'],
    ['850,00', 'R$ 850,00'],
    ['R$ 1.250,00', 'R$ 1.250,00'],
    ['1.25', 'R$ 1,25'],
  ]
  for (const [entrada, esperado] of PRECOS) {
    const saida = formatarPreco(lerPreco(entrada))
    ok(saida === esperado, `preço "${entrada}" → ${esperado}`, saida)
  }
  for (const ruim of ['', 'abc', '1.2.3', '1,250,00', '12,555', '1.25,0', '-5']) {
    ok(Number.isNaN(lerPreco(ruim)), `preço inválido "${ruim}" → NaN`, lerPreco(ruim))
  }

  // ---- corte por grafema: emoji e acento nunca partidos
  const emoji = '📱'.repeat(10) // 20 unidades UTF-16
  ok(cortar(emoji, 7) === '📱'.repeat(3), 'cortar no meio de um emoji recua para o emoji inteiro', JSON.stringify(cortar(emoji, 7)))
  const familia = 'a👨‍👩‍👧b' // grafema de 8 unidades
  ok(cortar(familia, 5) === 'a', 'cortar dentro de grafema composto (ZWJ) recua para antes dele', JSON.stringify(cortar(familia, 5)))
  ok(cortar('São Paulo', 3) === 'São', 'acento composto fica inteiro', cortar('São Paulo', 3))
  // sem Intl.Segmenter: para no 1º ponto de código que não cabe, nunca pula o emoji e continua
  ok(cortarSemSegmenter('ab📱c', 3) === 'ab' && cortarSemSegmenter('ab📱c', 4) === 'ab📱' && cortarSemSegmenter('📱📱', 3) === '📱',
    'sem Intl.Segmenter: "ab📱c" cortado em 3 é "ab" (o emoji não cabe e o corte para ali; antes saía "abc")', JSON.stringify(cortarSemSegmenter('ab📱c', 3)))

  // ---- mensagem longa com emoji: o teto do wa.me corta sem lançar URIError
  const base = [['Empresa', 'Loja Teste'], ['Modelo', 'Galaxy A16, '.repeat(120)]]
  for (let desloc = 0; desloc < 14; desloc++) { // 14 = tamanho do padrão: o corte cai em toda posição, inclusive entre as metades do emoji
    const obs = 'x'.repeat(desloc) + 'Bateria boa 📱'.repeat(80)
    let r = null
    let erro = null
    try {
      r = montarMensagem('VENDER', [...base, ['Observações', obs]], { numero: '5500000000000' })
    } catch (e) {
      erro = e
    }
    const decodificado = r && decodeURIComponent(r.url.split('?text=')[1])
    ok(!erro && r.texto.length <= 1800 && decodificado === r.texto && r.texto.isWellFormed?.() !== false,
      `mensagem acima do teto com emoji (deslocamento ${desloc}): corta, encode e decode iguais`, erro ? String(erro) : `${r.texto.length} un.`)
  }
  // substituto solto (texto colado de outro app) não derruba o encode
  let solto = null
  try {
    solto = montarMensagem('COMPRAR', [['Modelos', 'iPhone \uD83D fim']], { numero: '5500000000000' })
  } catch (e) {
    solto = e
  }
  ok(solto && !(solto instanceof Error) && solto.url.startsWith('https://wa.me/5500000000000?text='), 'substituto UTF-16 solto vira caractere válido', solto instanceof Error ? String(solto) : 'ok')

  // ---- teto sem observação: o corte nunca apaga o aceite nem o rodapé — corta o maior valor
  for (const [nome, campos, resumo] of [
    ['modelo enorme', [['Modelo', 'Galaxy A16 128 GB, '.repeat(100)], ['Observações', '']], '40 un. · Samsung · Novo lacrado'],
    ['resumo e loja enormes', [['Loja', 'Loja '.repeat(200)], ['Modelo', 'x'.repeat(400)]], `40 un. · ${'Galaxy '.repeat(150)}`],
  ]) {
    const m = montarMensagem('VENDER', campos, { numero: '5500000000000', aceite: LINHA_ACEITE, resumo }).texto.split('\n')
    ok(m.join('\n').length <= 1800 && m[0] === '[VENDER] Lote para conferência' && m[m.length - 2] === LINHA_ACEITE && m[m.length - 1] === '(preenchido no formulário Quero vender do site)',
      `mensagem acima do teto sem observação (${nome}): ≤ 1800 e a linha do aceite e o rodapé intactos no fim`, `${m.join('\n').length} un. · ${m.slice(-2).join(' | ').slice(0, 90)}`)
  }

  // ---- rodapé e título da mensagem
  const v = montarMensagem('VENDER', [['IMEI', 'não se aplica']], { numero: '5500000000000' }).texto
  ok(v.startsWith('[VENDER] Lote para conferência') && v.includes('(preenchido no formulário Quero vender do site)'), 'mensagem [VENDER]: título e rodapé', v.split('\n')[0])
  // linha de resumo logo depois do título: a notificação do WhatsApp mostra as 2 primeiras linhas
  const r = montarMensagem('VENDER', [['Modelo', 'Galaxy A16']], { numero: '5500000000000', resumo: '40 un. · Samsung Galaxy A16 128 GB · Novo lacrado' }).texto.split('\n')
  ok(r[0] === '[VENDER] Lote para conferência' && r[1] === '40 un. · Samsung Galaxy A16 128 GB · Novo lacrado' && r[2] === 'Modelo: Galaxy A16', 'mensagem: resumo na 2ª linha, campos depois', r.slice(0, 3).join(' | '))

  // ---- aceite dos Termos: a linha do aceite, com a versão, logo antes do rodapé; [CONTATO] sem ela
  const aceite = montarMensagem('COMPRAR', [['Modelos', 'iPhone 13']], { numero: '5500000000000', aceite: LINHA_ACEITE }).texto.split('\n')
  // "da Repasse Tech" (no WhatsApp, "os Termos de uso" sozinho lia como os do WhatsApp) e a data no
  // formato da página (DD/MM/AAAA); SITE.vigenciaDocs continua ISO
  ok(/^Li e aceito os Termos de uso da Repasse Tech \(versão de (\d{2}\/\d{2}\/\d{4}|\[data pendente\])\)$/.test(LINHA_ACEITE) && aceite[aceite.length - 2] === LINHA_ACEITE && aceite[aceite.length - 1] === '(preenchido no formulário Quero comprar do site)' && dataBr('2026-11-02') === '02/11/2026',
    'mensagem [COMPRAR]: "Li e aceito os Termos de uso da Repasse Tech (versão de DD/MM/AAAA)" na penúltima linha, antes do rodapé', aceite.slice(-2).join(' | '))
  const contato = montarMensagem('CONTATO', [['Página', 'Loja']], { numero: '5500000000000' }).texto
  ok(!/Termos de uso/.test(contato), 'mensagem [CONTATO] (botão fixo, dúvida): sem linha de aceite', contato.split('\n').join(' | '))
  // opcoes.numero: no node/dev vale; no build de produção é ignorado (o destino é sempre o número do build)
  ok(montarMensagem('CONTATO', [], { numero: '5500000000000' }).url.startsWith('https://wa.me/5500000000000?'), 'node: opcoes.numero vale fora do build de produção')

  // ---- CNPJ numérico e alfanumérico (IN RFB 2.229/2024). O DV esperado sai de uma implementação de REFERÊNCIA escrita
  // aqui, independente da lib: pesos explícitos e valor = código ASCII − 48. Nenhum exemplo é escrito à mão sem conferir.
  const P1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const P2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const dvRef = (base, pesos) => {
    const soma = [...base].reduce((s, c, i) => s + (c.charCodeAt(0) - 48) * pesos[i], 0)
    return soma % 11 < 2 ? 0 : 11 - (soma % 11)
  }
  const completar = (base12) => {
    const d1 = dvRef(base12, P1)
    return `${base12}${d1}${dvRef(base12 + d1, P2)}`
  }
  // o exemplo publicado pela Receita (12.ABC.345/01DE-35) confere com a referência, conta feita à mão: soma 459 → DV 3; 424 → DV 5
  ok(completar('12ABC34501DE') === '12ABC34501DE35', 'referência: 12ABC34501DE → DV 35 (exemplo da Receita)', completar('12ABC34501DE'))
  const ALFA = ['12ABC34501DE', 'A1B2C3D4E5F6', 'ZZZZZZZZZZZZ', 'RT0001SP0001', '9X8Y7W6V5U4T', '00000000A000']
  const NUM = ['112223330001', '555241030001', '191000000001', '604461940001']
  for (const base of [...ALFA, ...NUM]) {
    const certo = completar(base)
    const errado = `${certo.slice(0, 12)}${(Number(certo[12]) + 1) % 10}${certo[13]}`
    const errado2 = `${certo.slice(0, 13)}${(Number(certo[13]) + 1) % 10}`
    ok(cnpjValido(certo) && cnpjValido(mascararCnpj(certo)) && cnpjValido(certo.toLowerCase()), `CNPJ ${mascararCnpj(certo)} válido (cru, mascarado e minúsculo)`)
    ok(!cnpjValido(errado) && !cnpjValido(errado2), `CNPJ ${mascararCnpj(certo)} com 1º ou 2º DV trocado é recusado`, `${errado} ${errado2}`)
  }
  ok(cnpjValido('11.222.333/0001-81') && cnpjValido('55.524.103/0001-42') && !cnpjValido('11.222.333/0001-00'), 'CNPJ numérico de hoje: os dois válidos passam, DV errado não')
  ok(!cnpjValido('00.000.000/0000-00') && !cnpjValido('11.111.111/1111-11') && !cnpjValido('12.ABC.345/01DE') && !cnpjValido(''), 'CNPJ incompleto ou com todos os dígitos iguais é recusado')
  ok(!cnpjValido('12ABC34501DEA5') && normalizarCnpj('12ABC34501DEA5') === '12ABC34501DE5', 'letra no lugar do DV não entra (o DV é sempre número)', normalizarCnpj('12ABC34501DEA5'))
  const MASCARAS = [['12abc34501de35', '12.ABC.345/01DE-35'], ['11222333000181', '11.222.333/0001-81'], ['12.ABC.345/01DE-35', '12.ABC.345/01DE-35'], ['1', '1'], ['12a', '12.A'], ['12abc345', '12.ABC.345'], ['12abc3450', '12.ABC.345/0'], ['12abc34501de3', '12.ABC.345/01DE-3'], ['12ABC34501DEXY', '12.ABC.345/01DE'], ['ç12-ab c', '12.ABC']]
  for (const [entrada, esperado] of MASCARAS) ok(mascararCnpj(entrada) === esperado, `máscara "${entrada}" → ${esperado}`, mascararCnpj(entrada))
  // CNPJ colado: com espaço na frente, espaços no meio ou o rótulo "CNPJ:" (o campo não tem maxlength; a máscara limpa)
  const COLADOS = [[' 11.222.333/0001-81', '11.222.333/0001-81'], ['11 222 333 0001 81', '11.222.333/0001-81'], ['CNPJ: 11.222.333/0001-81', '11.222.333/0001-81'], ['cnpj 12.abc.345/01de-35', '12.ABC.345/01DE-35'], ['CNPJ nº 11.222.333/0001-81', '11.222.333/0001-81']]
  for (const [entrada, esperado] of COLADOS) ok(mascararCnpj(entrada) === esperado && cnpjValido(entrada), `CNPJ colado "${entrada}" → ${esperado} (válido)`, mascararCnpj(entrada))
  // um CNPJ alfanumérico que começa pelas letras C, N, P e J, sem separador, não perde as letras
  const cnpjLetras = completar('CNPJ12345678')
  ok(normalizarCnpj(cnpjLetras) === cnpjLetras && cnpjValido(cnpjLetras), 'CNPJ alfanumérico que começa por "CNPJ" (sem separador) fica inteiro', cnpjLetras)
  // mensagens: vazio, incompleto (quantos faltam), completo que não confere, válido
  ok(erroCnpj('') === 'Informe o CNPJ da empresa.' && erroCnpj('12.ABC.345') === 'O CNPJ tem 14 caracteres: faltam 6.' && erroCnpj('12.ABC.345/01DE-3') === 'O CNPJ tem 14 caracteres: falta 1.' &&
    erroCnpj('12.ABC.345/01DE-36') === 'Confira o CNPJ: algum número ou letra não confere.' && erroCnpj('11.111.111/1111-11') === 'Confira o CNPJ: algum número ou letra não confere.' && erroCnpj('12.ABC.345/01DE-35') === '',
    'erro do CNPJ: vazio pede o CNPJ; incompleto diz quantos caracteres faltam; completo que não confere diz isso; válido passa', [erroCnpj('12.ABC.345'), erroCnpj('12.ABC.345/01DE-3')].join(' | '))
  // cursor depois da máscara: volta para depois do mesmo caractere que vale (corrigir no meio não joga o cursor para o fim)
  ok(posicaoNaMascara('11.229.333/0001-81', 5) === 6 && posicaoNaMascara('11.222.333/0001-81', 2) === 2 && posicaoNaMascara('11.222.333/0001-81', 14) === 18 && posicaoNaMascara('11.2', 3) === 4,
    'cursor do CNPJ: depois do N-ésimo caractere que vale, pulando a pontuação da máscara', [posicaoNaMascara('11.229.333/0001-81', 5), posicaoNaMascara('11.222.333/0001-81', 14)].join(' '))

  // ---- conferência do IMEI nos dois modos: uma fonte só, SITE.conferenciaImei
  const T = textosImei('todos')
  const A = textosImei('amostra')
  const N = textosImei(null)
  ok(T.selo === 'NF + IMEI conferidos' && T.seloExtenso === 'nota fiscal e IMEI conferidos' && /vêm com IMEI conferido\.$/.test(T.heroB) && T.regraEntrada === 'Só entra com NF + IMEI conferidos' && T.regraEntradaNf === 'Só entra com NF conferida' && T.termos === 'um por um' && T.lojaQueixos.length === 2,
    "IMEI 'todos': selo \"NF + IMEI conferidos\", hero \"vêm com IMEI conferido.\", regra do catálogo \"Só entra com NF + IMEI conferidos\", Termos \"um por um\", 2 selos na Loja", T.heroB)
  ok(A.selo === 'NF conferida' && A.seloExtenso === 'nota fiscal conferida' && /IMEI conferido por amostra\.$/.test(A.heroB) && /uma amostra dos IMEIs conferidas/.test(A.passoHome) && !/origem conferid/.test(A.passoHome) && /uma amostra dos IMEIs/.test(A.passoVendedor) && A.regraEntrada === 'Só entra com NF conferida' && A.termos === 'por amostragem em cada lote' && A.lojaQueixos.length === 1 && A.lojaQueixos[0].texto === 'NF conferida' && !/NF \+ IMEI conferidos/.test(JSON.stringify(A)),
    "IMEI 'amostra': selo e regra do catálogo só da nota, hero e passos dizem \"por amostra\", Termos \"por amostragem em cada lote\", nunca \"NF + IMEI conferidos\"", A.heroB)
  ok(N.selo === T.selo && N.heroB === T.heroB && N.passoHome === T.passoHome && /^\[PREENCHER: /.test(N.termos),
    'IMEI null (modo ainda não definido): mostra os textos de "todos" e os Termos com o marcador de pendência (o build de produção falha)', N.termos)

  // ---- versão dos documentos amarrada ao texto
  const vue = (corpo) => `<script setup>\nconst x = 1\n</script>\n<template>\n  <div class="a">${corpo}</div>\n</template>\n<style>.a{}</style>`
  ok(textoDoTemplate(vue('<p>Olá <strong>mundo</strong></p>')) === textoDoTemplate(vue('\n<p class="x">Olá\n  <strong>mundo</strong></p><VoltarSumario />')) && textoDoTemplate(vue('<p>Olá mundo</p>')) !== textoDoTemplate(vue('<p>Olá mundos</p>')),
    'hash dos documentos: marcação (tag, classe, componente, quebra de linha) não muda o texto; uma palavra muda')
  const h = hashDocs(RAIZ, { termosImei: T.termos, site: SITE })
  ok(/^[0-9a-f]{16}$/.test(h) && h !== hashDocs(RAIZ, { termosImei: A.termos, site: SITE }), 'hash dos documentos: 16 hex, e o modo do IMEI muda o hash (o trecho dos Termos muda)', h)
  ok(conferirVersaoDocs({ vigencia: '__PREENCHER_DATA__', versoes: {}, hash: h }) === '' &&
    /não tem o hash da versão 2026-11-02/.test(conferirVersaoDocs({ vigencia: '2026-11-02', versoes: {}, hash: h })) &&
    /mudou e a versão continua 2026-11-02/.test(conferirVersaoDocs({ vigencia: '2026-11-02', versoes: { '2026-11-02': 'outro' }, hash: h })) &&
    conferirVersaoDocs({ vigencia: '2026-11-02', versoes: { '2026-11-02': h }, hash: h }) === '',
    'versão dos documentos: sem hash registrado reprova; texto mudou com a mesma data reprova; data com o hash do texto passa')

  // ---- .env.production pelo parser do Vite: aspas, comentário e export valem; linha estranha reprova
  const dir = mkdtempSync(join(tmpdir(), 'repasse-unidade-env-'))
  try {
    const ler = (linha) => (writeFileSync(join(dir, '.env.production'), `# comentário\n${linha}\n`), numeroOficial(dir))
    const casos = [
      ['VITE_WHATSAPP_NUMBER=', null, false], ['VITE_WHATSAPP_NUMBER=5513999999999', '5513999999999', false],
      ['VITE_WHATSAPP_NUMBER="5513999999999"', '5513999999999', false], ['VITE_WHATSAPP_NUMBER=5513999999999 # oficial', '5513999999999', false],
      ['export VITE_WHATSAPP_NUMBER=5513999999999', '5513999999999', false], ['VITE_WHATSAPP_NUMBER=55 13 99999-9999', null, true],
      ['VITE_WHATSAP_NUMBER=5513999999999', null, true],
    ]
    const ruins = casos.map(([l, num, erro]) => [l, ler(l)]).filter(([l, r], i) => r.numero !== casos[i][1] || Boolean(r.erro) !== casos[i][2])
    ok(!ruins.length, `.env.production lido como o Vite lê (${casos.length} variantes: vazio, aspas, "# comentário", export; valor e chave estranhos reprovam)`, ruins.map(([l, r]) => `${l} → ${JSON.stringify(r)}`).join(' · '))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  return falhas
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log('== unidade (node)')
  const falhas = rodarUnidade()
  console.log(falhas.length ? `\nREPROVADO: ${falhas.length}` : '\nAPROVADO')
  process.exit(falhas.length ? 1 : 0)
}
