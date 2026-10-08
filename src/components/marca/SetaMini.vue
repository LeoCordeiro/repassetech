<script setup>
/**
 * Seta da marca como marcador: a SetaMarca pequena (geometria da logo). Cor --seta (escurece sozinha sobre gelo
 * via .sobre-gelo). s = 18×12 (LinkSeta, card), m = 20×16 (regras, FAQ). `limite`: aponta para trás em cinza-petróleo
 * (é limite, não avanço). A classe .seta-mini fica no <svg>: é ela que o hover do LinkSeta/FAQ/card move 4 px.
 */
import SetaMarca from './SetaMarca.vue'

const props = defineProps({
  size: { type: String, default: 's', validator: (v) => ['s', 'm'].includes(v) },
  limite: { type: Boolean, default: false },
})
const TAM = { s: [18, 12], m: [20, 16] }
</script>

<template>
  <SetaMarca
    class="seta-mini"
    :class="[`seta-mini--${props.size}`, { 'seta-mini--limite': props.limite }]"
    :largura="TAM[props.size][0]"
    :altura="TAM[props.size][1]"
  />
</template>

<style>
.seta-marca.seta-mini { display: inline-block; vertical-align: middle; }
.seta-marca.seta-mini--limite { color: var(--c-cinza-petroleo); scale: -1 1; }
</style>
