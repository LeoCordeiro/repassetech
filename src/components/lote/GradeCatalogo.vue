<script setup>
/**
 * Grade do catálogo com FLIP nativo do Vue (<TransitionGroup>).
 * Entrada inicial: espera a costura (aguardarCostura) com rede de segurança (--espera-costura) e focusin; quem chega por baixo
 * (a costura já ficou acima da tela) não espera. Na revelação, o card que está na tela entra (stagger --stagger-card); o que
 * está abaixo da dobra revela pelo scroll, quando entra.
 * Selo de cada card (a regra de entrada da categoria): --atraso-selo-card depois do card entrar, só os 4 primeiros, uma vez
 * por card por visita; o carimbo pedido com o selo fora da tela espera ele entrar (BrandLottie). Card que nasce carimbado:
 * o selo parado (SeloEstatico).
 * Filtro: FLIP de verdade.
 *  - a posição de TODOS os cards é fotografada antes do patch, num watch das categorias visíveis com flush 'pre' (venha a
 *    mudança de onde vier: objeto de filtro novo ou mexido no lugar): o `congelar` do card que sai usa a foto, nunca a
 *    leitura ao vivo (os irmãos que saem antes já viraram absolute e a leitura dava a vaga do vizinho);
 *  - em repouso o <li> não tem transição nem atraso (o stagger da entrada inicial fica só em `.entrando`);
 *  - sai: some no lugar (120 pass, scale .98); fica: anda do ponto antigo ao novo (300 settle); volta: todos juntos no 120
 *    (280 settle), sem stagger — e sem esperar ninguém quando ninguém sai (a volta do vazio começa no 0);
 *  - o vazio entra DEPOIS da saída (no 120), nunca por cima do card que ainda some; sai seco.
 * `eager`: quantos cards têm a foto na 1ª dobra da página (sem lazy); os outros, lazy.
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CardCategoria from './CardCategoria.vue'
import { filtrarCategorias } from '@/data/catalogo'
import { useReveal } from '@/composables/useReveal'
import { doisQuadros, ms } from '@/lib/motion'
import { jaFoi, marcar } from '@/lib/visita'
import { cruzou, observadorComLimiar } from '@/lib/visivel'

const props = defineProps({
  categorias: { type: Array, required: true },
  filtros: { type: Object, default: () => ({}) }, // { categoria, condicao } — null = todas
  aguardarCostura: { type: Boolean, default: false },
  limite: { type: Number, default: 0 }, // no máximo N cards depois do filtro (Home < 640: 2); 0 = todos
  eager: { type: Number, default: 0 },
  sizes: { type: String, default: undefined },
})
const emit = defineEmits(['contagem'])

const chaveSelo = (id) => `selo-cat:${id}` // 1x por card por visita (lib/visita)
// foto de quem JÁ carimbou antes desta montagem: o jaFoi() muda no meio (marcar) e não pode virar o selo para o poster
// antes do carimbo (o selo apareceria parado no quadro 0, um ponto solto, até tocar)
const carimbadosAntes = new Set(props.categorias.filter((c) => jaFoi(chaveSelo(c.id))).map((c) => c.id))
const timers = []
const raiz = ref(null)
const cards = {}
const filtradas = computed(() => filtrarCategorias(props.categorias, props.filtros))
const visiveis = computed(() => (props.limite ? filtradas.value.slice(0, props.limite) : filtradas.value))
watch(() => filtradas.value.length, (n) => emit('contagem', n), { immediate: true })

const costura = inject('rtCostura', null)
const esperaCostura = props.aguardarCostura && costura && !costura.chegou.value
/** A costura desta seção já ficou acima da tela: quem chega por baixo não espera por ela. */
const costuraAcima = () => {
  const c = raiz.value?.closest('section')?.querySelector('.costura')
  return Boolean(c) && c.getBoundingClientRect().bottom < 0
}
const { revelar, revelado } = useReveal(raiz, { esperar: esperaCostura ? '--espera-costura' : null, agora: esperaCostura ? costuraAcima : null })
const instante = ref(false)
const posterDe = ref(new Set()) // cards que nascem no poster (chegaram por filtro)
const vistos = ref(new Set()) // cards revelados
const entrando = ref(new Map()) // card revelando → índice no lote de entrada (stagger)
const semSaida = ref(false) // ninguém sai (a volta do vazio, o filtro que só acrescenta): a entrada não espera a saída

