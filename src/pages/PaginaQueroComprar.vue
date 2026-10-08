<script setup>
// Quero comprar. ?categoria=<id do catálogo> ("Pedir orçamento"): título e texto da categoria, a
// faixa de referência antes do 1º campo (< 1024) e o card da categoria ao lado (≥ 1024). ?alerta=1 = "Conte o que você procura"
// (o alerta automático NÃO existe: nenhum texto promete aviso nem retorno automático). Sem categoria, a coluna da direita é
// a prévia do pedido; as regras ficam SÓ no bloco petróleo. O parâmetro só vale se for uma categoria do catálogo: o texto
// da página nunca ecoa o que veio na URL.
// Bloco petróleo: a foto do balcão (iPhones expostos numa loja, em preto e branco) ao lado do que vem junto (≥ 1024).
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import RegrasVozAlta from '@/components/blocos/RegrasVozAlta.vue'
import ComparativoWhatsapp from '@/components/blocos/ComparativoWhatsapp.vue'
import FotoSecao from '@/components/blocos/FotoSecao.vue'
import FormComprar from '@/components/form/FormComprar.vue'
import { categoriaPorId } from '@/data/catalogo'

const route = useRoute()
const q = (k) => (typeof route.query[k] === 'string' ? route.query[k] : '')
const alerta = computed(() => q('alerta') === '1')
const categoria = computed(() => categoriaPorId(q('categoria')))
const titulo = computed(() =>
  alerta.value ? 'Conte o que você procura.' : categoria.value ? `Peça orçamento de ${categoria.value.frase}.` : 'Diga o que você precisa repor.',
)
const lead = computed(() =>
  alerta.value
    ? 'Marca, modelo e quantidade. O pedido sai pronto pro WhatsApp da Repasse Tech, e ela responde por lá.'
    : categoria.value
      ? 'Diga quanto e pra quando. O pedido sai pronto pro WhatsApp da Repasse Tech.'
      : 'Marca, modelo, quantidade e até quanto você paga por unidade. O pedido sai pronto pro WhatsApp da Repasse Tech.',
)
</script>

<template>
  <div class="pagina pagina-comprar">
    <SecaoBloco tom="claro" sai>
      <TituloSecao :nivel="1" rotulo="Quero comprar" :titulo="titulo" :lead="lead" />
      <FormComprar :categoria="categoria" :alerta="alerta" :marca="q('marca')" :condicao="q('condicao')" />
    </SecaoBloco>

    <SecaoBloco tom="petroleo" costura="Conferido" radial-at="0% 100%" labelledby="t-junto">
      <div class="pc-junto">
        <div>
          <TituloSecao id="t-junto" rotulo="O que vem junto" titulo="Lote da loja vem com CNPJ e nota fiscal conferidos." />
          <RegrasVozAlta compacto />
        </div>
        <FotoSecao class="pc-foto" nome="secao-balcao-loja" sizes="(max-width: 1023px) calc(100vw - 32px), 480px" />
      </div>
      <div class="pc-comp"><ComparativoWhatsapp /></div>
    </SecaoBloco>
  </div>
</template>

<style>
.pc-junto { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; }
@media (min-width: 1024px) { .pc-junto { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 64px; align-items: center; } }
.pc-comp { margin-top: 48px; }
</style>
