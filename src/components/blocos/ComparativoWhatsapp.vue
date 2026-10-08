<script setup>
/**
 * Comparativo de balcão. <table> real; no celular (< 640) vira blocos com data-r.
 * Coluna do grupo sem X vermelho e sem ironia. Linhas entram em stagger de linha (60). O check fica parado (o scale(.8→1)
 * por linha era um "verificado" a mais disputando com o carimbo, fora do tempo do stagger).
 */
import CheckMarca from '../marca/CheckMarca.vue'
import { COMPARATIVO } from '@/data/comparativo'

defineProps({
  linhas: { type: Array, default: () => COMPARATIVO }, // [{ item, grupo, rt }]
  tom: { type: String, default: 'auto' }, // a cor vem do bloco; prop existe para forçar contexto solto
})
</script>

<template>
  <VTable class="comp" :class="tom === 'auto' ? null : `ctx-${tom}`">
    <thead>
      <tr>
        <th scope="col"><span class="vh">Item</span></th>
        <th scope="col">No grupo de WhatsApp</th>
        <th scope="col">Na Repasse Tech</th>
      </tr>
    </thead>
    <tbody v-reveal="{ grupo: true, distancia: 'sm', stagger: 'linha' }">
      <tr v-for="l in linhas" :key="l.item" data-reveal-item>
        <th scope="row">{{ l.item }}</th>
        <td class="comp-grupo" data-r="No grupo">{{ l.grupo }}</td>
        <td class="comp-rt" data-r="Na Repasse Tech">
          <CheckMarca class="comp-check" />{{ l.rt }}
        </td>
      </tr>
    </tbody>
  </VTable>
</template>

<style>
.v-table.comp { width: 100%; margin-top: 16px; font: 400 15px/1.4 var(--ff-c); }
.v-table.comp table { border-collapse: collapse; }
/* o invólucro de rolagem do Vuetify (overflow auto) sobrava 12 px com as linhas ainda no translateY do reveal, e o Chrome o
   tornava uma parada de Tab sem nome; a tabela cabe na coluna em toda largura (no celular vira blocos) */
:root .v-table.comp .v-table__wrapper { overflow: visible; }
/* :root: a célula do Vuetify (.v-table > .v-table__wrapper > table > tbody > tr > td) tem 2 classes + 4 tipos; com 3 classes
   a nossa vence pela especificidade, sem depender da ordem do chunk */
:root .v-table.comp :is(th, td) { height: auto; padding: 12px 14px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--border); }
:root .v-table.comp thead th { font: 500 12px/1.2 var(--ff-t); letter-spacing: .14em; text-transform: uppercase; color: var(--label); }
.v-table.comp tbody th { font: 600 15px/1.3 var(--ff-t); color: var(--text); }
.v-table.comp .comp-grupo { color: var(--text-2); }
.v-table.comp .comp-rt { background: var(--panel); color: var(--text); font-weight: 500; }
.comp-check { display: inline-block; width: 16px; height: 16px; vertical-align: -3px; margin-right: 6px; color: var(--check); }
@media (max-width: 639px) {
  .v-table.comp thead { display: none; }
  .v-table.comp :is(table, tbody, tr, th, td) { display: block; }
  .v-table.comp tr { border-bottom: 1px solid var(--border); padding: 12px 0; }
  :root .v-table.comp :is(th, td) { border: 0; padding: 4px 0; }
  .v-table.comp tbody th { font: 500 12px/1.2 var(--ff-t); letter-spacing: .14em; text-transform: uppercase; color: var(--label); }
  .v-table.comp td::before { content: attr(data-r) ": "; font-weight: 500; }
  :root .v-table.comp .comp-rt { padding: 6px 10px; margin-top: 4px; }
}
</style>
