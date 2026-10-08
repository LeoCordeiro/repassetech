<script setup>
// Confiança e conferência. Scan + selo: ScanConferencia (o mesmo bloco da Home).
// Ilustração "o que a conferência olha": logo abaixo do texto de abertura e alinhada a ele em toda largura; o painel do scan
// fica sozinho em cima, à direita. Está na 1ª dobra e é o LCP da página no celular: vem EMBUTIDA no JS da página
// (?inline), pintada junto com o texto — pedida à parte, ela chegava 0,6–0,9 s depois do 1º texto.
// Bloco das regras: a foto de apoio (mãos conferindo um aparelho; quem confere aparelho por aparelho é o comprador) ao lado
// das regras a partir de 1024, embaixo delas no celular — fora da 1ª dobra em toda largura: lazy, nunca o LCP.
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import RegrasVozAlta from '@/components/blocos/RegrasVozAlta.vue'
import ComparativoWhatsapp from '@/components/blocos/ComparativoWhatsapp.vue'
import FechoDuplo from '@/components/blocos/FechoDuplo.vue'
import FotoSecao from '@/components/blocos/FotoSecao.vue'
import ScanConferencia from '@/components/blocos/ScanConferencia.vue'
import SetaMini from '@/components/marca/SetaMini.vue'
import { NAO_FAZ } from '@/data/confianca'
import { ILUSTRACOES } from '@/data/ilustracoes'
import conferenciaSvg from '@/assets/ilustracoes/conferencia.svg?inline'

const ilus = ILUSTRACOES.conferencia
</script>

<template>
  <div class="pagina pag-conf">
    <SecaoBloco tom="claro" sai labelledby="t-conf">
      <div class="conf-g">
        <TituloSecao
          id="t-conf"
          :nivel="1"
          rotulo="Confiança e conferência"
          titulo="Lote sem nota fiscal não entra na loja."
          lead="O mercado de repasse tem fama de mercadoria sem origem. Aqui, a origem vem antes do preço: a Repasse Tech confere a documentação de cada lote antes de ele aparecer pra quem compra."
        />
        <ScanConferencia carimbo="selo-confianca" />
        <figure class="conf-ilus">
          <img :src="conferenciaSvg" :width="ilus.w" :height="ilus.h" :alt="ilus.alt" :data-arquivo="ilus.arquivo" fetchpriority="high" />
        </figure>
      </div>
    </SecaoBloco>

    <SecaoBloco tom="petroleo" costura="Conferindo" sai radial-at="100% 0%" labelledby="t-conf-regras">
      <div class="conf-regras-g">
        <div>
          <TituloSecao id="t-conf-regras" rotulo="As regras" titulo="O que todo lote precisa cumprir" />
          <RegrasVozAlta />
        </div>
        <FotoSecao class="conf-foto" nome="secao-conferencia" sizes="(max-width: 1023px) calc(100vw - 32px), 460px" />
      </div>
    </SecaoBloco>

    <SecaoBloco tom="claro" costura="Na loja" labelledby="t-conf-comp">
      <TituloSecao id="t-conf-comp" rotulo="Lado a lado" titulo="No grupo de WhatsApp × na Repasse Tech" />
      <ComparativoWhatsapp />
      <p class="legenda conf-leg">O grupo continua útil pra conversa. Pra fechar lote, a origem precisa estar no papel.</p>

      <hr class="fio-interno conf-fio" />
      <div v-reveal class="conf-nao">
        <h3 class="h3">O que a Repasse Tech não faz</h3>
        <ul class="nao-faz">
          <li v-for="i in NAO_FAZ" :key="i.titulo">
            <SetaMini limite />
            <p><strong>{{ i.titulo }}</strong> {{ i.texto }}</p>
          </li>
        </ul>
      </div>

      <FechoDuplo class="conf-fecho" compacto />
    </SecaoBloco>
  </div>
</template>

<style>
/* grid .conf-g e invólucro .conf-selo: base.css (o mesmo da Home); aqui só entra a área da ilustração, abaixo do texto */
.pag-conf .conf-g { grid-template-areas: "rot side" "h2 h2" "apoio apoio" "ilus ilus"; }
.pag-conf .conf-ilus { grid-area: ilus; margin: 32px 0 0; }
.pag-conf .conf-ilus img { height: auto; } /* tamanho natural (o do arquivo), encolhe com a coluna */
@media (min-width: 1024px) {
  /* o painel do scan ocupa as 3 linhas do texto; se for mais alto que elas, a 4ª linha (1fr) absorve a sobra — com só
     linhas auto, o grid repartia a altura e o título descia, longe do rótulo. A ilustração vem depois, na coluna do texto */
  .pag-conf .conf-g { grid-template-areas: "rot side" "h2 side" "apoio side" ". side" "ilus ."; grid-template-rows: auto auto auto 1fr auto; }
}
/* regras à esquerda (8/12) e a foto à direita a partir de 1024; no celular a foto desce para depois das regras */
.pag-conf .conf-regras-g { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; }
@media (min-width: 1024px) { .pag-conf .conf-regras-g { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 64px; align-items: center; } }
.pag-conf .conf-fecho { margin-top: 48px; }
.pag-conf .conf-leg { margin: 16px 0 0; max-width: 62ch; }
.pag-conf .conf-fio { margin: 48px 0 40px; }
.pag-conf .nao-faz { list-style: none; margin: 20px 0 0; padding: 0; display: grid; gap: 14px; max-width: 68ch; }
.pag-conf .nao-faz li { display: grid; grid-template-columns: 18px minmax(0, 1fr); column-gap: 14px; align-items: start; }
.pag-conf .nao-faz .seta-mini { margin-top: 6px; }
.pag-conf .nao-faz p { margin: 0; color: var(--text-2); }
.pag-conf .nao-faz strong { font-weight: 600; color: var(--text); }
</style>
