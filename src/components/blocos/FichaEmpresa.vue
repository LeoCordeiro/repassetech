<script setup>
/**
 * Ficha: visual da EtiquetaLote, sem tag e sem selo. Padrão = a ficha da empresa (dado do CNPJ em
 * config/site.js). Sem a linha "Atividades": o CNAE de varejo contradizia "a gente conecta e confere".
 * `titulo` + `linhas` + slot (ação acima das linhas) reaproveitam o desenho no Contato.
 * Fundo branco em qualquer bloco (ctx-claro + tema próprio), como a etiqueta.
 */
import { provide } from 'vue'
import { SITE } from '@/config/site'

defineProps({
  titulo: { type: String, default: 'Ficha da empresa' },
  linhas: {
    type: Array,
    default: () => [
      ['Razão social', SITE.titular],
      ['Marca', SITE.marca],
      ['CNPJ', SITE.cnpj],
      ['Cidade', `${SITE.cidade}/${SITE.uf}`],
    ],
  }, // [[rótulo, valor]]
})
provide('rtTom', 'claro')
</script>

<template>
  <VCard class="ficha ctx-claro" theme="repasse" flat :rounded="0" border>
    <div class="ficha-cab"><span class="rotulo">{{ titulo }}</span></div>
    <div v-if="$slots.default" class="ficha-acao"><slot /></div>
    <dl class="ficha-corpo">
      <div v-for="[r, v] in linhas" :key="r" class="ficha-linha">
        <dt>{{ r }}</dt>
        <dd><slot name="valor" :rotulo="r" :valor="v">{{ v }}</slot></dd>
      </div>
    </dl>
  </VCard>
</template>

<style>
.v-card.ficha { max-width: 520px; border: 1px solid var(--c-borda-controle) !important; background: var(--c-branco) !important; color: var(--c-petroleo); }
.ficha-cab { padding: 10px 14px; border-bottom: 1px solid var(--c-fio); background: var(--c-gelo); }
.ficha-cab .rotulo { font-size: 12px; }
.ficha-acao { padding: 20px 14px 4px; }
.ficha-corpo { margin: 0; padding: 4px 14px 8px; }
.ficha-linha { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2px; padding: 10px 0; border-top: 1px solid var(--c-fio); }
.ficha-acao + .ficha-corpo { margin-top: 16px; }
.ficha-linha:first-child { border-top: 0; }
.ficha-acao + .ficha-corpo .ficha-linha:first-child { border-top: 1px solid var(--c-fio); }
.ficha-linha dt { font: 500 12px/1.3 var(--ff-t); letter-spacing: .14em; text-transform: uppercase; color: var(--c-azul-texto); }
.ficha-linha dd { margin: 0; font: 500 15px/1.4 var(--ff-c); font-variant-numeric: tabular-nums; color: var(--c-petroleo); overflow-wrap: anywhere; }
@media (min-width: 640px) { .ficha-linha { grid-template-columns: 128px minmax(0, 1fr); gap: 16px; align-items: baseline; } }
</style>
