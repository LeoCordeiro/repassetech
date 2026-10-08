<script setup>
/**
 * A espinha dos passos. <ol> semântico: é A MESMA linha que entra pela
 * costura de cima e sai pela de baixo (cotovelo até o eixo central no celular). Trecho cheio por scaleY, futuro tracejado.
 * Por isso não é VTimeline/VStepper.
 * "A linha entrega o passo": o traço é a causa e o nó é o efeito, como na costura (a seta chega, o estado aparece).
 * O texto não espera ninguém.
 *  - passo ARMADO (40% na tela, na fila de 120 ms do useSequencia): o texto entra;
 *  - nó 1 (+ Lottie) acende com o passo 1 armado e o trecho de ENTRADA chegado (ele espera a costura de cima);
 *  - trecho N (do centro do nó N ao centro do nó N+1) enche com o nó N aceso e o passo N+1 armado: no celular a linha para
 *    "na porta" do passo que ainda não entrou na tela;
 *  - nó N+1 acende quando o trecho N CHEGA (transitionend, com rede de --dur-traco + --dur-press);
 *  - o trecho do último nó chega ao pé da caixa e a saída (cotovelo) desenha.
 * Na tela ao montar e sob reduzir movimento: cheia, nós acesos, Lottie no poster, sem transição.
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import BrandLottie from '../marca/BrandLottie.vue'
import { useSequencia } from '@/composables/useSequencia'
import { reduzirAgora } from '@/composables/useReduzirMovimento'
import { doisQuadros, ms } from '@/lib/motion'

const props = defineProps({
  passos: { type: Array, required: true }, // [{ titulo, texto, lottie, rotulo? }]
  entrada: { type: Boolean, default: false },
  saida: { type: Boolean, default: false },
  tom: { type: String, default: 'auto' }, // auto = rtTom do SecaoBloco
  nivel: { type: Number, default: 3 },
})

const rtTom = inject('rtTom', null)
const costura = inject('rtCostura', null)
const variante = computed(() => (props.tom === 'auto' ? 'auto' : props.tom === 'petroleo' ? 'invertida' : 'normal'))
const tomClasse = computed(() => (props.tom === 'auto' ? unref(rtTom) : props.tom) || 'claro')

const n = props.passos.length
// ref de função por índice: o Vue não garante a ordem do array de um ref="x" dentro de v-for
const lis = []
const anims = []
const entradaEl = ref(null)
const armados = ref(props.passos.map(() => false))
const acesos = ref(props.passos.map(() => false))
const cheios = ref(props.passos.map(() => false))
const instante = ref(false)
const recebeu = ref(false)
const chegouEntrada = ref(!props.entrada)
const saiu = ref(false)
const timers = []
let montado = false
let vivo = true

/** Fim da transição do trecho (rede: aba oculta ou transição cancelada não deixam a espinha parada). */
function esperarFim(el, fn) {
  let feito = false
  const fim = () => {
    if (feito || !vivo) return
    feito = true
    el?.removeEventListener('transitionend', aoFim)
    fn()
  }
  const aoFim = (e) => e.target === el && e.propertyName === 'transform' && fim()
  el?.addEventListener('transitionend', aoFim)
  timers.push(setTimeout(fim, ms('--dur-traco') + ms('--dur-press')))
}
function acenderNo(i, agora) {
  acesos.value[i] = true
  agora ? anims[i]?.poster() : anims[i]?.play()
}
function encher(i, agora) {
  cheios.value[i] = true
  const chegou = () => {
    if (i < n - 1) acenderNo(i + 1, agora)
    else saiu.value = true
    avancar(agora)
  }
  if (agora) chegou()
  else nextTick(() => esperarFim(lis[i]?.querySelector('.passo-cheio'), chegou))
}
/** Leva a linha até onde as condições deixam (cada nó só pelo traço que chega nele). */
function avancar(agora = false) {
  if (!acesos.value[0] && armados.value[0] && chegouEntrada.value) acenderNo(0, agora)
  for (let i = 0; i < n; i++) if (acesos.value[i] && !cheios.value[i] && (i === n - 1 || armados.value[i + 1])) encher(i, agora)
}

