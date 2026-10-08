/**
 * IntersectionObserver com limiar que vale em todo navegador. Com threshold > 0, o `isIntersecting` do Chrome só fica true a
 * partir do limiar; pela especificação (Firefox, Safari) ele é true com qualquer pixel na tela, e o aviso também chega na
 * entrada e na saída. Por isso: thresholds a partir do 0 (o 0 garante o aviso de saída em todo motor) e "dentro" =
 * intersectionRatio ≥ limiar. Sem isso, fora do Chrome o selo carimbava com 1% na tela.
 * Elemento mais alto que a tela (a grade inteira do catálogo no celular) nunca chega à fração do limiar: para ele, "dentro"
 * é cobrir a mesma fração da altura da tela — e os degraus intermediários garantem o aviso no caminho.
 */
export const cruzou = (e, limiar) =>
  e.isIntersecting && (e.intersectionRatio >= limiar - 0.001 || (!!e.rootBounds && e.intersectionRect.height >= limiar * e.rootBounds.height))

/** Observer com [0, ¼, ½, ¾ e o limiar]; null sem IntersectionObserver (quem chama decide o que fazer). */
export function observadorComLimiar(limiar, aoMudar, opcoes = {}) {
  if (typeof IntersectionObserver === 'undefined') return null
  return new IntersectionObserver(aoMudar, { ...opcoes, threshold: [0, limiar / 4, limiar / 2, (3 * limiar) / 4, limiar] })
}
