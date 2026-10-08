<script setup>
/**
 * Etiqueta de lote em PRÉVIA: se preenche com o que o lojista digita no Quero vender e
 * fecha com "Conferência pendente" — NUNCA um selo, num lote que ninguém conferiu, e o código só existe depois da
 * conferência ("RT-?"). Sem aria-live (anunciar a cada tecla atrapalha).
 * Branca em qualquer bloco: a etiqueta declara o próprio tema (o VCard herdaria o do bloco petróleo) e provê rtTom 'claro'.
 */
import { computed, provide } from 'vue'
import CheckMarca from '../marca/CheckMarca.vue'
import './etiqueta.css'

const props = defineProps({
  lote: { type: Object, default: () => ({}) }, // { modelo?, qtd?, cond? }
  checks: { type: Array, default: () => [] }, // [{ texto, estado: 'ok'|'pendente' }]
})
const traco = (v) => (v === undefined || v === null || v === '' ? '—' : v)
const qtd = computed(() => (props.lote.qtd ? `${props.lote.qtd} un.` : '—'))
provide('rtTom', 'claro')
</script>

<template>
  <VCard class="etiqueta etiqueta--previa ctx-claro" theme="repasse" flat :rounded="0" border role="group" aria-label="Prévia da etiqueta do lote">
    <div class="etq-cab">
      <span class="rotulo">Etiqueta de lote</span><span class="tag-ex">PRÉVIA</span>
    </div>
    <div class="etq-corpo">
      <span class="etq-cod vazio">RT-?</span>
      <span class="h3" :class="{ vazio: !lote.modelo }">{{ traco(lote.modelo) }}</span>
      <span class="t-dado"><span :class="{ vazio: !lote.qtd }">{{ qtd }}</span> · <span :class="{ vazio: !lote.cond }">{{ traco(lote.cond) }}</span></span>
      <ul v-if="checks.length" class="etq-check">
        <li v-for="c in checks" :key="c.texto" :class="`etq-check--${c.estado}`">
          <CheckMarca v-if="c.estado === 'ok'" />
          <span v-else class="etq-pend" aria-hidden="true" />
          {{ c.texto }}<span class="vh">{{ c.estado === 'ok' ? ' (ok)' : ' (pendente)' }}</span>
        </li>
      </ul>
      <span class="etq-pendente">Conferência pendente</span>
    </div>
  </VCard>
</template>