watch(
  () => (costura ? costura.chegou.value : true),
  (v) => {
    if (!v || recebeu.value) return
    recebeu.value = true
    if (chegouEntrada.value) return
    // costura já chegada antes da montagem (ou movimento reduzido): a entrada nasce cheia. Abaixo de 1024 o trecho de
    // entrada não existe (a costura desce no eixo central, a espinha mora à esquerda): o nó 1 espera só a costura
    const semTraco = !entradaEl.value || getComputedStyle(entradaEl.value).display === 'none'
    if (!montado || reduzirAgora() || semTraco) {
      chegouEntrada.value = true
      return void (montado && avancar())
    }
    nextTick(() =>
      esperarFim(entradaEl.value, () => {
        chegouEntrada.value = true
        avancar()
      }),
    )
  },
  { immediate: true },
)
onMounted(() => (montado = true))

useSequencia(() => lis, {
  threshold: 0.4,
  stagger: 'passo',
  acender(i, agora) {
    armados.value[i] = true
    if (agora) {
      instante.value = true
      if (i === 0) {
        recebeu.value = true
        chegouEntrada.value = true
      }
      doisQuadros(() => (instante.value = false))
    }
    avancar(agora)
  },
})
onBeforeUnmount(() => {
  vivo = false
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="passos-box" :class="[`passos-box--${tomClasse}`, { recebeu, saiu, 'passos-box--instante': instante }]">
    <span v-if="entrada" ref="entradaEl" class="passos-entrada" aria-hidden="true" />
    <ol class="passos">
      <li
        v-for="(p, i) in passos"
        :key="p.titulo"
        :ref="(el) => (lis[i] = el)"
        class="passo"
        :class="{ 'passo--armado': armados[i], 'passo--aceso': acesos[i], 'passo--cheio': cheios[i] }"
      >
        <span class="passo-cheio" aria-hidden="true" />
        <span class="passo-no" aria-hidden="true" />
        <BrandLottie :ref="(c) => (anims[i] = c)" class="passo-anim" :name="p.lottie" trigger="manual" :variant="variante" :size="48" />
        <span class="passo-num" aria-hidden="true">{{ i + 1 }}</span>
        <component :is="`h${nivel}`" class="h3 passo-tit">{{ p.titulo }}</component>
        <p class="passo-txt">{{ p.texto }}</p>
        <span v-if="p.rotulo" class="rotulo passo-rot">{{ p.rotulo }}</span>
      </li>
    </ol>
    <span v-if="saida" class="passos-saida" aria-hidden="true"><i class="s1" /><i class="s2" /><i class="s3" /></span>
  </div>
</template>

<style>
.passos-box { position: relative; min-width: 0; }
.passos { list-style: none; margin: 0; padding: 0; }
.passo {
  position: relative; display: grid; grid-template-columns: 48px minmax(0, 1fr);
  grid-template-areas: "anim num" "tit tit" "txt txt" "rot rot"; column-gap: 14px; padding: 0 0 40px 34px;
}
/* a linha vai do CENTRO de um nó ao centro do próximo (top 23 = 14 + 18/2): o trecho que chega acende o nó */
.passo::before {
  content: ""; position: absolute; left: -2px; top: 23px; bottom: -23px; width: 4px;
  background: repeating-linear-gradient(180deg, var(--espinha-futura) 0 8px, transparent 8px 14px);
}
.passo-cheio {
  position: absolute; left: -2px; top: 23px; bottom: -23px; width: 4px; background: var(--c-laranja); transform: scaleY(0); transform-origin: top;
  transition: transform var(--dur-traco) var(--ease-pass);
}
.passo:last-child::before, .passo:last-child .passo-cheio { bottom: 0; }
.passo-no { position: absolute; left: -9px; top: 14px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--espinha-futura); background: var(--bg); }
.passo-no::after {
  content: ""; position: absolute; inset: -2px; border-radius: 50%; background: var(--c-laranja); opacity: 0; transform: scale(.6);
  transition: opacity var(--dur-no) var(--ease-settle), transform var(--dur-no) var(--ease-settle);
}
.passo--cheio .passo-cheio { transform: scaleY(1); }
.passo--aceso .passo-no::after { opacity: 1; transform: none; }
.passo-anim { grid-area: anim; }
.passo-num { grid-area: num; align-self: center; font: 700 48px/1 var(--ff-t); color: var(--passo-num); font-variant-numeric: tabular-nums; }
.passo-tit { grid-area: tit; margin-top: 12px; }
.passo-txt { grid-area: txt; margin: 6px 0 0; color: var(--text-2); max-width: 46ch; }
.passo-rot { grid-area: rot; justify-self: start; margin-top: 12px; display: inline-flex; gap: 8px; align-items: center; }
.passo-rot::before { content: ""; width: 12px; height: 12px; border-left: 2px solid var(--label); border-bottom: 2px solid var(--label); margin-top: -8px; }
/* o texto do passo entra quando ele é ARMADO (na tela), sem esperar a linha */
.passo :is(.passo-num, .passo-tit, .passo-txt, .passo-rot) {
  transition: opacity var(--dur-entra) var(--ease-settle), transform var(--dur-entra) var(--ease-settle);
}
.js:not(.rm) .passo:not(.passo--armado) :is(.passo-num, .passo-tit, .passo-txt, .passo-rot) { opacity: 0; transform: translateY(var(--shift-sm)); }
.passos-box--instante :is(.passo-cheio, .passo-num, .passo-tit, .passo-txt, .passo-rot, .passos-entrada),
.passos-box--instante .passo-no::after { transition: none !important; }

/* a entrada desce da costura até o CENTRO do nó 1 (o fim dela acende o nó) */
.passos-entrada {
  position: absolute; left: -2px; top: calc(-1 * var(--costura-respiro) - 12px); height: calc(var(--costura-respiro) + 12px + 23px); width: 4px;
  background: var(--c-laranja); transform: scaleY(0); transform-origin: top; transition: transform var(--dur-no) var(--ease-pass); display: none;
}
.passos-box.recebeu .passos-entrada { transform: scaleY(1); }
.passos-saida { position: absolute; top: 100%; left: 0; width: 50%; height: calc(var(--sec-pad) + var(--costura-respiro) - 36px); }
.passos-saida i { position: absolute; background: var(--c-laranja); transition: transform var(--dur-hover) var(--ease-pass); }
.passos-saida .s1 { left: -2px; top: 0; width: 4px; height: 22px; transform: scaleY(0); transform-origin: top; }
.passos-saida .s2 { left: -2px; top: 18px; height: 4px; width: calc(100% + 4px); transform: scaleX(0); transform-origin: left; transition-delay: var(--dur-hover); }
.passos-saida .s3 { left: calc(100% - 2px); top: 18px; width: 4px; height: calc(100% - 18px); transform: scaleY(0); transform-origin: top; transition-delay: calc(var(--dur-hover) * 2); }
.passos-box.saiu .passos-saida i { transform: none; }
.rm .passo .passo-cheio, .rm .passos-entrada, .rm .passos-saida i { transform: none !important; }
.rm .passo .passo-no::after { opacity: 1 !important; transform: none !important; }
@media (min-width: 1024px) {
  .passo { grid-template-columns: 48px 52px minmax(0, 1fr); grid-template-areas: "anim num tit" "anim num txt" ". . rot"; padding-left: 40px; }
  .passo-tit { margin-top: 2px; }
  .passo-num { align-self: start; }
  .passos-entrada { display: block; top: -36px; height: calc(36px + 23px); }
  .passos-saida { width: 0; }
  .passos-saida .s1 { height: 100%; }
  .passos-saida .s2, .passos-saida .s3 { display: none; }
}
</style>
