// Monta a mensagem e o link wa.me. Nada vai para servidor nosso: o texto abre no WhatsApp da pessoa.
import { WHATSAPP_NUMBER } from '../config/site.js'

// build de produção: o destino é SEMPRE o número do build. `opcoes.numero` só vale em dev e
// no node (scripts/unidade.mjs): ligado a um ?numero= no futuro, viraria phishing pelo próprio domínio.
const PRODUCAO = Boolean((import.meta.env || {}).PROD)
export { cnpjValido, mascararCnpj } from './cnpj.js'

const TETO = 1800
const PADRAO = {
  VENDER: { titulo: 'Lote para conferência', rodape: '(preenchido no formulário Quero vender do site)' },
  COMPRAR: { titulo: 'Pedido de reposição', rodape: '(preenchido no formulário Quero comprar do site)' },
  CONTATO: { titulo: 'Olá, vim pelo site da Repasse Tech.', rodape: '' },
}
// toWellFormed: um substituto UTF-16 solto (colado de outro app) faria o encodeURIComponent lançar URIError
const limpa = (v) => {
  const s = String(v ?? '')
  return (s.toWellFormed ? s.toWellFormed() : s).replace(/\s+/g, ' ').trim()
}
const grafemas = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('pt-BR', { granularity: 'grapheme' }) : null
/**
 * Sem Intl.Segmenter: corta por ponto de código e PARA no 1º que não cabe (pular o emoji e
 * continuar transformaria "ab📱c" cortado em 3 em "abc"). Exportado para o teste de unidade cobrir o caminho que o
 * navegador moderno não usa.
 */
export function cortarSemSegmenter(s, max) {
  let a = ''
  for (const c of s) {
    if (a.length + c.length > max) break
    a += c
  }
  return a
}
/** Corta em no máximo `max` unidades UTF-16 SEM partir emoji nem acento: o corte cai sempre entre grafemas. */
export function cortar(s, max) {
  if (s.length <= max) return s
  if (!grafemas) return cortarSemSegmenter(s, max)
  let fim = 0
  for (const { segment, index } of grafemas.segment(s)) {
    if (index + segment.length > max) break
    fim = index + segment.length
  }
  return s.slice(0, fim)
}

/**
 * @param {'VENDER'|'COMPRAR'|'CONTATO'} tipo
 * @param {Array<[string, any]>} campos pares [Rótulo, valor]; vazio é omitido. Acima do teto corta 'Observações' e, se
 *   ainda não couber, o MAIOR valor (campo ou resumo) — nunca o título, a linha do aceite e o rodapé (cortar o
 *   fim do texto apagaria justo a linha do aceite).
 * @param {{ titulo?: string, resumo?: string, rodape?: string, aceite?: string, numero?: string }} [opcoes] resumo = 2ª linha
 *   (a notificação do WhatsApp mostra as duas primeiras); aceite = linha do aceite dos Termos, logo antes do rodapé (só os
 *   formulários [VENDER]/[COMPRAR])
 * @returns {{ texto: string, url: string }}
 */
export function montarMensagem(tipo, campos = [], opcoes = {}) {
  if (!PADRAO[tipo]) throw new Error(`[whatsapp] tipo inválido: ${tipo}`)
  const { titulo, rodape, aceite } = { ...PADRAO[tipo], ...opcoes }
  const linhas = campos.map(([r, v]) => [limpa(r), limpa(v)]).filter(([, v]) => v)
  const resumo = ['', limpa(opcoes.resumo)] // mesmo formato das linhas: o corte trata os dois igual
  const montar = () =>
    [`[${tipo}] ${limpa(titulo)}`.trim(), resumo[1], ...linhas.map(([r, v]) => `${r}: ${v}`), limpa(aceite), rodape].filter(Boolean).join('\n')
  let texto = montar()
  const encurtar = (l) => {
    const sobra = l[1].length - (texto.length - TETO) - 1
    l[1] = sobra > 0 ? `${cortar(l[1], sobra).trimEnd()}…` : '…'
    texto = montar()
  }
  const obs = linhas.find(([r]) => r === 'Observações')
  if (texto.length > TETO && obs) encurtar(obs)
  // ainda acima: o maior valor de campo (ou o resumo), um de cada vez, até caber
  for (let i = 0; texto.length > TETO && i < linhas.length + 1; i++) {
    const maior = [resumo, ...linhas].reduce((m, l) => (l[1].length > m[1].length ? l : m))
    if (maior[1].length <= 1) break
    encurtar(maior)
  }
  if (texto.length > TETO) throw new Error(`[whatsapp] a mensagem não cabe em ${TETO} caracteres`) // o envio mostra o estado "erro"
  const numero = (PRODUCAO ? undefined : opcoes.numero) ?? WHATSAPP_NUMBER
  return { texto, url: `https://wa.me/${numero}?text=${encodeURIComponent(texto)}` }
}

/** Link geral do site (botão fixo, Contato): prefixo [CONTATO] e, quando vier, a página de onde a pessoa chamou. */
export const linkContato = (pagina = '') => montarMensagem('CONTATO', [['Página', pagina]]).url

/** 5513991234567 → (13) 99123-4567 */
export function formatarWhatsapp(n = WHATSAPP_NUMBER) {
  const d = String(n).replace(/\D/g, '').replace(/^55/, '')
  const m = d.match(/^(\d{2})(\d{4,5})(\d{4})$/)
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : n
}
