<script setup>
/**
 * Bloco de seção (claro ou petróleo). Troca o tema do Vuetify pelo v-theme-provider (tokens por bloco em contextos.css).
 * Provide: rtTom ('claro'|'petroleo') e rtCostura { chegou: Ref<boolean> } — a coreografia da seção espera a seta.
 * Regra: costura só entre tons diferentes. Duas claras seguidas = fio interno, sem seta.
 */
import { computed, provide, ref } from 'vue'
import CosturaSecao from './CosturaSecao.vue'

const props = defineProps({
  tom: { type: String, required: true, validator: (v) => ['claro', 'petroleo'].includes(v) },
  costura: { type: String, default: '' },
  sai: { type: Boolean, default: false },
  radial: { type: Boolean, default: null }, // padrão: true no petróleo
  radialAt: { type: String, default: '0% 100%' },
  id: { type: String, default: undefined },
  labelledby: { type: String, default: undefined },
  wrap: { type: Boolean, default: true },
})

const chegou = ref(!props.costura)
provide('rtTom', computed(() => props.tom))
provide('rtCostura', { chegou })
const comRadial = computed(() => props.tom === 'petroleo' && (props.radial ?? true))
</script>

<template>
  <VThemeProvider :theme="tom === 'petroleo' ? 'repassePetroleo' : 'repasse'" with-background>
    <section
      :id="id"
      class="sec secao-bloco"
      :class="[`secao-bloco--${tom}`, { entra: costura, sai, 'com-radial': comRadial }]"
      :style="comRadial ? { '--radial-at': radialAt } : undefined"
      :aria-labelledby="labelledby"
    >
      <CosturaSecao v-if="costura" :rotulo="costura" @chegou="chegou = true" />
      <div v-if="wrap" class="wrap"><slot /></div>
      <slot v-else />
    </section>
  </VThemeProvider>
</template>

<style>
.secao-bloco { border-radius: 0; box-shadow: none; color: var(--text); }
</style>
