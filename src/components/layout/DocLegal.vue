<script setup>
/**
 * Documento legal (Privacidade, Termos, Política de repasse). Zero reveal, zero Lottie.
 *  - os títulos levam o número do item do sumário (contador CSS), com um fio em cima;
 *  - "Voltar ao sumário" no fim de cada seção (VoltarSumario, posto pela página antes de cada h2 e no fim do texto);
 *  - a partir de 1280 o sumário fica preso (sticky) na coluna da direita (os "voltar" somem ali);
 *  - medida de linha --medida-doc (56ch): 60–75 caracteres por linha;
 *  - a versão é uma linha de dado logo abaixo do título (.t-dado, como o código do lote).
 * Âncoras: :to="{ hash }" (o router rola com a folga --ancora-topo e leva o foco à seção).
 * A versão vem de SITE.vigenciaDocs (AAAA-MM-DD) e sai como DD/MM/AAAA.
 */
import TituloSecao from '../blocos/TituloSecao.vue'
import { dataBr, vigenciaPendente } from '@/config/site'

defineProps({
  titulo: { type: String, required: true },
  vigencia: { type: String, required: true },
  secoes: { type: Array, default: () => [] }, // [{ id, titulo }]
})
</script>

<template>
  <article class="doc-legal" :class="{ 'doc-legal--sumario': secoes.length }">
    <div class="doc-legal__cab">
      <TituloSecao :nivel="1" rotulo="Documento" :titulo="titulo" />
      <p class="t-dado doc-legal__versao">Versão de {{ vigenciaPendente ? '[data pendente]' : dataBr(vigencia) }}.</p>
    </div>
    <nav v-if="secoes.length" id="sumario" class="doc-legal__sumario" aria-labelledby="sumario-rot">
      <p id="sumario-rot" class="rotulo">Sumário</p>
      <ol>
        <li v-for="s in secoes" :key="s.id"><RouterLink :to="{ hash: `#${s.id}` }">{{ s.titulo }}</RouterLink></li>
      </ol>
    </nav>
    <div class="doc-legal__corpo"><slot /></div>
  </article>
</template>

<style>
.doc-legal { max-width: var(--medida-doc); }
.doc-legal__versao { margin: 16px 0 0; }
.doc-legal__sumario { margin-top: 32px; padding: 16px 0; border-block: 1px solid var(--border); }
.doc-legal__sumario:focus { outline: none; }
.doc-legal__sumario:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
/* 28 px: "10." e "11." cabem dentro da coluna (com 20 o marcador saía para a calha) */
.doc-legal__sumario ol { margin: 8px 0 0; padding-left: 28px; display: grid; gap: 0; }
/* alvo de 44 px; o padding dá ao item de 2 linhas o mesmo respiro do de 1 */
.doc-legal__sumario a { display: inline-flex; align-items: center; min-height: 44px; padding-block: 11px; color: var(--text); font: 500 15px/1.4 var(--ff-c); text-decoration: underline; text-underline-offset: 4px; }
/* títulos numerados como o sumário, com o fio de seção em cima (h2 de 20 px no celular: 18 contra o corpo de 16 não separava) */
.doc-legal__corpo { counter-reset: secao; }
.doc-legal__corpo h2 {
  margin: 40px 0 12px; padding-top: 24px; border-top: 1px solid var(--border);
  font: 600 max(20px, var(--fs-h3))/1.25 var(--ff-t); color: var(--text);
}
.doc-legal__corpo h2::before { counter-increment: secao; content: counter(secao) ". "; font-variant-numeric: tabular-nums; }
.doc-legal__corpo > h2:first-child { margin-top: 40px; }
.doc-legal__corpo h2:focus { outline: none; }
.doc-legal__corpo h2:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.doc-legal__corpo p, .doc-legal__corpo li { overflow-wrap: anywhere; }
.doc-legal__corpo p { margin: 0 0 12px; }
.doc-legal__corpo ul { margin: 0 0 12px; padding-left: 22px; display: grid; gap: 6px; }
.doc-legal__corpo a { color: var(--text); text-underline-offset: 3px; }
/* ≥ 1280: o sumário preso na coluna da direita; os "voltar ao sumário" somem */
@media (min-width: 1280px) {
  .doc-legal--sumario { display: grid; grid-template-columns: minmax(0, var(--medida-doc)) minmax(0, 320px); grid-template-areas: "cab cab" "corpo sumario"; column-gap: 64px; max-width: calc(var(--medida-doc) + 64px + 320px); align-items: start; }
  .doc-legal--sumario .doc-legal__cab { grid-area: cab; max-width: var(--medida-doc); }
  .doc-legal--sumario .doc-legal__corpo { grid-area: corpo; }
  .doc-legal--sumario .doc-legal__sumario {
    grid-area: sumario; position: sticky; top: var(--ancora-topo); margin-top: 40px;
    max-height: calc(100vh - 2 * var(--ancora-topo)); overflow-y: auto; overscroll-behavior: contain;
  }
  .doc-legal--sumario .doc-voltar { display: none; }
}
</style>
