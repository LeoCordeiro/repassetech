<script setup>
/**
 * As regras em voz alta: tipografia, não tem par no Vuetify.
 * Por regra (stagger 120, threshold .3, uma vez): fio scaleX, seta chega, regra é dita.
 */
import { ref } from 'vue'
import SetaMini from '../marca/SetaMini.vue'
import { REGRAS } from '@/data/regras'
import { useSequencia } from '@/composables/useSequencia'
import { doisQuadros } from '@/lib/motion'

defineProps({
  regras: { type: Array, default: () => REGRAS }, // [{ titulo, texto }]
  compacto: { type: Boolean, default: false },
  nivel: { type: Number, default: 3 },
})

const itens = [] // ref de função por índice (ordem garantida)
const acesas = ref([])
const instante = ref(false)
useSequencia(() => itens, {
  threshold: 0.3,
  stagger: 'passo',
  acender(i, agora) {
    if (agora) {
      instante.value = true
      doisQuadros(() => (instante.value = false))
    }
    acesas.value[i] = true
  },
})
</script>

<template>
  <ul class="regras" :class="{ 'regras--compacto': compacto, 'regras--instante': instante }">
    <li v-for="(r, i) in regras" :key="r.titulo" :ref="(el) => (itens[i] = el)" class="regra" :class="{ on: acesas[i] }">
      <SetaMini size="m" />
      <div class="regra-corpo">
        <component :is="`h${nivel}`" class="regra-t">{{ r.titulo }}</component>
        <p class="regra-d">{{ r.texto }}</p>
      </div>
    </li>
  </ul>
</template>

<style>
.regras { list-style: none; margin: 32px 0 0; padding: 0; --regra-fs: var(--fs-regra); }
.regras--compacto { --regra-fs: var(--fs-h3); }
.regra { position: relative; display: grid; grid-template-columns: 20px minmax(0, 1fr); column-gap: 16px; padding: 22px 0; }
.regra::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: var(--border); transform-origin: left; }
.regra .seta-mini { margin-top: calc(var(--regra-fs) * .38); }
.regra-t { margin: 0; font: 700 var(--regra-fs)/1.12 var(--ff-t); letter-spacing: -.015em; color: var(--text-strong); }
.regras--compacto .regra-t { font-weight: 600; letter-spacing: -.005em; line-height: 1.25; }
.regra-d { margin: 8px 0 0; color: var(--text-2); max-width: 56ch; }
.regra::before { transition: transform var(--dur-reveal) var(--ease-pass); }
/* marcador 300 pass, texto 300 settle com 200 de atraso */
.regra .seta-mini { transition: opacity var(--dur-regra) var(--ease-pass), transform var(--dur-regra) var(--ease-pass); }
.regra-corpo { transition: opacity var(--dur-regra) var(--ease-settle) var(--atraso-texto-regra); }
.js:not(.rm) .regra:not(.on)::before { transform: scaleX(0); }
.js:not(.rm) .regra:not(.on) .seta-mini { opacity: 0; transform: translateX(calc(-1 * var(--shift-sm))); }
.js:not(.rm) .regra:not(.on) .regra-corpo { opacity: 0; }
.regras--instante .regra::before, .regras--instante .seta-mini, .regras--instante .regra-corpo { transition: none !important; }
</style>