if (esperaCostura) watch(costura.chegou, (v) => v && revelar())

/** Revela um lote de cards (os que entraram na tela juntos), em stagger, e arma o selo de cada um. */
function revelarCards(ids, semTransicao) {
  ids.forEach((id, ib) => {
    vistos.value.add(id)
    if (!semTransicao) {
      entrando.value.set(id, ib)
      timers.push(setTimeout(() => entrando.value.delete(id), ms('--dur-reveal') + Math.min(ib, 5) * ms('--stagger-card')))
    }
    const i = visiveis.value.findIndex((c) => c.id === id)
    const card = cards[id]
    if (!card) return
    if (i >= 4 || jaFoi(chaveSelo(id))) return card.posterSelo()
    marcar(chaveSelo(id))
    timers.push(setTimeout(() => cards[id]?.tocarSelo(), Math.min(ib, 5) * ms('--stagger-card') + ms('--atraso-selo-card')))
  })
}

let ioCards = null
const naTela = (el) => {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0
}
const LIMIAR_CARD = 0.2
watch(revelado, (v) => {
  if (!v) return
  const lis = [...(raiz.value?.querySelectorAll('.cat-grid > li') || [])]
  const agora = lis.filter(naTela)
  revelarCards(agora.map((li) => li.dataset.id), instante.value)
  const depois = lis.filter((li) => !agora.includes(li))
  if (!depois.length) return
  // A margem de cima é "infinita": o card que já ficou ACIMA da tela (a pessoa passou por ele antes de a costura chegar, ou a
  // rolagem pulou por cima dele sem um quadro na tela) também cruza o limiar, e aparece sem transição — quem volta subindo
  // nunca encontra a vaga vazia. O que entra por baixo revela com a transição, em stagger.
  ioCards = observadorComLimiar(
    LIMIAR_CARD,
    (es) => {
      const entraram = es.filter((e) => cruzou(e, LIMIAR_CARD) && e.target.isConnected)
      entraram.forEach((e) => ioCards.unobserve(e.target))
      const acima = entraram.filter((e) => e.boundingClientRect.bottom <= 0)
      revelarCards(acima.map((e) => e.target.dataset.id), true)
      revelarCards(entraram.filter((e) => !acima.includes(e)).map((e) => e.target.dataset.id), false)
    },
    { rootMargin: '100000px 0px -10% 0px' },
  )
  if (!ioCards) return revelarCards(depois.map((li) => li.dataset.id), true)
  depois.forEach((li) => ioCards.observe(li))
})

onMounted(() => {
  if (esperaCostura) return
  doisQuadros(() => {
    const r = raiz.value?.getBoundingClientRect()
    if (r && r.top < window.innerHeight && r.bottom > 0) {
      instante.value = true
      revelar()
      doisQuadros(() => (instante.value = false))
    }
  })
})

// card que entra depois da revelação (filtro) chega carimbado e já revelado
watch(visiveis, (novas, velhas) => {
  if (!revelado.value) return
  const antes = new Set(velhas.map((c) => c.id))
  novas.forEach((c) => {
    if (antes.has(c.id)) return
    posterDe.value.add(c.id)
    vistos.value.add(c.id)
  })
})

// FLIP: a posição de cada card ANTES do patch (offset*, sem o scale .98 da saída nem o transform do move)
const fotos = new Map()
watch(
  visiveis,
  (novas, velhas) => {
    fotos.clear()
    raiz.value?.querySelectorAll('.cat-grid > li').forEach((li) => fotos.set(li.dataset.id, { left: li.offsetLeft, top: li.offsetTop, width: li.offsetWidth, height: li.offsetHeight }))
    // ninguém sai (a volta do vazio, ou um filtro que só acrescenta): quem entra não espera a saída que não existe
    const ficam = new Set(novas.map((c) => c.id))
    semSaida.value = !!velhas && novas.length > velhas.length && velhas.every((c) => ficam.has(c.id))
    if (semSaida.value) nextTick(() => doisQuadros(() => (semSaida.value = false)))
  },
  { flush: 'pre' },
)
function congelar(el) {
  const f = fotos.get(el.dataset.id)
  if (f) Object.assign(el.style, { width: `${f.width}px`, height: `${f.height}px`, left: `${f.left}px`, top: `${f.top}px` })
  ioCards?.unobserve(el)
}

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  ioCards?.disconnect()
})
</script>

