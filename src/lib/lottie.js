/**
 * Player do Lottie e os JSON da marca, sob demanda (manifest + observers compartilhados).
 * Só o BrandLottie.vue importa daqui. `lottie_light` só desenha SVG e não usa eval: passa em CSP sem unsafe-eval.
 * Os JSON saem de scripts/lottie-gerar.mjs (npm run lottie:gerar): não editar à mão em src/assets/lottie.
 */
import manifest from '../assets/lottie/manifest.json'
import urlPlayer from 'lottie-web/build/player/lottie_light.min.js?url'
import { depoisDaCarga, ms } from './motion'
import { cruzou } from './visivel'

export { manifest }

const arquivos = import.meta.glob(['../assets/lottie/*.json', '!../assets/lottie/manifest.json'], { import: 'default' })

/**
 * O player é um <script> clássico do próprio site (o UMD do lottie_light põe o window.lottie), pedido uma vez. Uma falha
 * passageira (rede que caiu no meio) NÃO fica guardada: o próximo pedido tenta de novo, com ?tentativa=N. Com import(), o
 * navegador guarda a falha no mapa de módulos e nunca mais pede a mesma URL: nenhum Lottie da visita tocava mais.
 */
let player = null
let tentativa = 0
export function carregarPlayer() {
  player ??= new Promise((pronto, falhou) => {
    if (window.lottie?.loadAnimation) return pronto(window.lottie)
    const s = document.createElement('script')
    s.src = tentativa ? `${urlPlayer}?tentativa=${tentativa}` : urlPlayer
    s.async = true
    s.onload = () => (window.lottie?.loadAnimation ? pronto(window.lottie) : falhou(new Error('[lottie] o player carregou sem o window.lottie')))
    s.onerror = () => {
      s.remove()
      falhou(new Error('[lottie] o player não carregou'))
    }
    document.head.append(s)
  }).catch((e) => {
    player = null
    tentativa++
    throw e
  })
  return player
}

/** Cópia nova a cada uso: o player reescreve o objeto que recebe. */
export async function carregarAnimacao(arquivo) {
  const carregar = arquivos[`../assets/lottie/${arquivo}`]
  if (!carregar) throw new Error(`arquivo "${arquivo}" não está em src/assets/lottie`)
  return structuredClone(await carregar())
}

// ---- observers compartilhados: "perto" carrega, "visível" toca/pausa ----
const LIMIAR_VISIVEL = 0.4
const callbacks = new WeakMap()
let ioPerto = null
let ioVisivel = null

/**
 * observar(el, { perto(entry), visivel({ isIntersecting }) }) — `perto` dispara uma vez (rootMargin 300px) e desliga;
 * `visivel` dispara a cada entrada/saída: "dentro" = 40% da caixa na tela, medido pela intersectionRatio em qualquer
 * navegador (lib/visivel.js). Sem IntersectionObserver: perto e visível na hora.
 */
export function observar(el, { perto, visivel } = {}) {
  if (typeof IntersectionObserver !== 'undefined') {
    ioPerto ??= new IntersectionObserver((es) => es.forEach((e) => callbacks.get(e.target)?.perto?.(e)), { rootMargin: '300px 0px' })
    ioVisivel ??= new IntersectionObserver(
      (es) => es.forEach((e) => callbacks.get(e.target)?.visivel?.({ isIntersecting: cruzou(e, LIMIAR_VISIVEL), target: e.target })),
      { threshold: [0, LIMIAR_VISIVEL] },
    )
  }
  const reg = {}
  if (perto)
    reg.perto = (e) => {
      if (!e.isIntersecting) return
      ioPerto?.unobserve(el)
      perto(e)
    }
  if (visivel) reg.visivel = visivel
  callbacks.set(el, reg)
  if (!ioPerto) {
    perto?.({ isIntersecting: true })
    visivel?.({ isIntersecting: true })
    return
  }
  if (perto) ioPerto.observe(el)
  if (visivel) ioVisivel.observe(el)
}

export function desobservar(el) {
  ioPerto?.unobserve(el)
  ioVisivel?.unobserve(el)
  callbacks.delete(el)
}

/**
 * Teto de Lottie tocando ao mesmo tempo (sem ele eram 7 na Home a 1440).
 * `pedirVez(quem, tocar, desistir)`: com vaga, ocupa e toca; sem vaga, espera --espera-vez-lottie por uma e, se não abrir,
 * `desistir()` (o BrandLottie fica no poster: nunca um buraco). `liberarVez(quem)` no fim, na pausa e na destruição.
 * O pedido é IDEMPOTENTE por quem pede: quem já está na fila não entra de novo (o 2º pedido desistia depois e parava no
 * poster quem já tinha ganhado a vaga, que ficava contada como tocando até desmontar). E desistir nunca derruba quem já
 * está tocando.
 */
const TETO_TOCANDO = 5
const tocando = new Set()
const fila = []
export function pedirVez(quem, tocar, desistir) {
  if (tocando.has(quem) || tocando.size < TETO_TOCANDO) {
    tocando.add(quem)
    return tocar()
  }
  const ja = fila.find((x) => x.quem === quem)
  if (ja) return void (ja.tocar = tocar) // já esperando: vale o pedido mais novo, sem um 2º relógio
  const item = { quem, tocar }
  item.timer = setTimeout(() => {
    const i = fila.indexOf(item)
    if (i >= 0) fila.splice(i, 1)
    if (!tocando.has(quem)) desistir()
  }, ms('--espera-vez-lottie'))
  fila.push(item)
}
export function liberarVez(quem) {
  tocando.delete(quem)
  const i = fila.findIndex((x) => x.quem === quem)
  if (i >= 0) clearTimeout(fila.splice(i, 1)[0].timer)
  while (fila.length && tocando.size < TETO_TOCANDO) {
    const proximo = fila.shift()
    clearTimeout(proximo.timer)
    tocando.add(proximo.quem)
    proximo.tocar()
  }
}

// Player pedido fora do caminho crítico: depois do load. Quem precisa antes (o hero, um card na 1ª tela) já pede sob
// demanda pelo BrandLottie, quando chega perto.
depoisDaCarga(() => void carregarPlayer().catch(() => {}), '--ocioso-lottie')
