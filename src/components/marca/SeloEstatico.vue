<script setup>
/**
 * O selo PARADO: o mesmo desenho do poster do Lottie selo-verificado (quadro 13: anel azul-claro de 42/48, disco de 32/48 e
 * o check da marca), sem player. Usos:
 *  - o card cujo selo já carimbou (ou que nasce no poster: filtro, 2ª montagem) não cria um Lottie só
 *    para ficar parado (structuredClone + loadAnimation por card: um quadro de 133 ms no filtro a 375 com CPU 4×);
 *  - é o #fallback do selo-verificado (rede lenta): a vaga do selo nunca fica vazia.
 * Cor dos papéis da variante, como no gerador do Lottie: normal = disco petróleo e check branco; invertida = disco branco e
 * check petróleo; o anel é azul-claro nas duas. O check é o CheckMarca (um desenho só), na escala do Lottie (50% da caixa).
 */
import CheckMarca from './CheckMarca.vue'

defineProps({
  size: { type: Number, default: 24 },
  variant: { type: String, default: 'normal', validator: (v) => ['normal', 'invertida'].includes(v) },
})
</script>

<template>
  <span class="selo-estatico" :class="`selo-estatico--${variant}`" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <svg viewBox="0 0 48 48"><circle class="selo-estatico__anel" cx="24" cy="24" r="21" /><circle class="selo-estatico__disco" cx="24" cy="24" r="16" /></svg>
    <CheckMarca class="selo-estatico__check" />
  </span>
</template>

<style>
.selo-estatico { position: relative; display: inline-block; flex: none; vertical-align: middle; }
.selo-estatico > svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.selo-estatico__anel { fill: none; stroke: var(--c-azul-claro); stroke-width: 2; }
.selo-estatico__disco { fill: var(--c-petroleo); }
.selo-estatico--invertida .selo-estatico__disco { fill: var(--c-branco); }
.selo-estatico__check { position: absolute; left: 25%; top: 25%; width: 50%; height: 50%; color: var(--c-branco); }
.selo-estatico--invertida .selo-estatico__check { color: var(--c-petroleo); }
</style>
