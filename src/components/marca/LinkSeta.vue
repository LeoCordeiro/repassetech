<script setup>
/**
 * "Ver mais" de cada seção: texto + SetaMini. Hover/foco: seta avança, texto sublinha.
 * inline (não inline-flex): em 2 linhas a seta segue a última palavra, em vez de ir para a borda direita.
 */
import SetaMini from './SetaMini.vue'

defineProps({ to: { type: [String, Object], required: true } })
</script>

<template>
  <RouterLink class="link-seta" :to="to"><span class="link-seta__txt"><slot /></span><SetaMini /></RouterLink>
</template>

<style>
/* padding vertical em elemento inline: o alvo de toque chega a ~44 px sem mexer na linha */
.link-seta { display: inline; padding-block: 12px; font: 600 16px/1.3 var(--ff-t); color: var(--text); text-decoration: none; }
/* a seta que avança 4 px é o gesto da ponta do BtnSeta: pass */
.link-seta .seta-mini { margin-left: 8px; vertical-align: middle; transition: transform var(--dur-hover) var(--ease-pass); }
.link-seta:focus-visible .link-seta__txt { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 6px; }
.link-seta:focus-visible .seta-mini { transform: translateX(var(--shift-hover)); }
@media (hover: hover) and (pointer: fine) {
  .link-seta:hover .link-seta__txt { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 6px; }
  .link-seta:hover .seta-mini { transform: translateX(var(--shift-hover)); }
}
</style>
