<script setup>
/**
 * "NF + IMEI conferidos". chip · queixo do card · linha (checklist da etiqueta).
 * O check é traço (stroke 3), nunca v-icon. `animado` troca o check pelo Lottie selo-verificado (o carimbo).
 * Animado e manual: o Lottie fica invisível até play() ou poster() (o quadro 0 do selo é um ponto solto, que aparecia
 * no card entre a entrada e o carimbo). O invólucro some, nunca o nó do Lottie.
 * `carimbo`: chave de lib/visita. Com `animado`, o selo carimba sozinho 1x quando entra
 * na tela (40% visível), uma vez por visita (só memória, nada no sessionStorage); nas outras vezes nasce no poster.
 * `atraso` + `liberado`: os dois selos do bloco "O selo" da Loja carimbavam no mesmo quadro. O 2º
 * recebe `liberado` = "o 1º já começou a carimbar" (evento `carimbou`) e carimba `atraso` (token, --stagger-passo) DEPOIS
 * disso — contado da entrada na tela, o 1º, que espera o JSON e a vaga, encostava no 2º (66–83 ms em vez de 120). Rede: sem
 * o sinal em --espera-vez-lottie (o 1º ficou fora da tela), segue sozinho. `carimbou` sai quando o carimbo começa de verdade,
 * e também quando o selo nasce parado, vai ao poster ou mostra a reserva (quem espera nunca fica preso).
 * Selo no poster = SeloEstatico (o mesmo desenho, sem player); e o SeloEstatico é a reserva do Lottie.
 * O carimbo pedido com o selo fora da tela espera ele entrar (BrandLottie).
 */
