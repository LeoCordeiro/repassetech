<script setup>
/**
 * Foto de seção (3:2) na moldura padrão do site: o raio do card e a sombra do bloco (--r-card, --sombra-card), nunca sangrando.
 * <img> responsivo (srcset 640/960/1440 + sizes), width/height na proporção (zero CLS), ponto focal do data/fotos.js.
 * Lazy por padrão: as fotos de seção ficam fora da 1ª dobra no celular, para nunca virarem o LCP; `eager` só se o lugar
 * dela for a 1ª dobra (e aí com prioridade alta).
 * O alt descreve o que aparece; nunca diz que é a loja, a equipe ou o estoque da Repasse Tech.
 */
import { computed } from 'vue'
import { foto } from '@/data/fotos'

const props = defineProps({
  nome: { type: String, required: true }, // secao-conferencia | secao-lote-pronto | secao-balcao-loja | secao-mao-caixa
  sizes: { type: String, default: '(max-width: 1023px) calc(100vw - 32px), 560px' },
  eager: { type: Boolean, default: false },
})
const f = computed(() => foto(props.nome))
</script>

<template>
  <figure class="foto-secao">
    <img
      class="foto"
      :src="f.src"
      :srcset="f.srcset"
      :sizes="sizes"
      :width="f.width"
      :height="f.height"
      :alt="f.alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      decoding="async"
      :style="{ objectPosition: f.foco }"
      :data-foto="f.nome"
    />
  </figure>
</template>

<style>
.foto-secao { margin: 0; min-width: 0; }
.foto-secao .foto {
  display: block; width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover; border-radius: var(--r-card);
  background: var(--c-gelo); box-shadow: var(--sombra-card);
}
</style>
