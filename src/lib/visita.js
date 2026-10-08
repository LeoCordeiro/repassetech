/**
 * "Uma vez por visita" num lugar só (hero, selos dos cards, selo da Confiança e da Home, nudge).
 * Memória do módulo vale até a aba recarregar. Com `guardar`, vai também para o sessionStorage e sobrevive ao F5:
 * hoje só `rt-hero-visto` e `rt-nudge` — as duas chaves que a Política de privacidade descreve. Chave nova guardada
 * = texto novo na política (PaginaPrivacidade, seção Cookies e armazenamento).
 */
/** Abertura do hero já vista nesta visita (sessionStorage): o hero e a transição de rota leem a mesma chave. */
export const CHAVE_HERO = 'rt-hero-visto'

const memoria = new Map()
if (import.meta.env?.DEV) globalThis.__rtVisita = memoria // só no dev: inspeção pelo console (selo não toca de novo no filtro)

function lerSessao(chave) {
  try {
    return sessionStorage.getItem(chave)
  } catch {
    return null // storage bloqueado: fica só a memória
  }
}
function gravarSessao(chave, valor) {
  try {
    sessionStorage.setItem(chave, valor)
    return true
  } catch {
    return false
  }
}

export const jaFoi = (chave, guardar = false) => memoria.has(chave) || (guardar && lerSessao(chave) === '1')
export function marcar(chave, guardar = false) {
  memoria.set(chave, true)
  if (guardar) gravarSessao(chave, '1')
}
/** true na 1ª chamada da visita (e já marca); false nas seguintes. */
export function umaVez(chave, guardar = false) {
  if (jaFoi(chave, guardar)) return false
  marcar(chave, guardar)
  return true
}

/** Valor JSON da visita (contador do nudge). `ok` diz se o sessionStorage funcionou. */
export function lerValor(chave, padrao) {
  const bruto = lerSessao(chave)
  if (bruto !== null) {
    try {
      return { valor: JSON.parse(bruto), ok: true }
    } catch {
      /* lixo no storage: cai no padrão */
    }
  }
  return { valor: memoria.get(chave) ?? padrao, ok: storageFunciona() }
}
export function gravarValor(chave, valor) {
  memoria.set(chave, valor)
  return gravarSessao(chave, JSON.stringify(valor))
}
function storageFunciona() {
  try {
    sessionStorage.getItem('rt-teste')
    return true
  } catch {
    return false
  }
}
