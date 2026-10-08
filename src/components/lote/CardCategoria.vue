<script setup>
/**
 * Card do catálogo = um celular (moldura --motivo com o raio e a sombra dos tokens, falante, tela branca, queixo com o selo).
 * Mostra um TIPO de lote, nunca um lote: a foto da categoria, o que circula, as condições aceitas, o documento exigido e,
 * no queixo, a REGRA de entrada ("Só entra com NF + IMEI conferidos"). Sem quantidade, preço, data nem código.
 * Duas ações: "Pedir orçamento" (Quero comprar com a categoria) e "Tenho um lote assim" (Quero vender com o tipo).
 * `referencia`: o card ao lado do pedido (Quero comprar ≥ 1024), sem as ações e com a lingueta de escolhido.
 * Foto: <img> responsivo (srcset 480/800/1200 + sizes), width/height na proporção (zero CLS), object-position do ponto
 * focal, lazy fora da 1ª dobra (`eager` = está na dobra: sem lazy e com prioridade alta).
 * Quem toca o selo é a GradeCatalogo (tocarSelo/posterSelo).
 */
import { computed, ref } from 'vue'
import SeloVerificado from '../marca/SeloVerificado.vue'
import LinkSeta from '../marca/LinkSeta.vue'
import { SIZES_CARD, documentoDe, regraDe, regraExtensoDe } from '@/data/catalogo'
import { foto } from '@/data/fotos'

const props = defineProps({
  categoria: { type: Object, required: true }, // um item de data/catalogo.js
  eager: { type: Boolean, default: false },
  // largura do card: 1 coluna (< 640), 2 (640–1023), 4 (≥ 1024, no máximo 1232 de conteúdo)
  sizes: { type: String, default: SIZES_CARD },
  referencia: { type: Boolean, default: false },
  seloAnimado: { type: Boolean, default: false },
  seloPoster: { type: Boolean, default: false }, // selo já carimbado: fica no poster
})
const f = computed(() => foto(props.categoria.foto))
const orcamento = computed(() => ({ path: '/quero-comprar', query: { categoria: props.categoria.id } }))
const tenho = computed(() => ({ path: '/quero-vender', query: { tipo: props.categoria.id } }))
const selo = ref(null)
defineExpose({ tocarSelo: () => selo.value?.play(), posterSelo: () => selo.value?.poster() })
</script>

<template>
  <article class="cat" :class="{ 'cat--ref': referencia }" :aria-labelledby="`cat-${categoria.id}${referencia ? '-ref' : ''}`">
    <span class="cat-falante" aria-hidden="true" />
    <div class="cat-tela ctx-claro">
      <img
        class="cat-foto foto"
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
      <h3 :id="`cat-${categoria.id}${referencia ? '-ref' : ''}`" class="cat-titulo">{{ categoria.titulo }}</h3>
      <p class="cat-texto">{{ categoria.texto }}</p>
      <ul class="cat-conds" aria-label="Condições aceitas">
        <li v-for="c in categoria.conds" :key="c" class="chip-cond">{{ c }}</li>
      </ul>
      <p class="cat-doc"><span class="cat-doc__rot">Pra entrar</span>{{ documentoDe(categoria) }}</p>
      <div v-if="!referencia" class="cat-acoes">
        <VBtn class="cat-orcamento" :to="orcamento" block>Pedir orçamento<span class="vh"> de {{ categoria.frase }}</span></VBtn>
        <LinkSeta :to="tenho">Tenho um lote assim<span class="vh">: {{ categoria.frase }}</span></LinkSeta>
      </div>
    </div>
    <span class="cat-queixo">
      <span aria-hidden="true">
        <SeloVerificado ref="selo" formato="queixo" :texto="regraDe(categoria)" :animado="seloAnimado" variant="invertida" :poster-inicial="seloPoster" />
      </span>
      <span class="vh">Regra: {{ regraExtensoDe(categoria) }}.</span>
    </span>
  </article>
</template>

<style>
.cat {
  position: relative; display: flex; flex-direction: column; min-width: 0; padding: 18px 6px 0; border-radius: var(--r-card);
  background: var(--motivo); color: var(--c-petroleo); box-shadow: var(--sombra-card);
}
/* lingueta do escolhido (o card de referência ao lado do pedido) */
.cat::before {
  content: ""; position: absolute; top: 50%; left: 100%; width: 12px; height: 18px; margin-top: -9px; background: var(--c-laranja);
  clip-path: polygon(0 0, 100% 50%, 0 100%); opacity: 0;
}
.cat--ref { outline: 2px solid var(--c-laranja); outline-offset: 3px; }
.cat--ref::before { opacity: 1; }
.cat-falante { position: absolute; top: 7px; left: 50%; width: 28px; height: 4px; margin-left: -14px; border-radius: 2px; background: var(--c-azul-claro); }
.cat-tela {
  position: relative; flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 0 14px 14px; border-radius: var(--r-tela);
  background: var(--c-branco); overflow: hidden;
}
/* a foto ocupa a parte de cima da tela do celular: a tela é a moldura (raio + sombra da moldura), nunca foto solta */
.cat-foto { display: block; width: calc(100% + 28px); max-width: none; height: auto; aspect-ratio: 4 / 3; margin: 0 -14px 6px; object-fit: cover; background: var(--c-gelo); }
.cat-titulo { margin: 0; font: 600 var(--fs-h3)/1.25 var(--ff-t); letter-spacing: -.005em; color: var(--c-petroleo); }
.cat-texto { margin: 0; font: 400 15px/1.5 var(--ff-c); color: var(--c-cinza-petroleo); }
.cat-conds { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 0; padding: 0; }
.chip-cond { padding: 5px 7px; border-radius: var(--r-chip); background: var(--c-gelo); color: var(--c-petroleo); font: 500 12px/1 var(--ff-t); letter-spacing: .06em; text-transform: uppercase; }
.cat-doc { margin: 4px 0 0; padding-top: 10px; border-top: 1px solid var(--c-fio); font: 500 14px/1.45 var(--ff-c); color: var(--c-petroleo); }
.cat-doc__rot { display: block; margin-bottom: 2px; font: 500 12px/1.2 var(--ff-t); letter-spacing: .14em; text-transform: uppercase; color: var(--c-azul-texto); }
.cat-acoes { display: grid; justify-items: start; gap: 2px; margin-top: auto; padding-top: 8px; }
.cat-acoes .v-btn.cat-orcamento { width: 100%; }
.cat-queixo { display: flex; align-items: center; justify-content: center; min-height: 40px; padding: 8px 6px; text-align: center; }
.cat-queixo .selo--queixo { flex-wrap: wrap; justify-content: center; line-height: 1.3; }
</style>
