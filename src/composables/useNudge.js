/**
 * whatsapp-nudge: no máximo 2 por visita, contador `rt-nudge` no sessionStorage ({ n, pagina }:
 * quantas vezes tocou e em qual rota — descrito na Política de privacidade).
 * 1º: o fim do conteúdo (#fim-conteudo, antes do rodapé) entra na tela, ou --nudge-permanencia na página com rolagem
 *     ≥ 50%. Nunca antes de --nudge-espera da carga. 2º: o mesmo gatilho numa OUTRA página da visita.
 * Nunca: campo em foco, menu aberto, hero animando, depois de envio de formulário, em /contato e nos três documentos
 * (/privacidade, /termos, /politica-de-repasse: documento não tem Lottie), depois de a pessoa clicar no botão (contador
 * vai a 2), com reduzir movimento. Aba oculta: adia. O fim do conteúdo visto com o botão ainda escondido (antes de
 * ele entrar, ou sobre um controle) fica GUARDADO: `tentarDeNovo()` (o botão chama quando aparece) dispara o nudge — sem isso ele se perdia.
 * Troca de rota: o estado da página zera NA HORA (senão o relógio velho dispara na página nova); só o observer da
 * sentinela espera a página nova assentar (--rede-rota), para não pegar o fim da página que está saindo.
 */
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ui } from '@/lib/ui'
import { ms } from '@/lib/motion'
import { gravarValor, lerValor } from '@/lib/visita'
import { reduzirAgora } from './useReduzirMovimento'

const CHAVE = 'rt-nudge'
const MAX = 2
const SEM_NUDGE = ['/contato', '/privacidade', '/termos', '/politica-de-repasse']
const CARGA = typeof performance !== 'undefined' ? performance.now() : 0
const campoEmFoco = () => document.activeElement?.matches?.('input, textarea, select, [contenteditable="true"]')

/** @param {{ tocar: () => void, ativo: () => boolean }} p */
export function useNudge({ tocar, ativo }) {
  const route = useRoute()
  let disparouAqui = false
  let fimVisto = false
  let maxRolagem = 0
  let tPagina = 0
  let relogio = 0
  let timers = []
  let io = null

  const ler = () => lerValor(CHAVE, { n: 0, pagina: '' })
  const pode = () => {
    const { valor: s, ok } = ler()
    const max = ok ? MAX : 1
    return (
      ativo() && !disparouAqui && s.n < max && s.pagina !== route.path && !SEM_NUDGE.includes(route.path) &&
      !ui.menuAberto && !ui.heroAnimando && !ui.formEnviado && !reduzirAgora() && !campoEmFoco()
    )
  }
  const depois = (fn, t) => timers.push(setTimeout(fn, t))
  const tentar = () => {
    if (!pode()) return
    if (document.visibilityState !== 'visible') return document.addEventListener('visibilitychange', tentar, { once: true })
    const falta = ms('--nudge-espera') - (performance.now() - CARGA)
    if (falta > 0) return depois(tentar, falta)
    gravarValor(CHAVE, { n: ler().valor.n + 1, pagina: route.path })
    disparouAqui = true
    tocar()
  }
  const aoRolar = () => {
    const h = document.documentElement
    const r = (window.scrollY + window.innerHeight) / Math.max(h.scrollHeight, 1)
    maxRolagem = Math.max(maxRolagem, r)
  }
  function zerar() {
    disparouAqui = false
    fimVisto = false
    maxRolagem = 0
    tPagina = performance.now()
    timers.forEach(clearTimeout)
    timers = []
    io?.disconnect()
    io = null
    clearInterval(relogio)
    relogio = setInterval(() => {
      if (performance.now() - tPagina >= ms('--nudge-permanencia') && maxRolagem >= 0.5) tentar()
    }, ms('--nudge-tick'))
  }
  function observarFim() {
    const fim = document.getElementById('fim-conteudo')
    if (!fim || typeof IntersectionObserver === 'undefined') return
    io?.disconnect()
    io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return
      fimVisto = true
      tentar()
    })
    io.observe(fim)
  }

  onMounted(() => {
    window.addEventListener('scroll', aoRolar, { passive: true })
    zerar()
    observarFim()
  })
  watch(
    () => route.path,
    () => {
      zerar()
      depois(observarFim, ms('--rede-rota'))
    },
  )
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', aoRolar)
    document.removeEventListener('visibilitychange', tentar)
    clearInterval(relogio)
    timers.forEach(clearTimeout)
    io?.disconnect()
  })

  return {
    /** Clicou no botão: a conversa já está na frente da pessoa, não oferece mais. */
    registrarClique: () => gravarValor(CHAVE, { n: MAX, pagina: route.path }),
    /** O botão apareceu: o fim do conteúdo que chegou com ele escondido conta agora. */
    tentarDeNovo: () => fimVisto && tentar(),
  }
}
