// Máscara e dígito verificador do CNPJ, no formato numérico e no alfanumérico (IN RFB 2.229/2024, emitido desde
// julho de 2026): 12 posições [0-9A-Z] + 2 dígitos verificadores numéricos. DV por módulo 11 com os pesos de sempre e
// o valor de cada caractere = código ASCII − 48 ('0'→0 … '9'→9, 'A'→17 … 'Z'→42); no CNPJ só de números dá o mesmo.
// Não consulta Receita/BrasilAPI: nada sai do navegador. Teste: node scripts/unidade.mjs

/**
 * Texto colado com o rótulo na frente ("CNPJ: 11.222…", "CNPJ nº 11…"): o rótulo sai (as letras dele não são do CNPJ).
 * Só com separador (dois-pontos, traço ou espaço) depois: um CNPJ alfanumérico pode começar pelas letras C, N, P e J.
 */
const semRotulo = (v) => String(v ?? '').replace(/^\s*cnpj\s*(?:n[º°o]\.?\s*)?[:\-–]\s*|^\s*cnpj\s+(?:n[º°o]\.?\s*)?/i, '')

/** Só os caracteres que valem, em maiúscula: até 12 de [0-9A-Z] e depois até 2 dígitos (o DV nunca tem letra). */
export function normalizarCnpj(v) {
  let out = ''
  for (const c of semRotulo(v).toUpperCase()) {
    if (out.length < 12 ? /[0-9A-Z]/.test(c) : /[0-9]/.test(c)) out += c
    if (out.length === 14) break
  }
  return out
}

/** "12abc34501de35" → "12.ABC.345/01DE-35" (vai mascarando enquanto digita). */
export function mascararCnpj(v) {
  const d = normalizarCnpj(v)
  let r = d.slice(0, 2)
  if (d.length > 2) r += `.${d.slice(2, 5)}`
  if (d.length > 5) r += `.${d.slice(5, 8)}`
  if (d.length > 8) r += `/${d.slice(8, 12)}`
  if (d.length > 12) r += `-${d.slice(12, 14)}`
  return r
}

/**
 * Onde o cursor fica depois da máscara: logo depois do N-ésimo caractere que vale (letra ou número), N = quantos valiam
 * antes do cursor no texto digitado. Corrigir um caractere no meio deixa o cursor ali, e não no fim.
 */
export function posicaoNaMascara(mascarado, validosAntes) {
  let i = 0
  let n = 0
  while (i < mascarado.length && n < validosAntes) {
    if (/[0-9A-Z]/i.test(mascarado[i])) n++
    i++
  }
  return i
}

/** Dígito verificador de uma base de 12 (1º DV) ou 13 caracteres (2º DV): pesos 2…9 da direita para a esquerda. */
export function digitoCnpj(base) {
  let soma = 0
  let peso = 2
  for (let i = base.length - 1; i >= 0; i--) {
    soma += (base.charCodeAt(i) - 48) * peso
    peso = peso === 9 ? 2 : peso + 1
  }
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

export function cnpjValido(v) {
  const d = normalizarCnpj(v)
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(d) || /^(\d)\1{13}$/.test(d)) return false
  const dv1 = digitoCnpj(d.slice(0, 12))
  return dv1 === Number(d[12]) && digitoCnpj(d.slice(0, 12) + dv1) === Number(d[13])
}

/** O erro do campo CNPJ ('' = em ordem): o incompleto diz quantos faltam; o completo que não confere diz isso. */
export function erroCnpj(v) {
  const d = normalizarCnpj(v)
  if (!d) return 'Informe o CNPJ da empresa.'
  if (d.length < 14) {
    const falta = 14 - d.length
    return `O CNPJ tem 14 caracteres: ${falta === 1 ? 'falta 1' : `faltam ${falta}`}.`
  }
  return cnpjValido(d) ? '' : 'Confira o CNPJ: algum número ou letra não confere.'
}
