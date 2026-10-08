<script setup>
/**
 * A ÚNICA porta para Lottie. Caixa com tamanho fixo desde o 1º quadro (CLS 0);
 * JSON e player sob demanda quando chega perto; viewport toca/pausa; reduzir movimento = posterFrame.
 * Nunca recebe v-reveal, transition ou animation no próprio nó. Cor nunca por CSS: vem cravada na variante.
 * Comportamento:
 *  - prova é para ser vista: `play()` pedido com a caixa fora da tela (< 40% visível) espera ela entrar e
 *    só então toca do quadro 0; enquanto espera, o palco fica escondido (nunca o ponto solto do quadro 0). Vale também para o
 *    play que chega antes do JSON (fila): ele não toca mais no `aoCarregar` se a caixa estiver fora da tela;
 *  - no máximo 5 tocando juntos: `pedirVez` do lib/lottie; sem vaga em --espera-vez-lottie, fica no poster;
 *  - loop com teto de ciclos (scan): ao voltar à tela, recomeça do quadro 0 (2 ciclos inteiros por entrada);
 *  - `marco` (manifest): emitido quando a animação cruza o quadro marcado (o scan termina a varredura no 44);
 *  - `reserva`: o #fallback apareceu (Lottie atrasado ou falhou): quem espera o Lottie para mostrar o invólucro mostra já;
 *  - `tocando`: a animação começou DE VERDADE (depois do JSON, da tela e da vaga): o que encadeia em outro carimbo conta daqui.
 * Pedido antes de o Lottie ficar pronto (o player só chega depois do load): o ÚLTIMO pedido — play() ou poster() — fica
 * guardado e é atendido no aoCarregar, ANTES do evento ready (quem ouve o ready e pede de novo não duplica nada). Sem isso o
 * poster() dos passos que já nascem acesos se perdia e o ícone ficava no quadro 0, em branco.
 */
