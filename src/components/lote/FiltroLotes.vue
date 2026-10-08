<script setup>
/**
 * Filtros do catálogo por chip (categoria e condição): um VChipGroup por grupo (mandatory). Valores só de filtro (vão para a
 * query, nunca dado pessoal). aria-pressed explícito (o VChip não expõe). Chip de 44 px (alvo de toque).
 * Abaixo de 640: rótulo à esquerda e o trilho de chips com rolagem própria (sem inflar a página). Quando o trilho tem
 * mais chips à direita, a borda esmaece (máscara): avisa que há mais opções sem ocupar mais altura — com os chips
 * quebrando em 2 linhas por grupo, a saída do estado vazio ("Pedir um lote assim") caía fora da 1ª tela.
 */
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { FILTROS, GRUPOS_FILTRO } from '@/data/catalogo'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ categoria: null, condicao: null }) },
  grupos: { type: Array, default: () => GRUPOS_FILTRO },
})
const emit = defineEmits(['update:modelValue'])

const TODOS = '__todos'
const valorChip = (g) => props.modelValue?.[g] ?? TODOS
const atualizar = (g, v) => emit('update:modelValue', { ...props.modelValue, [g]: v === TODOS || v == null ? null : v })

// trilho com mais à direita: classe .chips--mais (a máscara some quando a rolagem chega ao fim). A classe é LIGADA pelo Vue
// (:class com estado por grupo), nunca por classList: o VSlideGroup se re-renderiza quando mede a própria rolagem
// (v-slide-group--is-overflowing) e o Vue reescreve o class do nó, apagando a classe posta à mão — na 1ª visita a 375/320
// a máscara sumia conforme a ordem das duas medidas
const raiz = ref(null)
const mais = reactive({})
let ro = null
const conferir = (c) => {
  const g = c.closest('.chips')?.dataset.grupo
  if (g) mais[g] = c.scrollLeft + c.clientWidth < c.scrollWidth - 1
}
const aoRolar = (e) => conferir(e.currentTarget)
const trilhos = () => [...(raiz.value?.querySelectorAll('.chips .v-slide-group__container') || [])]
onMounted(async () => {
  await nextTick()
  // sem a leitura síncrona: o conferir() aqui forçava o layout da página inteira dentro da tarefa de
  // montagem (246 ms de Layout + 68 de RecalcStyle a CPU 4×). A 1ª medida vem do ResizeObserver, depois do layout.
  trilhos().forEach((c) => c.addEventListener('scroll', aoRolar, { passive: true }))
  // o conteúdo do trilho muda de largura quando a fonte chega, e o próprio trilho também (o rótulo à esquerda cresce com a
  // Poppins): observa o conteúdo E o trilho. Só o conteúdo deixava a máscara apagada na 1ª visita a 375
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => trilhos().forEach(conferir))
    ro.observe(raiz.value)
    raiz.value.querySelectorAll('.chips .v-slide-group__content, .chips .v-slide-group__container').forEach((c) => ro.observe(c))
  }
})
onBeforeUnmount(() => {
  trilhos().forEach((c) => c.removeEventListener('scroll', aoRolar))
  ro?.disconnect()
})
</script>

<template>
  <div ref="raiz" class="filtros">
    <div v-for="g in grupos" :key="g" class="filtro-grupo" role="group" :aria-label="FILTROS[g].rotulo">
      <span class="rotulo filtro-rot" aria-hidden="true">{{ FILTROS[g].rotulo }}</span>
      <VChipGroup class="chips" :class="{ 'chips--mais': mais[g] }" :data-grupo="g" :model-value="valorChip(g)" @update:model-value="atualizar(g, $event)">
        <VChip
          v-for="o in FILTROS[g].opcoes"
          :key="o.texto"
          :value="o.valor ?? TODOS"
          tag="button"
          type="button"
          :aria-pressed="String(valorChip(g) === (o.valor ?? TODOS))"
        >
          {{ o.texto }}
        </VChip>
      </VChipGroup>
    </div>
  </div>
</template>

<style>
.filtros { display: grid; gap: 12px; margin-top: 28px; }
.filtro-grupo { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; min-width: 0; }
.v-chip-group.chips { margin: 0 -16px; padding: 4px 16px 6px; max-width: none; }
.v-chip-group.chips .v-slide-group__content { gap: 8px; }
/* o anel de foco do chip (3 px + 3 de folga) cabe inteiro: o trilho recorta (overflow) 6 px além dos chips, sem mudar o lugar deles */
.v-chip-group.chips .v-slide-group__container { padding: 6px; margin: -6px; }
.v-chip-group.chips .v-chip { flex: none; margin: 0; }
@media (max-width: 639px) {
  /* rótulo na mesma linha do trilho; o trilho sangra só à direita (a calha da esquerda é do rótulo) */
  .filtros { gap: 6px; }
  .filtro-grupo { grid-template-columns: 84px minmax(0, 1fr); align-items: center; gap: 8px; }
  .filtro-rot { font-size: 11px; letter-spacing: .1em; }
  .v-chip-group.chips { margin: 0 -16px 0 0; padding: 4px 16px 4px 0; }
  .v-chip-group.chips.chips--mais .v-slide-group__container { -webkit-mask-image: linear-gradient(90deg, black calc(100% - 40px), transparent); mask-image: linear-gradient(90deg, black calc(100% - 40px), transparent); }
}
@media (min-width: 640px) {
  .filtro-grupo { grid-template-columns: 120px minmax(0, 1fr); align-items: center; gap: 12px; }
  .v-chip-group.chips { margin: 0; padding-inline: 0; }
}
</style>
