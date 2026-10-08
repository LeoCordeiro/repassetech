<script setup>
/**
 * Secundário. Cor pelo contexto do bloco (--sec-*), nunca pela prop color.
 * tom: o VBtn põe no próprio nó a classe do tema HERDADO; fora de um SecaoBloco petróleo (hero, rodapé)
 * os --sec-* voltariam para o claro e o botão sumiria no petróleo. auto = rtTom do bloco; claro/petroleo força.
 */
import { computed, inject, unref } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: undefined },
  href: { type: String, default: undefined },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  blockCelular: { type: Boolean, default: false }, // largura total abaixo de 640
  compacto: { type: Boolean, default: false }, // 44 px, Poppins 600 16 (header das páginas internas, ao lado do BtnSeta)
  tom: { type: String, default: 'auto', validator: (v) => ['auto', 'claro', 'petroleo'].includes(v) },
})
const rtTom = inject('rtTom', null)
const tema = computed(() => {
  const t = props.tom === 'auto' ? unref(rtTom) : props.tom
  return t === 'petroleo' ? 'repassePetroleo' : t === 'claro' ? 'repasse' : undefined
})
</script>

<template>
  <VBtn
    class="rt-btn-contorno"
    :class="{ 'rt-btn-contorno--block': block, 'rt-btn-contorno--block-cel': blockCelular, 'rt-btn-contorno--compacto': compacto }"
    :theme="tema"
    variant="outlined"
    :rounded="0"
    :height="56"
    :to="to"
    :href="href"
    :type="to || href ? undefined : type"
    :disabled="disabled"
  >
    <slot />
  </VBtn>
</template>

<style>
.v-btn.rt-btn-contorno {
  position: relative; isolation: isolate; height: 56px; padding: 0 26px; border: 2px solid var(--sec-border); border-radius: 0;
  background: transparent; color: var(--sec-text) !important; font: 700 19px/1 var(--ff-t); letter-spacing: 0;
  text-transform: none; white-space: nowrap; transition: transform var(--dur-press) var(--ease-settle);
}
/* rótulo longo em tela estreita quebra em vez de vazar */
.v-btn.rt-btn-contorno { max-width: 100%; height: auto !important; min-height: 56px; padding-block: 12px; }
.v-btn.rt-btn-contorno .v-btn__content { white-space: normal; line-height: 1.2; text-wrap: balance; }
.v-btn.rt-btn-contorno::before {
  content: ""; position: absolute; inset: 0; z-index: -1; background: var(--sec-hover); opacity: 0;
  transition: opacity var(--dur-hover) var(--ease-settle);
}
@media (hover: hover) and (pointer: fine) { .v-btn.rt-btn-contorno:not(.v-btn--disabled):hover::before { opacity: 1; } }
.v-btn.rt-btn-contorno:not(.v-btn--disabled):focus-visible::before { opacity: 1; }
.v-btn.rt-btn-contorno:not(.v-btn--disabled):active { transform: scale(.98); }
.v-btn.rt-btn-contorno:not(.v-btn--disabled):active::before { opacity: 1; }
.v-btn.rt-btn-contorno.v-btn--disabled {
  opacity: 1; border-color: var(--sec-dis-border); color: var(--sec-dis-text) !important; background: var(--sec-dis-bg); cursor: not-allowed;
}
.v-btn.rt-btn-contorno--block { width: 100%; }
.v-btn.rt-btn-contorno.rt-btn-contorno--compacto { min-height: 44px; padding: 8px 16px; font: 600 16px/1.2 var(--ff-t); }
@media (max-width: 639px) { .v-btn.rt-btn-contorno--block-cel { width: 100%; } }
</style>
