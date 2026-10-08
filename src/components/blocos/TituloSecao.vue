<script setup>
/**
 * Rótulo + título (+ lead). nivel 1 = cabeçalho de página interna: H1 com tabindex -1 (o router foca) e a
 * assinatura de movimento — a seta da marca (SetaMarca, geometria da logo) desenha antes do rótulo na entrada da rota.
 * O H1 das internas usa .h2 (até 48 px); o display de 76 px é só do hero da Home.
 */
import SetaMarca from '../marca/SetaMarca.vue'

defineProps({
  rotulo: { type: String, default: '' },
  titulo: { type: String, required: true },
  nivel: { type: Number, default: 2, validator: (v) => [1, 2, 3].includes(v) },
  id: { type: String, default: undefined },
  lead: { type: String, default: '' },
})
</script>

<template>
  <div class="titulo-secao" :class="{ 'titulo-secao--pagina': nivel === 1 }">
    <p v-if="rotulo" class="rotulo tp-rotulo">
      <SetaMarca v-if="nivel === 1" class="tp-seta" :largura="44" :altura="12" />{{ rotulo }}
    </p>
    <h1 v-if="nivel === 1" :id="id" class="h2 tp-titulo" tabindex="-1">{{ titulo }}</h1>
    <h2 v-else-if="nivel === 2" :id="id" class="h2 tp-titulo">{{ titulo }}</h2>
    <h3 v-else :id="id" class="h3 tp-titulo">{{ titulo }}</h3>
    <p v-if="lead" class="lead tp-lead">{{ lead }}</p>
    <slot />
  </div>
</template>

<style>
.titulo-secao .tp-lead { margin: 16px 0 0; }
.tp-rotulo { display: flex; align-items: center; gap: 10px; }
/* seta do cabeçalho de página: desenha da esquerda para a direita (scaleX na entrada da rota, base.css) */
.tp-seta { transform-origin: left; }
</style>
