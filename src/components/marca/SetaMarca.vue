<script setup>
/**
 * A seta da marca em SVG, na geometria da logo oficial (brand/logo.svg) e da seta-costura: haste de traço grosso com
 * ponta redonda atrás + ponta em polígono com junção redonda. Proporções da logo, escaladas pela ALTURA (k = altura/94):
 * haste 40k, ponta 52k × 86k com traço 8k. A largura só alonga a haste. Substitui as setas CSS finas de canto vivo
 * (cabeçalho de página, SetaMini, indicador do FAQ, fallback da costura): a assinatura volta a ter um traço só.
 * Cor: --seta (laranja; escurece sobre gelo pelo .sobre-gelo). Decorativa: aria-hidden.
 */
import { computed } from 'vue'

const props = defineProps({
  largura: { type: Number, required: true },
  altura: { type: Number, required: true },
})
const g = computed(() => {
  const W = props.largura
  const H = props.altura
  const k = H / 94
  const r = (n) => +n.toFixed(2)
  const y = H / 2
  const ponta = W - 4 * k // vértice: metade do traço da ponta para dentro da caixa
  const base = Math.max(ponta - 52 * k, 20 * k)
  return {
    haste: `M${r(20 * k)} ${r(y)}H${r(base)}`,
    t: r(40 * k),
    s: r(8 * k),
    pts: `${r(base)},${r(y - 43 * k)} ${r(ponta)},${r(y)} ${r(base)},${r(y + 43 * k)}`,
  }
})
</script>

<template>
  <svg class="seta-marca" :width="largura" :height="altura" :viewBox="`0 0 ${largura} ${altura}`" aria-hidden="true" focusable="false">
    <path :d="g.haste" fill="none" stroke="currentColor" :stroke-width="g.t" stroke-linecap="round" />
    <polygon :points="g.pts" fill="currentColor" stroke="currentColor" :stroke-width="g.s" stroke-linejoin="round" />
  </svg>
</template>

<style>
.seta-marca { display: block; flex: none; overflow: visible; color: var(--seta, var(--c-laranja)); }
</style>
