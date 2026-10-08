/**
 * Acende itens um a um quando entram na tela (espinha, regras): IO por item, uma vez, com fila de stagger
 * (dois itens que entram juntos disparam com `stagger` ms entre si, nunca juntos).
 * Item já na tela quando a rota monta acende na hora, sem transição ("entra com a rota").
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { reduzirAgora } from './useReduzirMovimento'
import { doisQuadros, ms } from '@/lib/motion'
import { cruzou, observadorComLimiar } from '@/lib/visivel'

/**
 * @param {() => HTMLElement[]} itens
 * @param {{ threshold?: number, stagger?: 'linha'|'card'|'passo', acender: (i: number, instante: boolean) => void }} op
 */
export function useSequencia(itens, { threshold = 0.4, stagger = 'passo', acender }) {
  let io = null
  let ultimo = 0
  let vivo = true // o IO nasce em duplo rAF: se desmontou antes, não cria observer para nó solto
  const timers = []
  const passo = () => ms(`--stagger-${stagger}`) // 0 sob .rm

  onMounted(() => {
    const els = itens()
    if (typeof IntersectionObserver === 'undefined' || reduzirAgora() || !document.documentElement.classList.contains('js'))
      return els.forEach((_, i) => acender(i, true))
    doisQuadros(() => {
      if (!vivo) return
      // "na tela" = a fração `threshold` do item, medida pela intersectionRatio em qualquer navegador (lib/visivel.js)
      io = observadorComLimiar(threshold, (es) =>
        es.forEach((e) => {
          if (!cruzou(e, threshold)) return
          io.unobserve(e.target)
          const i = els.indexOf(e.target)
          const agora = performance.now()
          const atraso = Math.max(0, ultimo + passo() - agora)
          ultimo = agora + atraso
          timers.push(setTimeout(() => acender(i, false), atraso))
        }),
      )
      els.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) acender(i, true)
        else io.observe(el)
      })
    })
  })
  onBeforeUnmount(() => {
    vivo = false
    io?.disconnect()
    timers.forEach(clearTimeout)
  })
}