import { computed, inject, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import { carregarAnimacao, carregarPlayer, desobservar, liberarVez, manifest, observar, pedirVez } from '@/lib/lottie'
import { useReduzirMovimento } from '@/composables/useReduzirMovimento'
import { ms } from '@/lib/motion'

const props = defineProps({
  name: { type: String, required: true },
  trigger: { type: String, default: 'viewport', validator: (v) => ['viewport', 'hover', 'click', 'manual'].includes(v) },
  loop: { type: Boolean, default: null }, // null = manifest[name].loop
  speed: { type: Number, default: 1 },
  decorative: { type: Boolean, default: true },
  ariaLabel: { type: String, default: '' },
  variant: { type: String, default: 'auto', validator: (v) => ['normal', 'invertida', 'auto'].includes(v) },
  size: { type: [Number, Object], default: null }, // largura (altura pela proporção) ou { w, h }
  ciclos: { type: Number, default: 0 }, // loop no viewport: teto de ciclos por entrada (scan = 2); 0 = sem teto
  posterInicial: { type: Boolean, default: false }, // manual: parado no poster em vez do quadro 0
  // o #fallback desde a montagem até o Lottie ficar pronto (quando o desenho parado É o poster: a vaga nunca fica vazia)
  reservaAteCarregar: { type: Boolean, default: false },
  semFila: { type: Boolean, default: false }, // fora do teto de 5 (só a bancada, que mostra o catálogo inteiro de uma vez)
})
const emit = defineEmits(['ready', 'complete', 'marco', 'reserva', 'falha', 'tocando'])

const m = manifest[props.name]
if (!m && import.meta.env.DEV) console.error(`[BrandLottie] chave "${props.name}" não existe no manifest.json`)

const tom = inject('rtTom', null)
const reduzir = useReduzirMovimento()
const variante = computed(() => (props.variant === 'auto' ? (unref(tom) === 'petroleo' ? 'invertida' : 'normal') : props.variant))
const usaLoop = computed(() => props.loop ?? Boolean(m?.loop))
const dims = computed(() => {
  const ar = m ? m.altura / m.largura : 1
  if (typeof props.size === 'number') return { w: props.size, h: Math.round(props.size * ar) }
  if (props.size) return { w: props.size.w, h: props.size.h }
  return { w: m?.largura ?? 48, h: m?.altura ?? 48 }
})
const a11y = computed(() =>
  props.ariaLabel ? { role: 'img', 'aria-label': props.ariaLabel } : props.decorative ? { 'aria-hidden': 'true' } : {},
)

const caixa = ref(null)
const palco = ref(null)
const pronto = ref(false)
const falhou = ref(false)
const atrasado = ref(false)
const adiado = ref(false) // play pedido com a caixa fora da tela: espera ela entrar
const reserva = computed(() => !pronto.value && (falhou.value || atrasado.value || props.reservaAteCarregar))
let anim = null
let vivo = true
let carregando = false
let fila = null // pedido feito antes do Lottie ficar pronto: 'play' | 'poster' | null
let visivel = null // null = o observer ainda não leu
let comecou = false
let terminou = false
let ciclosFeitos = 0
let alvoInterativo = null
let quadroAnterior = -1
const quem = {} // vaga no teto de Lottie tocando (lib/lottie)

const poster = () => {
  adiado.value = false
  liberarVez(quem)
  if (!pronto.value) return void (fila = 'poster')
  anim.goToAndStop(m.posterFrame, true)
}
/** Toca do quadro (0) se houver vaga; sem vaga, mostra o poster enquanto espera e, se a vaga não vier, fica nele. */
function tocar(quadro = 0) {
  terminou = false
  comecou = true
  quadroAnterior = -1
  if (props.semFila) {
    anim.goToAndPlay(quadro, true)
    return emit('tocando')
  }
  let esperando = true
  pedirVez(
    quem,
    () => {
      esperando = false
      anim?.goToAndPlay(quadro, true)
      emit('tocando') // começou de verdade (a vaga veio): quem encadeia no carimbo conta daqui
    },
    () => {
      terminou = true
      anim?.goToAndStop(m.posterFrame, true)
    },
  )
  if (esperando) anim.goToAndStop(m.posterFrame, true)
}
function play() {
  if (!pronto.value) return void (fila = 'play')
  if (reduzir.value) return poster()
  if (visivel !== true) return void (adiado.value = true)
  adiado.value = false
  ciclosFeitos = 0
  tocar(0)
}
const pause = () => {
  liberarVez(quem)
  anim?.pause()
}
const stop = () => {
  liberarVez(quem)
  anim?.stop()
}

/** Retomada pela tela sem vaga: o poster, nunca um quadro do meio (o lote-vazio pausado ficava parado na metade). */
const voltarAoPoster = () => anim?.goToAndStop(m.posterFrame, true)
function aoVisivel(e) {
  visivel = e.isIntersecting
  if (!pronto.value) return
  if (reduzir.value) return poster()
  if (visivel) {
    if (adiado.value) return play()
    if (props.trigger !== 'viewport') return
    if (usaLoop.value) {
      if (props.ciclos && ciclosFeitos >= props.ciclos) return
      // teto de ciclos: cada entrada na tela toca os ciclos inteiros, do quadro 0 (antes voltava do poster 22: 1,65 ciclo)
      if (props.ciclos) return tocar(0)
      return pedirVez(quem, () => anim?.play(), voltarAoPoster)
    }
    if (!terminou) return comecou ? pedirVez(quem, () => anim?.play(), voltarAoPoster) : play()
  } else if (props.trigger === 'viewport') {
    if (!anim.isPaused) pause()
    if (usaLoop.value && props.ciclos) {
      ciclosFeitos = 0 // sai da tela: rearma o teto de ciclos
      poster()
    }
  }
}

function aoCarregar() {
  if (pronto.value || !vivo) return
  pronto.value = true
  atrasado.value = false
  palco.value.__anim = anim
  const pedido = fila
  fila = null
  if (reduzir.value) poster()
  else {
    if (props.posterInicial || pedido === 'poster') poster()
    if (pedido === 'play') play()
    else if (props.trigger === 'viewport' && visivel) aoVisivel({ isIntersecting: true })
  }
  emit('ready', anim) // depois de atender a fila: quem pede de novo no ready não duplica o pedido
}

async function carregar() {
  if (carregando || !m) return
  carregando = true
  const espera = setTimeout(() => !pronto.value && (atrasado.value = true), ms('--espera-lottie'))
  try {
    const arquivo = variante.value === 'invertida' ? m.arquivoInvertido : m.arquivo
    const [lottie, dados] = await Promise.all([carregarPlayer(), carregarAnimacao(arquivo)])
    if (!vivo || !palco.value) return
    anim = lottie.loadAnimation({
      container: palco.value,
      renderer: 'svg',
      loop: usaLoop.value,
      autoplay: false,
      animationData: dados,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })
    anim.setSpeed(props.speed)
    anim.addEventListener('complete', () => {
      terminou = true
      liberarVez(quem)
      emit('complete')
    })
    anim.addEventListener('loopComplete', () => {
      if (props.ciclos && ++ciclosFeitos >= props.ciclos) {
        anim.pause()
        poster()
      }
    })
    if (m.marco != null)
      anim.addEventListener('enterFrame', () => {
        const q = anim.currentFrame
        if (q < quadroAnterior) quadroAnterior = -1 // o loop voltou ao começo
        if (quadroAnterior < m.marco && q >= m.marco) emit('marco')
        quadroAnterior = q
      })
    anim.addEventListener('DOMLoaded', aoCarregar)
    if (anim.isLoaded) aoCarregar()
  } catch (err) {
    console.warn('[lottie]', props.name, err)
    falhou.value = true
    emit('falha', err)
  } finally {
    clearTimeout(espera)
  }
}

const tocarDoZero = () => play()

onMounted(() => {
  observar(caixa.value, { perto: carregar, visivel: aoVisivel })
  if (props.trigger === 'hover' || props.trigger === 'click') {
    alvoInterativo = caixa.value.closest('a, button') || caixa.value
    const eventos = props.trigger === 'hover' ? ['pointerenter', 'focusin'] : ['click']
    eventos.forEach((ev) => alvoInterativo.addEventListener(ev, tocarDoZero))
  }
})

watch(reserva, (v) => v && emit('reserva'))
watch(reduzir, (rm) => {
  if (!anim) return
  if (rm) {
    anim.pause()
    poster()
  } else if (usaLoop.value && visivel && props.trigger === 'viewport') play()
})

onBeforeUnmount(() => {
  vivo = false
  liberarVez(quem)
  if (caixa.value) desobservar(caixa.value)
  if (alvoInterativo) ['pointerenter', 'focusin', 'click'].forEach((ev) => alvoInterativo.removeEventListener(ev, tocarDoZero))
  anim?.destroy()
  anim = null
})

defineExpose({ play, pause, stop, poster, get anim() { return anim } })
</script>

<template>
  <span
    ref="caixa"
    class="rt-lottie"
    :class="{ 'rt-lottie--espera': adiado }"
    :style="{ width: `${dims.w}px`, height: `${dims.h}px` }"
    :data-lottie="name"
    :data-variante="variante"
    v-bind="a11y"
  >
    <span ref="palco" class="rt-lottie__palco" />
    <span v-if="reserva && $slots.fallback" class="rt-lottie__fallback"><slot name="fallback" /></span>
  </span>
</template>

<style>
.rt-lottie { position: relative; display: inline-block; flex: none; vertical-align: middle; transition: none; animation: none; }
.rt-lottie__palco, .rt-lottie__fallback { position: absolute; inset: 0; display: block; }
.rt-lottie__palco > svg { display: block; }
.rt-lottie__fallback { display: grid; place-items: center; }
/* play pedido fora da tela: o palco espera escondido (o quadro 0 de seta e selo é um ponto solto) e toca quando entra */
.rt-lottie--espera .rt-lottie__palco { visibility: hidden; }
</style>
