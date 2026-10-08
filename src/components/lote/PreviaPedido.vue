<script setup>
/**
 * "Pedido de reposição · PRÉVIA" (Quero comprar ≥ 1024, sem ?categoria): o espelho da etiqueta do Quero vender, no
 * mesmo desenho. Se preenche com o que a pessoa escolhe e digita; vazio = "—". Sem aria-live (anunciar a cada tecla
 * atrapalha). Branca em qualquer bloco: tema próprio + rtTom 'claro'.
 */
import { provide } from 'vue'
import './etiqueta.css'

defineProps({ linhas: { type: Array, required: true } }) // [[rótulo, valor]]
provide('rtTom', 'claro')
</script>

<template>
  <VCard class="etiqueta etiqueta--pedido ctx-claro" theme="repasse" flat :rounded="0" border role="group" aria-label="Prévia do pedido de reposição">
    <div class="etq-cab"><span class="rotulo">Pedido de reposição</span><span class="tag-ex">PRÉVIA</span></div>
    <dl class="etq-linhas">
      <div v-for="[r, v] in linhas" :key="r">
        <dt>{{ r }}</dt>
        <dd :class="{ vazio: !v }">{{ v || '—' }}</dd>
      </div>
    </dl>
    <p class="legenda etq-pe">Vai pronto pro WhatsApp da Repasse Tech. Você confere antes de enviar.</p>
  </VCard>
</template>
