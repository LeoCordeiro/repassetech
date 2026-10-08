<script setup>
/**
 * "Voltar ao sumário" no fim de cada seção dos documentos: sem ele eram 12 telas no celular sem caminho de volta.
 * A página põe um antes de cada h2 (menos o 1º) e um no fim do texto. Âncora pelo router (:to="{ hash }"): rola
 * com a folga --ancora-topo e leva o foco ao sumário. A partir de 1280 some (o sumário fica preso ao lado, DocLegal).
 * A seta da marca girada para cima e na cor do texto: volta, não avança.
 */
import SetaMini from '../marca/SetaMini.vue'
</script>

<template>
  <p class="doc-voltar">
    <RouterLink :to="{ hash: '#sumario' }" class="doc-voltar__link"><SetaMini class="doc-voltar__seta" />Voltar ao sumário</RouterLink>
  </p>
</template>

<style>
.doc-legal__corpo .doc-voltar { margin: 4px 0 0; } /* o parágrafo de cima já tem 12 px; o alvo de 44 px faz o resto */
.doc-voltar__link { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; color: var(--text); font: 500 15px/1.3 var(--ff-t); text-decoration: none; }
/* navegação dentro do documento, não "passar adiante": a seta na cor do texto (o laranja fica para avanço e ação) */
.doc-voltar__link .doc-voltar__seta { rotate: -90deg; --seta: var(--text); }
.doc-voltar__link:focus-visible { text-decoration: underline; text-underline-offset: 6px; }
@media (hover: hover) and (pointer: fine) { .doc-voltar__link:hover { text-decoration: underline; text-underline-offset: 6px; } }
</style>
