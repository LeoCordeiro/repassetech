<script setup>
// Quero vender. Bloco 1 claro com o formulário; bloco 2 petróleo com o que o lote precisa ter e a
// foto de apoio (caixas lacradas organizadas: ilustra o lote pronto pra conferência, não é estoque da Repasse Tech).
// ?tipo=<categoria do catálogo> ("Tenho um lote assim"): o formulário já vem com o tipo, a marca e a condição da categoria.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import RegrasVozAlta from '@/components/blocos/RegrasVozAlta.vue'
import FotoSecao from '@/components/blocos/FotoSecao.vue'
import FormVender from '@/components/form/FormVender.vue'
import { categoriaPorId } from '@/data/catalogo'

const route = useRoute()
const categoria = computed(() => (typeof route.query.tipo === 'string' ? categoriaPorId(route.query.tipo) : null))
const PRECISA = [
  { titulo: 'CNPJ ativo.', texto: 'O da sua empresa, na Receita.' },
  { titulo: 'Nota fiscal do lote.', texto: 'Sem nota, o lote não é publicado.' },
  { titulo: 'IMEI de cada celular e tablet com chip.', texto: 'Um por aparelho, pro comprador conferir. Tablet só Wi-Fi, acessórios e aparelhos de áudio e vídeo vão só com a nota.' },
  { titulo: 'Condição declarada.', texto: 'Novo lacrado, open box ou seminovo revisado.' },
]
</script>

<template>
  <div class="pagina pagina-vender">
    <SecaoBloco tom="claro" sai>
      <TituloSecao :nivel="1" rotulo="Quero vender" titulo="Monte o lote pra conferência." lead="Preencha os dados do lote. A mensagem sai pronta pro WhatsApp da Repasse Tech e a conferência começa por lá. A mercadoria continua com você." />
      <FormVender :categoria="categoria" />
    </SecaoBloco>

    <SecaoBloco tom="petroleo" costura="Conferindo" radial-at="0% 100%" labelledby="t-precisa">
      <div class="pv-precisa">
        <div>
          <TituloSecao id="t-precisa" rotulo="Antes de publicar" titulo="O que o lote precisa ter" />
          <RegrasVozAlta :regras="PRECISA" compacto />
        </div>
        <FotoSecao class="pv-foto" nome="secao-lote-pronto" sizes="(max-width: 1023px) calc(100vw - 32px), 480px" />
      </div>
    </SecaoBloco>
  </div>
</template>

<style>
.pv-precisa { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; }
@media (min-width: 1024px) { .pv-precisa { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 64px; align-items: center; } }
</style>
