/**
 * Preço digitado no formulário → número. Aceita o jeito brasileiro e o com ponto decimal:
 *   "1.250" → 1250 · "1.250,50" → 1250.5 · "1250" → 1250 · "12,5" → 12.5 · "1250.5" → 1250.5 · "R$ 850,00" → 850
 * Ponto seguido de exatamente 3 dígitos é milhar; ponto com 1–2 casas é decimal. Inválido → NaN.
 * Teste: node scripts/unidade.mjs
 */
export function lerPreco(v) {
  const s = String(v ?? '').trim().replace(/\s|R\$/g, '')
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) return Number(s.replace(/\./g, '').replace(',', '.')) // 1.250 · 1.250,50
  if (/^\d+(,\d{1,2})?$/.test(s)) return Number(s.replace(',', '.')) // 1250 · 12,5
  if (/^\d+\.\d{1,2}$/.test(s)) return Number(s) // 1250.5
  return NaN
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
/** 1250 → "R$ 1.250,00" (espaço normal entre R$ e o número, sem o U+00A0 do Intl). */
export const formatarPreco = (n) => BRL.format(n).replace(/\s/g, ' ')