<template>
  <div ref="raiz" class="grade-catalogo" :class="{ revelada: revelado, 'grade-catalogo--instante': instante, 'grade-catalogo--sem-saida': semSaida }">
    <TransitionGroup tag="ul" name="cat" class="cat-grid" @before-leave="congelar">
      <li
        v-for="(c, i) in visiveis"
        :key="c.id"
        :data-id="c.id"
        :class="{ visto: vistos.has(c.id), entrando: entrando.has(c.id) }"
        :style="entrando.has(c.id) ? { '--ib': entrando.get(c.id) } : undefined"
      >
        <CardCategoria
          :ref="(x) => (x ? (cards[c.id] = x) : delete cards[c.id])"
          :categoria="c"
          :eager="i < eager"
          :sizes="sizes"
          selo-animado
          :selo-poster="posterDe.has(c.id) || carimbadosAntes.has(c.id)"
        />
      </li>
    </TransitionGroup>
    <Transition name="rt-vazio">
      <div v-if="!visiveis.length" class="grade-catalogo__vazio"><slot name="vazio" /></div>
    </Transition>
  </div>
</template>

<style>
.cat-grid { position: relative; list-style: none; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; margin: 24px 0 0; padding: 0; }
.cat-grid > li { display: grid; }
@media (min-width: 640px) { .cat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .cat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; } }
/* revelação: só o <li> que está entrando tem transição (em repouso, nenhuma: o FLIP precisa do <li> limpo) */
.js:not(.rm) .grade-catalogo .cat-grid > li:not(.visto) { opacity: 0; transform: translateY(var(--shift-lg)); }
.grade-catalogo .cat-grid > li.entrando {
  transition: opacity var(--dur-reveal) var(--ease-settle), transform var(--dur-reveal) var(--ease-settle);
  transition-delay: calc(min(var(--ib, 0), 5) * var(--stagger-card));
}
.grade-catalogo--instante .cat-grid > li { transition: none !important; }
/* filtro: sai no lugar · fica e anda · volta junto no 120 (depois das regras acima: mesma especificidade) */
.grade-catalogo .cat-grid > li.cat-move { transition: transform var(--dur-move) var(--ease-settle); transition-delay: 0s; }
.grade-catalogo .cat-grid > li.cat-leave-active { position: absolute; transition: opacity var(--dur-sai) var(--ease-pass), transform var(--dur-sai) var(--ease-pass); transition-delay: 0s; }
.cat-leave-to { opacity: 0; transform: scale(.98); }
.grade-catalogo .cat-grid > li.cat-enter-active {
  transition: opacity var(--dur-entra) var(--ease-settle), transform var(--dur-entra) var(--ease-settle);
  transition-delay: var(--dur-sai);
}
/* ninguém sai (a volta do vazio, o filtro que só acrescenta): a entrada começa no 0, sem esperar a saída que não existe */
.grade-catalogo--sem-saida .cat-grid > li.cat-enter-active { transition-delay: 0s; }
.cat-enter-from { opacity: 0; transform: translateY(var(--shift-sm)); }
.grade-catalogo__vazio { margin-top: 24px; }
@media (max-width: 639px) { .grade-catalogo__vazio { margin-top: 12px; } } /* a saída do vazio cabe na 1ª tela pelo link direto */
/* o vazio entra quando a saída termina (--dur-sai) e sai seco (quem volta são os cards) */
.rt-vazio-enter-active { transition: opacity var(--dur-entra) var(--ease-settle) var(--dur-sai), transform var(--dur-entra) var(--ease-settle) var(--dur-sai); }
.rt-vazio-enter-from { opacity: 0; transform: translateY(var(--shift-sm)); }
</style>