import { computed, inject, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import BrandLottie from './BrandLottie.vue'
import CheckMarca from './CheckMarca.vue'
import SeloEstatico from './SeloEstatico.vue'
import { IMEI } from '@/data/conferencia-imei'
import { jaFoi, umaVez } from '@/lib/visita'
import { ms } from '@/lib/motion'
import { cruzou, observadorComLimiar } from '@/lib/visivel'

const props = defineProps({
  formato: { type: String, default: 'chip', validator: (v) => ['chip', 'queixo', 'linha'].includes(v) },
  texto: { type: String, default: IMEI.selo }, // o selo de lote com IMEI, no modo da conferência (data/conferencia-imei.js)
  animado: { type: Boolean, default: false },
  trigger: { type: String, default: 'manual' },
  variant: { type: String, default: 'auto' },
  posterInicial: { type: Boolean, default: false },
  size: { type: Number, default: null }, // carimbo maior (bloco do selo na Loja); padrão: 24 no queixo, 18 no chip/linha
  carimbo: { type: String, default: '' },
  atraso: { type: String, default: '' },
  liberado: { type: Boolean, default: true },
})
const emit = defineEmits(['carimbou'])
const raiz = ref(null)
const lottie = ref(null)
const chamado = ref(false)
const jaCarimbou = Boolean(props.carimbo) && jaFoi(props.carimbo)
// parado no poster: o desenho estático (sem Lottie). Liga na montagem (já carimbou / nasce no poster) ou no poster()
const estatico = ref(props.trigger === 'manual' && (props.posterInicial || jaCarimbou))
const vez = computed(() => chamado.value || !props.animado || estatico.value || props.trigger !== 'manual')
const tom = inject('rtTom', null)
// o chip tem fundo invertido em relação ao bloco (--selo-bg): o Lottie segue o fundo do chip, não o do bloco
const varianteChip = computed(() => (props.variant !== 'auto' ? props.variant : unref(tom) === 'petroleo' ? 'normal' : 'invertida'))
const varianteBloco = computed(() => (props.variant !== 'auto' ? props.variant : unref(tom) === 'petroleo' ? 'invertida' : 'normal'))
const tamanho = computed(() => props.size ?? (props.formato === 'queixo' ? 24 : 18))
let avisou = false
const avisar = () => {
  if (avisou) return
  avisou = true
  emit('carimbou')
}
let emReserva = false
const play = () => {
  if (estatico.value) return avisar()
  chamado.value = true
  lottie.value?.play()
  if (emReserva) avisar() // a reserva no lugar: não vai tocar, e quem espera este carimbo não pode ficar preso
}
const poster = () => {
  chamado.value = true
  estatico.value = true
  avisar()
}

let io = null
let timer = 0
let rede = 0
// o Lottie pode carimbar (pronto) ou a reserva já está no lugar (rede lenta/bloqueada)
let pronto = false
let quandoPronto = null
const aoPronto = () => {
  pronto = true
  quandoPronto?.()
  quandoPronto = null
}
const aoReserva = () => {
  emReserva = true
  aoPronto()
  if (chamado.value) avisar()
}
let quandoLiberado = null
watch(
  () => props.liberado,
  (v) => {
    if (!v || !quandoLiberado) return
    clearTimeout(rede)
    const f = quandoLiberado
    quandoLiberado = null
    f()
  },
)
onMounted(() => {
  if (estatico.value) avisar() // nasceu parado: já "carimbou" para quem encadeia nele
  if (!props.animado || !props.carimbo || jaCarimbou) return
  const el = raiz.value?.$el ?? raiz.value
  if (!el) return poster()
  // carimba com 40% do selo na tela, medido pela intersectionRatio em qualquer navegador (lib/visivel.js)
  io = observadorComLimiar(0.4, (es) => {
    if (!es.some((e) => cruzou(e, 0.4))) return
    io.disconnect()
    const carimbar = () => (umaVez(props.carimbo) ? play() : poster())
    if (!props.atraso) return carimbar()
    // o atraso conta de quando o selo anterior COMEÇOU a carimbar (liberado) e este pode carimbar (pronto ou reserva)
    const agendar = () => (timer = setTimeout(carimbar, ms(props.atraso)))
    const seguir = () => (pronto ? agendar() : (quandoPronto = agendar))
    if (props.liberado) return seguir()
    quandoLiberado = seguir
    rede = setTimeout(() => {
      if (!quandoLiberado) return
      quandoLiberado = null
      seguir()
    }, ms('--espera-vez-lottie'))
  })
  if (!io) return poster()
  io.observe(el)
})
onBeforeUnmount(() => {
  io?.disconnect()
  clearTimeout(timer)
  clearTimeout(rede)
})
defineExpose({ play, poster })
</script>

<template>
  <VChip v-if="formato === 'chip'" ref="raiz" class="selo selo--chip" label variant="flat" :rounded="0" :ripple="false" tag="span">
    <template #prepend>
      <span v-if="animado" class="selo__anim" :class="{ 'selo__anim--vez': vez }">
        <SeloEstatico v-if="estatico" :size="tamanho" :variant="varianteChip" />
        <BrandLottie v-else ref="lottie" name="selo-verificado" :trigger="trigger" :variant="varianteChip" :size="tamanho" @ready="aoPronto" @reserva="aoReserva" @tocando="avisar">
          <template #fallback><SeloEstatico :size="tamanho" :variant="varianteChip" /></template>
        </BrandLottie>
      </span>
      <CheckMarca v-else class="selo__check" />
    </template>
    {{ texto }}
  </VChip>
  <span v-else ref="raiz" class="selo" :class="`selo--${formato}`">
    <span v-if="animado" class="selo__anim" :class="{ 'selo__anim--vez': vez }">
      <SeloEstatico v-if="estatico" :size="tamanho" :variant="varianteBloco" />
      <BrandLottie v-else ref="lottie" name="selo-verificado" :trigger="trigger" :variant="variant" :size="tamanho" @ready="aoPronto" @reserva="aoReserva" @tocando="avisar">
        <template #fallback><SeloEstatico :size="tamanho" :variant="varianteBloco" /></template>
      </BrandLottie>
    </span>
    <CheckMarca v-else class="selo__check" />
    {{ texto }}
  </span>
</template>

<style>
.selo__anim { display: inline-flex; flex: none; }
.js:not(.rm) .selo__anim:not(.selo__anim--vez) { opacity: 0; }
.v-chip.selo--chip {
  height: auto; min-height: 0; gap: 8px; padding: 8px 12px; border-radius: 0; background: var(--selo-bg) !important;
  color: var(--selo-text) !important; font: 600 13px/1 var(--ff-c); letter-spacing: 0; cursor: default;
}
.v-chip.selo--chip .v-chip__prepend { margin: 0; }
.selo--chip .selo__check { width: 18px; height: 18px; color: var(--selo-icon); }
.selo--queixo { display: inline-flex; align-items: center; gap: 6px; color: var(--c-branco); font: 600 12px/1 var(--ff-c); letter-spacing: .02em; }
.selo--queixo .selo__check { width: 20px; height: 20px; color: var(--c-azul-claro); flex: none; }
.selo--linha { display: inline-flex; align-items: center; gap: 8px; font: 500 15px/1.3 var(--ff-c); color: var(--text); }
.selo--linha .selo__check { width: 18px; height: 18px; color: var(--label); flex: none; }
</style>
