/**
 * Reveal reutilizável: diretiva `v-reveal` + composable `useReveal`.
 * Um único IntersectionObserver (20% do bloco na tela, rootMargin -10% embaixo), once.
 * Escondido só existe sob `.js:not(.rm)` (base.css). Na tela ao montar = entra com a rota, sem transição.
 *
 *   v-reveal                                   bloco
 *   v-reveal="{ distancia: 'sm'|'md'|'lg', atraso: 120, grupo: true, stagger: 'linha'|'card'|'passo' }"
 *     grupo: os filhos com `data-reveal-item` revelam em stagger (índice limitado a 5)
 */
import { onBeforeUnmount, onMounted, ref, unref } from 'vue'
import { reduzirAgora } from './useReduzirMovimento'
import { doisQuadros, ms } from '@/lib/motion'
import { cruzou, observadorComLimiar } from '@/lib/visivel'

const temIO = typeof IntersectionObserver !== 'undefined'
const acoes = new WeakMap()
const LIMIAR = 0.2
let io = null
// "na tela" = 20% do bloco, pela intersectionRatio em qualquer navegador (lib/visivel.js)
const observador = () =>
  (io ??= observadorComLimiar(
    LIMIAR,
    (es) =>
      es.forEach((e) => {
        if (!cruzou(e, LIMIAR)) return
        io.unobserve(e.target)
        acoes.get(e.target)?.()
      }),
    { rootMargin: '0px 0px -10% 0px' },
  ))

const naTela = (el) => {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight && (r.width > 0 || r.height > 0)
}
const semAnimacao = () => !temIO || reduzirAgora() || !document.documentElement.classList.contains('js')

if (typeof window !== 'undefined') {
  window.addEventListener('beforeprint', () =>
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => el.classList.add('is-revealed')),
  )
}

function indexar(el) {
  el.querySelectorAll('[data-reveal-item]').forEach((item, i) => item.style.setProperty('--i', i))
}

export const vReveal = {
  mounted(el, { value = {} }) {
    const { distancia = 'md', atraso = 0, grupo = false, stagger = 'card' } = value || {}
    el.dataset.reveal = ''
    el.style.setProperty('--reveal-shift', `var(--shift-${distancia})`)
    el.style.setProperty('--reveal-stagger', `var(--stagger-${stagger})`)
    if (atraso) el.style.setProperty('--reveal-atraso', `${atraso}ms`)
    if (grupo) {
      el.dataset.revealGrupo = ''
      indexar(el)
    }
    const revelar = (instante = false) => {
      if (el.classList.contains('is-revealed')) return
      if (instante) el.classList.add('reveal-instante')
      el.classList.add('is-revealed')
      io?.unobserve(el)
      if (instante) doisQuadros(() => el.classList.remove('reveal-instante'))
    }
    const aoFocar = () => revelar(true)
    el.addEventListener('focusin', aoFocar)
    el._reveal = { revelar, aoFocar }
    if (semAnimacao()) return revelar(true)
    // espera o layout da rota nova (a rolagem para o topo acontece no after-leave)
    doisQuadros(() => {
      if (!el.isConnected) return
      if (naTela(el)) return revelar(true)
      acoes.set(el, () => revelar())
      observador().observe(el)
    })
  },
  updated(el) {
    if (el.dataset.revealGrupo !== undefined) indexar(el)
  },
  beforeUnmount(el) {
    io?.unobserve(el)
    acoes.delete(el)
    if (el._reveal) el.removeEventListener('focusin', el._reveal.aoFocar)
  },
}

/**
 * Para coreografia que espera evento (loja esperando a costura).
 * Rede de segurança: se o alvo entra na tela e ninguém chamou `revelar()` em `esperar` (token do motion.css), revela sozinho;
 * `agora()` true quando o alvo entra = revela na hora (quem chega por baixo, com a costura já acima da
 * tela, não espera 450 ms com a grade vazia); `focusin` revela na hora; sem IO ou com reduzir movimento, revela no mount.
 */
export function useReveal(alvo, { esperar = '--espera-costura', agora = null } = {}) {
  const revelado = ref(false)
  let timer = 0
  const revelar = () => {
    if (revelado.value) return
    revelado.value = true
    clearTimeout(timer)
    const el = unref(alvo)
    if (el && io) io.unobserve(el)
  }
  const aoFocar = () => revelar()
  onMounted(() => {
    const el = unref(alvo)
    if (!el) return
    el.addEventListener('focusin', aoFocar)
    if (semAnimacao()) return revelar()
    acoes.set(el, () => {
      if (agora?.()) return revelar()
      timer = setTimeout(revelar, esperar ? ms(esperar) : 0)
    })
    observador().observe(el)
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    const el = unref(alvo)
    if (!el) return
    io?.unobserve(el)
    acoes.delete(el)
    el.removeEventListener('focusin', aoFocar)
  })
  return { revelar, revelado }
}
