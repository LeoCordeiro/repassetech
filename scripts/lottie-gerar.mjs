// Gera o catálogo Lottie da Repasse Tech (JSON Lottie 5.7.4 escrito à mão, sem deps).
// Camadas shape, `cl` = classe para recolorir pelo tema, traço desenhado por trim path, easing por handles i/o. Cada
// animação é uma função de papel→cor, então a variante -invertida (fundo #0F4C5C) sai do mesmo desenho.
//   node scripts/lottie-gerar.mjs [pasta]   (padrão: src/assets/lottie; o npm run lottie:gerar grava lá)
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PALETA as P } from '../src/styles/paleta.js'

const PASTA = resolve(process.argv[2] ?? 'src/assets/lottie')
const FR = 30

// nomes do catálogo → cores da paleta do site (src/styles/paleta.js, o único lugar com hex)
const HEX = {
  petroleo: P.petroleo, laranja: P.acao, azul: P['azul-claro'], branco: P.branco,
  profundo: P['petroleo-profundo'], gelo: P.gelo, cinza: P['cinza-petroleo'], laranjaEscuro: P['acao-hover'],
}
// papel → [normal, invertida]
const PAPEL = {
  traco: ['petroleo', 'branco'],
  detalhe: ['azul', 'azul'],
  neutro: ['cinza', 'azul'],
  acao: ['laranja', 'laranja'],
  fundo: ['gelo', 'profundo'],
  contraste: ['branco', 'petroleo'],
}
const rgb = (hex) => [1, 3, 5].map((i) => +(parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(4)).concat(1)

// Curvas de easing. "o" = handle de saída do keyframe atual (x1,y1);
// "i" = handle de entrada do próximo (x2,y2). Nenhuma curva com y fora de [0,1]: o único overshoot do catálogo é
// o do enviado-sucesso, e ele está nos KEYFRAMES (o check passa de 100% e volta), não na tangente — o lottie:check mede
// a amplitude.
const CURVA = {
  pass: [[0.45, 0], [0.15, 1]],
  settle: [[0.16, 1], [0.3, 1]],
  linear: [[0, 0], [1, 1]],
}

const st = (k) => ({ a: 0, k })
/** anim([[t, valor, curva], ..., [t, valor]]) — a curva vale do keyframe até o próximo. */
function anim(chaves) {
  return {
    a: 1,
    k: chaves.map(([t, s, curva], n) => {
      const v = Array.isArray(s) ? s : [s]
      const kf = { t, s: v }
      if (n < chaves.length - 1) {
        const [o, i] = CURVA[curva]
        const d = v.length
        kf.o = { x: Array(d).fill(o[0]), y: Array(d).fill(o[1]) }
        kf.i = { x: Array(d).fill(i[0]), y: Array(d).fill(i[1]) }
      }
      return kf
    }),
  }
}
const val = (x) => (x && typeof x === 'object' && 'a' in x ? x : st(x))

const caminho = (v, { i, o, c = false } = {}, nm = 'Path') => ({
  ty: 'sh', d: 1, nm,
  ks: st({ i: i ?? v.map(() => [0, 0]), o: o ?? v.map(() => [0, 0]), v, c }),
})
const retangulo = (w, h, r, p = [0, 0]) => ({ ty: 'rc', d: 1, nm: 'Rect', s: st([w, h]), p: st(p), r: st(r) })
const elipse = (d, p = [0, 0]) => ({ ty: 'el', d: 1, nm: 'Ellipse', s: st([d, d]), p: st(p) })
const traco = (cor, w) => ({ ty: 'st', nm: 'Stroke', c: st(rgb(cor)), o: st(100), w: st(w), lc: 2, lj: 2, ml: 4, bm: 0 })
const preenche = (cor) => ({ ty: 'fl', nm: 'Fill', c: st(rgb(cor)), o: st(100), r: 1, bm: 0 })
const corte = (s, e) => ({ ty: 'tm', nm: 'Trim', s: val(s), e: val(e), o: st(0), m: 1 })
const transf = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({
  ty: 'tr', nm: 'Transform', p: val(p), a: val(a), s: val(s), r: val(r), o: val(o), sk: st(0), sa: st(0),
})
const grupo = (nm, itens, t) => ({ ty: 'gr', nm, it: [...itens, transf(t)] })

function camada(ind, nm, papel, formas, { p, a = [0, 0, 0], s = [100, 100, 100], r = 0, o = 100 } = {}) {
  return {
    ddd: 0, ind, ty: 4, nm, cl: `rt-lottie__${papel}`, sr: 1, ao: 0, ip: 0, op: 0, st: 0, bm: 0,
    ks: { o: val(o), r: val(r), p: val(p), a: val(a), s: val(s) },
    shapes: formas,
  }
}
function composicao(nm, w, h, op, camadas) {
  // primeira camada da lista fica por cima (ordem do Lottie)
  camadas.forEach((c, n) => { c.ind = n + 1; c.op = op })
  return { v: '5.7.4', fr: FR, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers: camadas }
}

/**
 * Seta RETA horizontal na proporção da seta da logo: haste 40, ponta 52×86 + traço 8 de junção redonda, em k = 44/94 (a
 * ponta ocupa 44 dos 48 px de altura). A largura W só alonga a haste. 18 quadros = 600 ms: a haste se desenha (trim, pass,
 * 0→13) e a ponta assenta (10→17, settle) vindo de 6% da largura (até 10 px) atrás.
 */
function setaReta(nome, W, cor) {
  const H = 48, k = 44 / 94, y = H / 2
  const r = (n) => +n.toFixed(2)
  const ponta = W - 4 - r(4 * k) // vértice: margem 2 + metade do traço da ponta (a 160 = 156 − 4k, como sempre foi)
  const base = r(ponta - 52 * k), meia = r(43 * k), avanco = r(Math.min(W * 0.06, 9.6))
  return composicao(nome, W, H, 18, [
    camada(0, 'ponta', 'acao', [grupo('triangulo', [
      caminho([[base, y - meia], [ponta, y], [base, y + meia]], { c: true }),
      preenche(cor('acao')),
      traco(cor('acao'), r(8 * k)),
    ])], {
      a: [base, y, 0],
      p: anim([[10, [base - avanco, y, 0], 'settle'], [17, [base, y, 0]]]),
      s: anim([[10, [55, 55, 100], 'settle'], [17, [100, 100, 100]]]),
      o: anim([[10, 0, 'settle'], [13, 100]]),
    }),
    camada(0, 'haste', 'acao', [grupo('linha', [
      caminho([[r(2 + 20 * k), y], [base, y]]),
      corte(0, anim([[0, 0, 'pass'], [13, 100]])),
      traco(cor('acao'), r(40 * k)),
    ])], { p: [0, 0, 0] }),
  ])
}

// Círculo de 4 pontos (kappa) para quando o trim precisa começar num ponto definido.
const K = 0.5523

// ───────────────────────── catálogo ─────────────────────────
// Cada entrada: (cor) => json, onde cor(papel) devolve o hex do papel na variante.
const CATALOGO = {
  // Geometria EXATA da seta da logo oficial (brand/logo-icone.svg):
  // traço M175 225 C205 260 225 295 270 295 H300 (w 40, cap round) + ponta 300,252 352,295
  // 300,338 (fill + stroke 8 round join). Canvas = recorte x 150→360, y 200→345 da logo,
  // 1:1 (coordenada da logo − [150,200]). 24 quadros = 800 ms: o traço se desenha da perna
  // do R até a ponta (trim, pass, 0→17); a ponta entra no fim (14→23, settle) avançando
  // 6% da largura e abrindo da base. Quadro 23 = a seta da logo, sem deslocamento.
  'seta-repasse': {
    meta: {
      gatilho: 'manual (hero, junto com o R: --atraso-hero-seta, 150 ms < 1024 e 600 ms ≥ 1024, depois da travessia)', loop: false, uso: 'hero: a seta da logo se desenha sobre logo-icone-sem-seta (geometria da logo oficial)', curvas: ['pass', 'settle'],
      naoPedido: { invertida: 'gêmea idêntica da normal: a seta é laranja (papel acao) nas duas variantes, e o hero pede sempre a normal' },
    },
    gerar: (cor) => {
      const W = 210, H = 145, base = [150, 95], avanco = +(W * 0.06).toFixed(1)
      return composicao('seta-repasse', W, H, 24, [
        camada(0, 'ponta', 'acao', [grupo('triangulo', [
          caminho([[150, 52], [202, 95], [150, 138]], { c: true }),
          preenche(cor('acao')),
          traco(cor('acao'), 8),
        ])], {
          a: [...base, 0],
          p: anim([[14, [base[0] - avanco, base[1], 0], 'settle'], [23, [...base, 0]]]),
          s: anim([[14, [55, 55, 100], 'settle'], [23, [100, 100, 100]]]),
          o: anim([[14, 0, 'settle'], [17, 100]]),
        }),
        camada(0, 'traco', 'acao', [grupo('curva', [
          caminho([[25, 25], [120, 95], [150, 95]], { o: [[30, 35], [0, 0], [0, 0]], i: [[0, 0], [-45, 0], [0, 0]] }),
          corte(0, anim([[0, 0, 'pass'], [17, 100]])),
          traco(cor('acao'), 40),
        ])], { p: [0, 0, 0] }),
      ])
    },
  },

  // Seta RETA das costuras (horizontal; o site gira o contêiner 90°). Canvas 160×48, haste em y 24. Proporção da seta da logo: haste 40, ponta 52×86 + traço 8 de
  // junção redonda → escala k = 44/94 (a ponta ocupa 44 dos 48 px de altura). 18 quadros = 600 ms:
  // a haste se desenha (trim, pass, 0→13) e a ponta assenta (10→17, settle) vindo de 6% atrás.
  'seta-costura': {
    meta: {
      gatilho: 'manual (costura entre seções)', loop: false, uso: 'costuras entre seções (girada 90° no contêiner); seta reta na proporção da seta da logo', curvas: ['pass', 'settle'],
      naoPedido: { invertida: 'gêmea idêntica da normal: a seta é laranja (papel acao) nas duas variantes, e a costura pede sempre a normal' },
    },
    gerar: (cor) => setaReta('seta-costura', 160, cor),
  },

  // Travessia do hero: a MESMA seta reta da costura, no k da seta da logo exibida no hero
  // ≥ 1024 (ícone de 144 px → 144/308 ≈ 44/94): haste 18,7 px e ponta de 44 px, iguais às da logo.
  // Ela TERMINA ATRÁS DA PLACA — a ponta (base em 89,8) fica escondida e só a haste aparece, entrando
  // pela metade de quem vende. Canvas 110×48: a haste inteira se desenha à vista (433 ms de traço) e o começo dela fica a
  // 150 px do eixo (a coluna do texto das metades começa a 160; a 1024 "lado," termina ~179 px antes do eixo: ~30 px de folga).
  'seta-travessia': {
    meta: {
      gatilho: 'manual (hero ≥ 1024, antes da seta da logo)', loop: false, uso: 'travessia do hero: entra pela metade de quem vende, na altura da ponta da seta da logo, e termina atrás da placa (a ponta escondida; só ≥ 1024)', curvas: ['pass', 'settle'],
      naoPedido: { invertida: 'gêmea idêntica da normal: a seta é laranja (papel acao) nas duas variantes, e o hero pede sempre a normal' },
    },
    gerar: (cor) => setaReta('seta-travessia', 110, cor),
  },

  // 14 quadros = 467 ms. Disco, anel e check com settle. Sem overshoot — o selo é prova e repete em
  // até 4 cards seguidos; quicar 4 vezes viraria confete. O único overshoot do site é o do envio.
  'selo-verificado': {
    meta: { gatilho: 'manual (quem chama: hero, card do catálogo, bloco de confiança, bloco do selo da Loja)', loop: false, uso: 'carimbo do selo: card do catálogo (a regra de entrada), hero, bloco de confiança e bloco do selo da Loja ("NF + IMEI conferidos" ou "NF conferida")', curvas: ['settle'] },
    gerar: (cor) => composicao('selo-verificado', 48, 48, 14, [
      camada(0, 'check', 'contraste', [grupo('check', [
        caminho([[-6.5, 0.5], [-2, 5], [7, -4.5]]),
        corte(0, anim([[4, 0, 'settle'], [13, 100]])),
        traco(cor('contraste'), 3.5),
      ])], { p: [24, 24, 0] }),
      camada(0, 'disco', 'traco', [grupo('disco', [elipse(32), preenche(cor('traco'))])],
        { p: [24, 24, 0], s: anim([[0, [55, 55, 100], 'settle'], [11, [100, 100, 100]]]) }),
      camada(0, 'anel', 'detalhe', [grupo('anel', [
        elipse(42), corte(0, anim([[0, 0, 'settle'], [10, 100]])), traco(cor('detalhe'), 2),
      ], { r: -90 })], { p: [24, 24, 0] }),
    ]),
  },

  // 60 quadros = 2 s por ciclo. Documento (NF com código de barras do IMEI) parado; só a
  // linha de varredura anda, linear, e some antes de voltar ao topo → loop sem salto.
  'scan-imei-nf': {
    meta: { gatilho: 'viewport, loop lento', loop: true, uso: 'bloco Confiança e Conferência', curvas: ['linear (varredura)', 'settle (opacidade)'] },
    gerar: (cor) => {
      const cantos = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], n) =>
        caminho([[sx * 25, sy * 18], [sx * 25, sy * 25], [sx * 18, sy * 25]], {}, `canto ${n + 1}`))
      const barras = [-8, -5.5, -4, -1, 1, 3.5, 5, 8].map((x) => caminho([[x, 7], [x, 12]], {}, 'barra'))
      return composicao('scan-imei-nf', 64, 64, 60, [
        camada(0, 'varredura', 'detalhe', [grupo('linha', [caminho([[-19, 0], [19, 0]]), traco(cor('detalhe'), 2)])], {
          p: anim([[0, [32, 15, 0], 'linear'], [44, [32, 49, 0]]]),
          o: anim([[0, 0, 'settle'], [6, 100, 'settle'], [36, 100, 'settle'], [44, 0]]),
        }),
        camada(0, 'codigo-imei', 'neutro', [grupo('barras', [...barras, traco(cor('neutro'), 1.5)])], { p: [32, 32, 0] }),
        camada(0, 'linhas-nf', 'neutro', [grupo('linhas', [
          caminho([[-8, -10], [8, -10]]), caminho([[-8, -5], [8, -5]]), caminho([[-8, 0], [3, 0]]),
          traco(cor('neutro'), 2),
        ])], { p: [32, 32, 0] }),
        camada(0, 'documento', 'traco', [grupo('folha', [retangulo(28, 38, 3), traco(cor('traco'), 2.5)])], { p: [32, 32, 0] }),
        camada(0, 'cantos', 'detalhe', [grupo('mira', [...cantos, traco(cor('detalhe'), 2)])], { p: [32, 32, 0] }),
      ])
    },
  },

  // Passos: 12 quadros = 400 ms cada, settle. Stagger de 120 ms fica no site.
  'passo-1-cadastro': {
    meta: { gatilho: 'viewport, stagger 120 ms', loop: false, uso: 'Como funciona — 1 Cadastro (CNPJ ativo)', curvas: ['settle'] },
    gerar: (cor) => composicao('passo-1-cadastro', 48, 48, 12, [
      camada(0, 'dados', 'neutro', [grupo('linhas', [
        caminho([[0, -4], [11, -4]]), caminho([[0, 3], [7, 3]]),
        corte(0, anim([[4, 0, 'settle'], [11, 100]])), traco(cor('neutro'), 2.5),
      ])], { p: [24, 24, 0] }),
      camada(0, 'avatar', 'detalhe', [grupo('avatar', [elipse(9, [-8, -2]), caminho([[-13, 6], [-3, 6]]), traco(cor('detalhe'), 2)])],
        // nasce de 50% com a opacidade subindo em 3 quadros (de scale 0 seria um ponto solto)
        { p: [16, 24, 0], a: [-8, 0, 0], s: anim([[2, [50, 50, 100], 'settle'], [10, [100, 100, 100]]]), o: anim([[2, 0, 'settle'], [5, 100]]) }),
      camada(0, 'cartao', 'traco', [grupo('cartao', [
        retangulo(36, 26, 3.5), corte(0, anim([[0, 0, 'settle'], [10, 100]])), traco(cor('traco'), 2.5),
      ])], { p: [24, 24, 0] }),
    ]),
  },

  'passo-2-lote': {
    meta: { gatilho: 'viewport, stagger 120 ms', loop: false, uso: 'Como funciona — 2 Lote publicado', curvas: ['settle'] },
    gerar: (cor) => {
      const aparelho = (nm, x, t0) => camada(0, nm, 'detalhe', [grupo('aparelho', [
        retangulo(9, 16, 2), caminho([[-1.5, -4.5], [1.5, -4.5]]), preenche(cor('fundo')), traco(cor('detalhe'), 2),
      ])], {
        p: anim([[t0, [x, 6, 0], 'settle'], [t0 + 8, [x, 19, 0]]]),
        o: anim([[t0, 0, 'settle'], [t0 + 4, 100]]),
      })
      return composicao('passo-2-lote', 48, 48, 12, [
        camada(0, 'caixa', 'traco', [grupo('caixa', [
          retangulo(32, 15, 2), preenche(cor('fundo')),
          corte(0, anim([[0, 0, 'settle'], [9, 100]])), traco(cor('traco'), 2.5),
        ])], { p: [24, 33.5, 0] }),
        aparelho('aparelho 2', 29, 3),
        aparelho('aparelho 1', 19, 0),
      ])
    },
  },

  'passo-3-conferencia': {
    meta: { gatilho: 'viewport, stagger 120 ms', loop: false, uso: 'Como funciona — 3 Conferência', curvas: ['settle'] },
    gerar: (cor) => composicao('passo-3-conferencia', 48, 48, 12, [
      camada(0, 'lupa', 'traco', [grupo('lupa', [
        elipse(13, [0, 0]), caminho([[5, 5], [10, 10]]),
        corte(0, anim([[1, 0, 'settle'], [10, 100]])), traco(cor('traco'), 3),
      ])], {
        p: anim([[0, [38, 38, 0], 'settle'], [11, [29, 28, 0]]]),
        o: anim([[0, 0, 'settle'], [4, 100]]),
      }),
      camada(0, 'aparelho', 'detalhe', [grupo('aparelho', [
        retangulo(16, 26, 3), caminho([[-2.5, -9.5], [2.5, -9.5]]), preenche(cor('fundo')), traco(cor('detalhe'), 2),
      ])], { p: [19, 22, 0], s: anim([[0, [88, 88, 100], 'settle'], [8, [100, 100, 100]]]) }),
    ]),
  },

  'passo-4-repasse': {
    meta: { gatilho: 'viewport, stagger 120 ms', loop: false, uso: 'Como funciona — 4 Repasse fechado (vendedor → comprador)', curvas: ['pass', 'settle'] },
    gerar: (cor) => composicao('passo-4-repasse', 48, 48, 12, [
      camada(0, 'seta', 'acao', [
        grupo('haste', [caminho([[-6, 0], [6, 0]]), corte(0, anim([[0, 0, 'pass'], [7, 100]])), traco(cor('acao'), 2.5)]),
        grupo('ponta', [caminho([[3, -4], [7, 0], [3, 4]]),
          corte(anim([[5, 50, 'settle'], [11, 0]]), anim([[5, 50, 'settle'], [11, 100]])), traco(cor('acao'), 2.5)]),
      ], { p: [24, 24, 0] }),
      camada(0, 'comprador', 'traco', [grupo('loja', [retangulo(10, 12, 2), traco(cor('traco'), 2.5)])],
        { p: [40, 24, 0], s: anim([[6, [70, 70, 100], 'settle'], [11, [100, 100, 100]]]), o: anim([[6, 0, 'settle'], [9, 100]]) }),
      camada(0, 'vendedor', 'traco', [grupo('loja', [retangulo(10, 12, 2), traco(cor('traco'), 2.5)])], { p: [8, 24, 0] }),
    ]),
  },

  // 18 quadros = 600 ms. O ÚNICO overshoot do site: o check cresce até 108% (q12) e assenta em 100% (q17) — com 0,9%
  // (~0,1 px) ninguém via a comemoração.
  'enviado-sucesso': {
    meta: {
      gatilho: 'manual (envio do formulário, quando a pessoa volta para a aba)', loop: false, uso: 'confirmação de formulário (a comemoração: o único overshoot do site, 108%)', curvas: ['settle'],
      naoPedido: { invertida: 'o formulário fica sempre em bloco claro' },
    },
    gerar: (cor) => composicao('enviado-sucesso', 48, 48, 18, [
      camada(0, 'check', 'traco', [grupo('check', [
        caminho([[-7.5, 0.5], [-2.5, 5.5], [8, -5.5]]),
        corte(0, anim([[5, 0, 'settle'], [14, 100]])), traco(cor('traco'), 3.5),
      ])], { p: [24, 24, 0], s: anim([[5, [70, 70, 100], 'settle'], [12, [108, 108, 100], 'settle'], [17, [100, 100, 100]]]) }),
      camada(0, 'anel', 'detalhe', [grupo('anel', [
        elipse(38), corte(0, anim([[0, 0, 'settle'], [11, 100]])), traco(cor('detalhe'), 3),
      ], { r: -90 })], { p: [24, 24, 0], s: anim([[0, [84, 84, 100], 'settle'], [12, [100, 100, 100]]]) }),
    ]),
  },

  // 36 quadros = 1,2 s por ciclo. Três caixas do lote sobem e assentam em sequência,
  // voltam todas ao repouso no quadro 30 e seguram até 36 → loop limpo.
  'carregando-lote': {
    meta: {
      gatilho: 'loop enquanto pendente', loop: true, uso: 'envio pendente', curvas: ['pass (sobe)', 'settle (assenta)'],
      naoPedido: { invertida: 'o formulário fica sempre em bloco claro' },
    },
    gerar: (cor) => {
      const caixa = (n, x, t0) => camada(0, `caixa ${n}`, 'traco', [grupo('caixa', [retangulo(9, 9, 1.5), traco(cor('traco'), 2.5)])], {
        p: anim([[t0, [x, 29.5, 0], 'pass'], [t0 + 8, [x, 21, 0], 'settle'], [t0 + 18, [x, 29.5, 0]]]),
      })
      return composicao('carregando-lote', 48, 48, 36, [
        caixa(1, 12, 0), caixa(2, 24, 6), caixa(3, 36, 12),
        camada(0, 'bancada', 'neutro', [grupo('linha', [caminho([[6, 0], [42, 0]]), traco(cor('neutro'), 2)])], { p: [0, 37, 0] }),
      ])
    },
  },

  // 15 quadros = 500 ms. Caixa aberta, sem lote dentro.
  'lote-vazio': {
    meta: {
      gatilho: 'viewport 1x', loop: false, uso: 'loja sem resultado', curvas: ['settle'],
      naoPedido: { invertida: 'o estado vazio da loja fica sempre em bloco claro' },
    },
    gerar: (cor) => composicao('lote-vazio', 48, 48, 15, [
      camada(0, 'abas', 'neutro', [grupo('abas', [
        caminho([[-15, 0], [-21, -7]]), caminho([[15, 0], [21, -7]]),
        corte(0, anim([[5, 0, 'settle'], [14, 100]])), traco(cor('neutro'), 2.5),
      ])], { p: [24, 21, 0] }),
      camada(0, 'caixa', 'traco', [grupo('caixa', [
        caminho([[-15, 0], [-15, 18], [15, 18], [15, 0]]), caminho([[-15, 0], [15, 0]]),
        corte(0, anim([[0, 0, 'settle'], [10, 100]])), traco(cor('traco'), 2.5),
      ])], { p: [24, 30, 0], a: [0, 9, 0], s: anim([[0, [92, 92, 100], 'settle'], [10, [100, 100, 100]]]) }),
    ]),
  },

  // 24 quadros = 800 ms. O ícone do botão fixo é o glifo do WhatsApp (SVG estático, simple-icons); o Lottie é SÓ o pulso
  // de atenção em volta dele: dois anéis que se abrem e somem (settle), o 2º 6 quadros depois. Poster (23) = os dois
  // anéis apagados: em repouso o Lottie não desenha nada, e o ícone nunca anima (os dois nunca animam o mesmo elemento).
  'whatsapp-nudge': {
    meta: {
      gatilho: 'manual, máx 2x por visita', loop: false, uso: 'botão fixo de WhatsApp: pulso de atenção em volta do ícone (o ícone é SVG estático)', curvas: ['settle'],
      naoPedido: { normal: 'o botão fixo é petróleo: o site pede só a invertida' },
    },
    gerar: (cor) => {
      const anel = (nm, t0) => camada(0, nm, 'detalhe', [grupo('anel', [elipse(28), traco(cor('detalhe'), 2)])], {
        p: [24, 24, 0],
        // o anel nasce a 107% (30 px, 3 px fora do glifo) e acende em 2 quadros antes de abrir e sumir (a 86%, em cima do
        // contorno do glifo, ele parecia engrossar)
        s: anim([[t0, [107, 107, 100], 'settle'], [t0 + 17, [155, 155, 100]]]),
        o: anim([[t0, 0, 'settle'], [t0 + 2, 85, 'settle'], [t0 + 17, 0]]),
      })
      return composicao('whatsapp-nudge', 48, 48, 24, [anel('pulso 2', 6), anel('pulso 1', 0)])
    },
  },
}

