<script setup>
/**
 * A costura: seta vertical no eixo central, metade em cada bloco, com o estado do lote ao lado.
 * Costura sem rótulo não existe, e o rótulo é um ESTADO DO LOTE da lista de data/costuras.js:
 * fora dela, o build não passa (conferirCosturas no vite.config). Rotação no contêiner, nunca no JSON. Coreografia:
 * entra no terço inferior (rootMargin -20%), uma vez → play; 540 ms depois o chip aparece e emite `chegou`.
 * Reduzir movimento ou falha do Lottie: poster e `chegou` na hora.
 * A seta fica invisível até disparar: o quadro 0 da seta-costura é um ponto laranja solto na divisa.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BrandLottie from '../marca/BrandLottie.vue'
import SetaMarca from '../marca/SetaMarca.vue'
import { reduzirAgora } from '@/composables/useReduzirMovimento'
import { ms } from '@/lib/motion'
import { ESTADOS_LOTE } from '@/data/costuras'

defineProps({
  rotulo: { type: String, required: true, validator: (v) => ESTADOS_LOTE.includes(v) },
})
const emit = defineEmits(['chegou'])

const raiz = ref(null)
const seta = ref(null)
const chegou = ref(false)
const disparou = ref(false)
let falhou = false
let io = null
let timer = 0

function marcarChegada() {
  if (chegou.value) return
  chegou.value = true
  emit('chegou')
}
function disparar() {
  disparou.value = true
  if (reduzirAgora() || falhou) {
    seta.value?.poster()
    return marcarChegada()
  }
  seta.value?.play()
  timer = setTimeout(marcarChegada, ms('--atraso-chip-costura'))
}
function aoFalhar() {
  falhou = true
  disparou.value = true
  marcarChegada()
}

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return disparar()
  io = new IntersectionObserver(
    (es) => {
      if (!es.some((e) => e.isIntersecting)) return
      io.disconnect()
      disparar()
    },
    { rootMargin: '0px 0px -20% 0px' },
  )
  io.observe(raiz.value.querySelector('.costura-seta'))
})
onBeforeUnmount(() => {
  io?.disconnect()
  clearTimeout(timer)
})
</script>

<template>
  <div ref="raiz" class="costura" :class="{ chegou, disparou }">
    <div class="costura-seta" aria-hidden="true">
      <BrandLottie ref="seta" name="seta-costura" variant="normal" trigger="manual" :size="{ w: 90, h: 27 }" @falha="aoFalhar">
        <template #fallback><SetaMarca :largura="90" :altura="27" /></template>
      </BrandLottie>
    </div>
    <span class="costura-chip">{{ rotulo }}</span>
  </div>
</template>

<style>
.costura { position: absolute; left: 50%; top: 0; width: 0; height: 0; z-index: 5; }
.costura-seta { position: absolute; width: 90px; height: 27px; left: -45px; top: -13.5px; transform: rotate(90deg); pointer-events: none; }
/* invólucro (o nó do Lottie nunca recebe opacidade/transição): some até disparar, sem transição — a seta se desenha sozinha */
.js:not(.rm) .costura:not(.disparou) .costura-seta { opacity: 0; }
.costura-chip {
  position: absolute; left: 24px; top: 12px; width: max-content; max-width: calc(50vw - 40px);
  padding: 6px 10px; background: var(--bg); border: 1px solid var(--border);
  font: 500 var(--fs-label)/1.25 var(--ff-t); letter-spacing: .18em; text-transform: uppercase; color: var(--label);
  text-wrap: balance; /* se quebrar, quebra em duas linhas parelhas: nunca uma palavra órfã */
  opacity: 0; transform: translateY(-6px);
  transition: opacity var(--dur-entra) var(--ease-settle), transform var(--dur-entra) var(--ease-settle);
}
.costura.chegou .costura-chip, html:not(.js) .costura-chip, .rm .costura-chip { opacity: 1; transform: none; }
@media (max-width: 639px) { .costura-chip { padding: 6px 8px; letter-spacing: .14em; } }
</style>
