/**
 * Durações do JS lidas dos tokens de src/styles/motion.css (o único lugar com duração do projeto).
 * Sob reduzir movimento (.rm) os tokens de movimento valem 0 no próprio CSS, e o JS segue junto. Token que não existe = erro
 * no console em dev e 0.
 * Cache por token (sem ele, cada leitura era um getComputedStyle: 11 ms de recálculo na montagem a CPU 4×).
 * O valor só muda com a classe .rm (useReduzirMovimento chama limparTokens) e com a largura (tokens do hero ≥ 1024: resize).
 */
const cache = new Map()
export const limparTokens = () => cache.clear()
if (typeof window !== 'undefined') window.addEventListener('resize', limparTokens, { passive: true })

export function ms(token) {
  if (typeof document === 'undefined') return 0
  if (cache.has(token)) return cache.get(token)
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  if (!v) {
    if (import.meta.env?.DEV) console.error(`[motion] ${token} não existe em src/styles/motion.css`)
    return 0
  }
  const n = parseFloat(v)
  const valor = Number.isNaN(n) ? 0 : v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n
  cache.set(token, valor)
  return valor
}

/** Dois quadros: o estado novo já foi pintado (troca de classe sem transição, depois religa). Um lugar só. */
export const doisQuadros = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn))

/** requestIdleCallback com fallback por token (sem número solto). */
const quandoOcioso = (fn, tokenFallback) =>
  typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(fn) : setTimeout(fn, ms(tokenFallback))

/**
 * Pré-carga fora do caminho crítico: só depois do `load` + --espera-pre-carga e, aí, no ocioso. Antes, o
 * requestIdleCallback era atendido enquanto a thread esperava a rede da rota, e 113 KB que a tela não usava disputavam a 4G
 * com os 45 KB que ela precisava.
 */
export function depoisDaCarga(fn, tokenFallback) {
  if (typeof window === 'undefined') return
  const agendar = () => setTimeout(() => quandoOcioso(fn, tokenFallback), ms('--espera-pre-carga'))
  if (document.readyState === 'complete') agendar()
  else window.addEventListener('load', agendar, { once: true })
}