const POSTER = { 'scan-imei-nf': 22, 'carregando-lote': 0 }
// quadro em que a animação "conclui" algo que o site espera (BrandLottie emite 'marco'): a varredura do scan termina no 44
// (o loop vai a 60): o selo carimba ali, sem a pausa morta de 533 ms
const MARCO = { 'scan-imei-nf': 44 }

mkdirSync(PASTA, { recursive: true })
const manifesto = {}
for (const [chave, { meta, gerar }] of Object.entries(CATALOGO)) {
  const saida = {}
  for (const [sufixo, idx] of [['', 0], ['-invertida', 1]]) {
    const json = gerar((papel) => HEX[PAPEL[papel][idx]])
    const texto = JSON.stringify(json)
    writeFileSync(join(PASTA, `${chave}${sufixo}.json`), texto)
    saida[sufixo || 'normal'] = { json, bytes: Buffer.byteLength(texto) }
  }
  const { json } = saida.normal
  manifesto[chave] = {
    arquivo: `${chave}.json`,
    arquivoInvertido: `${chave}-invertida.json`,
    bytes: saida.normal.bytes,
    bytesInvertido: saida['-invertida'].bytes,
    duracaoMs: Math.round((json.op / json.fr) * 1000),
    fps: json.fr,
    quadros: json.op,
    largura: json.w,
    altura: json.h,
    posterFrame: POSTER[chave] ?? json.op - 1,
    ...(MARCO[chave] != null ? { marco: MARCO[chave] } : {}),
    gatilho: meta.gatilho,
    loop: meta.loop,
    uso: meta.uso,
    curvas: meta.curvas,
    // arquivo que o site público nunca pede, e por quê: a bancada de componentes (só no dev) pede todos
    ...(meta.naoPedido ? { naoPedido: Object.fromEntries(Object.entries(meta.naoPedido).map(([v, motivo]) => [v === 'normal' ? `${chave}.json` : `${chave}-invertida.json`, motivo])) } : {}),
    licenca: 'autoria própria',
  }
}
writeFileSync(join(PASTA, 'manifest.json'), JSON.stringify(manifesto, null, 2) + '\n')
console.log(`OK ${Object.keys(manifesto).length} animações (+ invertidas) em ${PASTA}`)
