<script setup>
/** Fecho: eco do hero, duas colunas (≥ 1024) ou empilhado. `compacto` tira o H2 (páginas internas). Bloco claro. */
import BtnContorno from '../marca/BtnContorno.vue'
import BtnSeta from '../marca/BtnSeta.vue'

defineProps({
  titulo: { type: String, default: 'Tem lote parado ou precisa repor?' },
  compacto: { type: Boolean, default: false },
  nivel: { type: Number, default: 2 },
})
</script>

<template>
  <div class="fecho" :class="{ 'fecho--compacto': compacto }">
    <component :is="`h${nivel}`" v-if="!compacto" class="h2 fecho-tit">{{ titulo }}</component>
    <div v-reveal="{ grupo: true }" class="fecho-g">
      <div class="fecho-col" data-reveal-item>
        <p class="rotulo">Quem tem lote parado</p>
        <p class="fecho-txt">Monte o lote com nota. Celular e tablet com chip vão com IMEI. A mensagem vai pronta pro WhatsApp da Repasse Tech.</p>
        <BtnSeta to="/quero-vender" block-celular>Quero vender meu lote</BtnSeta>
      </div>
      <div class="fecho-col" data-reveal-item>
        <p class="rotulo">Quem precisa repor</p>
        <p class="fecho-txt">Diga marca, modelo e quantidade. O pedido vai pronto pro WhatsApp da Repasse Tech.</p>
        <BtnContorno to="/quero-comprar" block-celular>Quero comprar lotes</BtnContorno>
      </div>
    </div>
  </div>
</template>

<style>
.fecho-tit { margin: 0 0 32px; }
.fecho-g { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; }
.fecho-col { display: grid; justify-items: start; align-content: start; gap: 12px; min-width: 0; padding-top: 20px; border-top: 1px solid var(--border); }
.fecho-txt { margin: 0 0 12px; color: var(--text-2); max-width: 46ch; }
@media (min-width: 1024px) { .fecho-g { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; } }
</style>
