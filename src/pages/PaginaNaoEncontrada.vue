<script setup>
// Endereço que não é rota (link quebrado ou cortado, caminho digitado errado): diz o que aconteceu e oferece os dois
// caminhos do site e o início, em vez de cair calado na Home.
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import FechoDuplo from '@/components/blocos/FechoDuplo.vue'
import LinkSeta from '@/components/marca/LinkSeta.vue'
</script>

<template>
  <div class="pagina pag-nao-encontrada">
    <SecaoBloco tom="claro" labelledby="t-nao-encontrada">
      <TituloSecao
        id="t-nao-encontrada"
        :nivel="1"
        rotulo="Endereço"
        titulo="Página não encontrada."
        lead="Este endereço não existe no site da Repasse Tech. O link pode ter vindo cortado, ou a página mudou de lugar."
      />
      <p class="ne-inicio"><LinkSeta to="/">Ir para o início</LinkSeta></p>
      <FechoDuplo class="ne-fecho" compacto />
    </SecaoBloco>
  </div>
</template>

<style>
.pag-nao-encontrada .ne-inicio { margin: 28px 0 0; }
.pag-nao-encontrada .ne-fecho { margin-top: 48px; }
</style>
