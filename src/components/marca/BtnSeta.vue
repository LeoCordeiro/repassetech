<script setup>
/**
 * Botão-flecha, CTA primário (só existe o tamanho L).
 * No hover/foco só a PONTA avança 4 px e escurece; disabled = a ponta some ("não passa adiante").
 * Nunca clip-path no botão (corta o outline). Uso preferido em bloco claro.
 * A ponta usa SEMPRE a mesma lista de funções — translateX() scaleX() — em todo estado: repouso (0, 1), hover/foco
 * (4 px, 1), recolhida (0, 0). Com listas diferentes (translateX no hover × scaleX(0) no envio) o navegador interpola
 * por matriz, scaleX(0) não decompõe e a ponta sumia num quadro.
 * tom: o VBtn põe no próprio nó a classe do tema HERDADO; fora de um SecaoBloco petróleo (hero, rodapé, header split)
 * isso traz os tokens do claro (--focus, --sec-*). auto = rtTom do bloco; claro/petroleo força.
 */
import { computed, inject, unref } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: undefined },
  href: { type: String, default: undefined },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  blockCelular: { type: Boolean, default: false }, // largura total abaixo de 640
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
    class="rt-btn-seta"
    :class="{ 'rt-btn-seta--block': block, 'rt-btn-seta--block-cel': blockCelular }"
    :theme="tema"
    variant="flat"
    color="acao"
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
.v-btn.rt-btn-seta {
  position: relative; isolation: isolate; overflow: visible; height: 56px; padding: 0 24px 0 28px; margin-right: 16px;
  border-radius: 0; background: var(--c-laranja) !important; color: var(--c-branco) !important;
  font: 700 19px/1 var(--ff-t); letter-spacing: .005em; text-transform: none; white-space: nowrap; text-decoration: none;
  transition: transform var(--dur-press) var(--ease-settle);
}
/* rótulo longo em tela estreita quebra em 2 linhas em vez de vazar (19 px/700 é o piso de contraste: não encolhe) */
.v-btn.rt-btn-seta { max-width: calc(100% - 16px); height: auto !important; min-height: 56px; padding-block: 12px; }
/* 2 linhas parelhas (nunca "meu / lote") e CENTRALIZADAS: quebrar significa que o botão bateu na largura toda, e à esquerda
   sobrava uma faixa laranja vazia à direita (vale para hero, menu, Como funciona, envio) */
.v-btn.rt-btn-seta .v-btn__content { white-space: normal; line-height: 1.2; text-align: center; text-wrap: balance; }
/* camada de cor da caixa */
.v-btn.rt-btn-seta::before {
  content: ""; position: absolute; inset: 0; z-index: -1; background: var(--c-laranja-escuro); opacity: 0;
  transition: opacity var(--dur-hover) var(--ease-pass);
}
/* a ponta: 4 px de base escondidos sob a caixa (não abre fresta ao avançar) + triângulo de 16 px */
.v-btn.rt-btn-seta::after {
  content: ""; position: absolute; z-index: -2; inset: 0 auto auto calc(100% - 4px); width: 20px; height: 100%;
  border: 0; border-radius: 0; opacity: 1; pointer-events: none; background: var(--c-laranja);
  clip-path: polygon(0 0, 4px 0, 100% 50%, 4px 100%, 0 100%); transform-origin: left; transform: translateX(0) scaleX(1);
  transition: transform var(--dur-hover) var(--ease-pass), background-color var(--dur-hover) var(--ease-pass);
}
@media (hover: hover) and (pointer: fine) {
  .v-btn.rt-btn-seta:not(.v-btn--disabled):hover::before { opacity: 1; }
  .v-btn.rt-btn-seta:not(.v-btn--disabled):hover::after { transform: translateX(var(--shift-hover)) scaleX(1); background-color: var(--c-laranja-escuro); }
}
.v-btn.rt-btn-seta:not(.v-btn--disabled):focus-visible::before { opacity: 1; }
.v-btn.rt-btn-seta:not(.v-btn--disabled):focus-visible::after { display: block; transform: translateX(var(--shift-hover)) scaleX(1); background-color: var(--c-laranja-escuro); }
.v-btn.rt-btn-seta:not(.v-btn--disabled):active { transform: scale(.98); }
.v-btn.rt-btn-seta:not(.v-btn--disabled):active::before { opacity: 1; background: var(--c-laranja-pressed); }
.v-btn.rt-btn-seta:not(.v-btn--disabled):active::after { background-color: var(--c-laranja-pressed); }
.v-btn.rt-btn-seta.v-btn--disabled { opacity: 1; background: var(--c-fio) !important; color: var(--c-cinza-petroleo) !important; cursor: not-allowed; pointer-events: none; }
.v-btn.rt-btn-seta.v-btn--disabled::before { display: none; }
.v-btn.rt-btn-seta.v-btn--disabled::after { transform: translateX(0) scaleX(0); }
.v-btn.rt-btn-seta--block { width: calc(100% - 16px); }
@media (max-width: 639px) { .v-btn.rt-btn-seta--block-cel { width: calc(100% - 16px); } }
</style>
