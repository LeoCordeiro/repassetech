<script setup>
// Como funciona: abertura + trilha de quem vende (C) → quem compra (P) → dúvidas (C).
// Sem abas: as duas trilhas em sequência, com atalhos no topo. Cada espinha tem a própria fila de 120 ms.
// FAQ: só itens com publicar:true (resposta confirmada); altura não anima, a seta da marca gira no lugar do chevron.
// Imagem na coluna do título de cada trilha, abaixo do CTA, só ≥ 1024 (sticky: cabe na tela de 768); abaixo de 1024 nenhuma
// (v-if: nem entra no DOM, nem é baixada). Quem vende: a foto do lote pronto (caixas lacradas organizadas), na 1ª dobra da
// tela de mesa (sem lazy, prioridade alta: é o maior elemento ali). Quem compra: a ilustração do IMEI que bate com a etiqueta
// (invertida, lazy: fora da 1ª dobra) — nenhuma foto mostra isso.
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import EspinhaPassos from '@/components/blocos/EspinhaPassos.vue'
import FechoDuplo from '@/components/blocos/FechoDuplo.vue'
import BtnSeta from '@/components/marca/BtnSeta.vue'
import BtnContorno from '@/components/marca/BtnContorno.vue'
import LinkSeta from '@/components/marca/LinkSeta.vue'
import SetaMini from '@/components/marca/SetaMini.vue'
import FotoSecao from '@/components/blocos/FotoSecao.vue'
import { PASSOS_VENDEDOR, PASSOS_COMPRADOR } from '@/data/passos'
import { FAQ } from '@/data/faq'
import { ILUSTRACOES } from '@/data/ilustracoes'

const perguntas = FAQ.filter((f) => f.publicar)
const { mdAndUp } = useDisplay() // ilustração só ≥ 1024: abaixo disso nem entra no DOM (nem é baixada)
const aberto = ref(null)
</script>

<template>
  <div class="pagina pagina-como">
    <SecaoBloco tom="claro" sai labelledby="t-como-pag">
      <TituloSecao
        id="t-como-pag"
        :nivel="1"
        rotulo="Como funciona"
        titulo="Um lote, dois lados, quatro passos cada"
        lead="A Repasse Tech fica no meio: recebe os dados do lote, confere a documentação e só então mostra pra quem compra. Ela não compra, não revende e não estoca."
      >
        <nav class="como-atalhos" aria-label="Nesta página">
          <LinkSeta :to="{ hash: '#quem-compra' }">Ver os passos de quem compra</LinkSeta>
          <LinkSeta :to="{ hash: '#duvidas' }">Ver as dúvidas</LinkSeta>
        </nav>
      </TituloSecao>

      <hr class="fio-interno como-fio">

      <div class="g-trilha">
        <TituloSecao class="g-trilha__tit" rotulo="Pra quem vende" titulo="Do estoque parado à loja">
          <BtnSeta class="como-cta" to="/quero-vender" block-celular>Quero vender meu lote</BtnSeta>
          <!-- na 1ª dobra a 1024–1440 (logo abaixo do CTA): sem lazy -->
          <FotoSecao v-if="mdAndUp" class="como-foto" nome="secao-lote-pronto" eager sizes="(max-width: 1279px) 40vw, 520px" />
        </TituloSecao>
        <EspinhaPassos :passos="PASSOS_VENDEDOR" saida />
      </div>
    </SecaoBloco>

    <SecaoBloco tom="petroleo" costura="Na loja" sai labelledby="quem-compra">
      <div class="g-trilha">
        <TituloSecao id="quem-compra" class="g-trilha__tit" rotulo="Pra quem compra" titulo="Da loja à reposição">
          <BtnContorno class="como-cta" to="/quero-comprar" block-celular>Quero comprar lotes</BtnContorno>
          <img v-if="mdAndUp" class="como-ilus" :src="ILUSTRACOES.compra.src" :width="ILUSTRACOES.compra.w" :height="ILUSTRACOES.compra.h" :alt="ILUSTRACOES.compra.alt" :data-arquivo="ILUSTRACOES.compra.arquivo" loading="lazy" decoding="async" />
        </TituloSecao>
        <EspinhaPassos :passos="PASSOS_COMPRADOR" entrada saida />
      </div>
    </SecaoBloco>

    <SecaoBloco tom="claro" costura="Repassado" labelledby="duvidas">
      <div class="faq-g">
        <TituloSecao id="duvidas" class="faq-tit" rotulo="Dúvidas" titulo="O que todo lojista pergunta" />
        <VExpansionPanels v-model="aberto" v-reveal="{ grupo: true, stagger: 'linha' }" class="faq">
          <VExpansionPanel v-for="(f, i) in perguntas" :key="f.pergunta" :value="i" data-reveal-item>
            <VExpansionPanelTitle>
              {{ f.pergunta }}
              <template #actions="{ expanded }">
                <span class="faq-seta" :class="{ 'faq-seta--aberta': expanded }"><SetaMini size="m" /></span>
              </template>
            </VExpansionPanelTitle>
            <VExpansionPanelText>{{ f.resposta }}</VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </div>
      <FechoDuplo class="como-fecho" compacto />
    </SecaoBloco>
  </div>
</template>

<style>
.pagina-como .como-atalhos { display: flex; flex-wrap: wrap; gap: 12px 32px; margin-top: 28px; }
.pagina-como .como-fio { margin: 40px 0; }
.pagina-como .como-cta { margin-top: 28px; }
.pagina-como .como-ilus, .pagina-como .como-foto { display: none; }
/* tamanho natural (width/height do arquivo, 1:1 com o traço do Lottie), encolhe com a coluna; a foto ocupa a coluna */
@media (min-width: 1024px) {
  .pagina-como .como-ilus { display: block; height: auto; margin-top: 32px; }
  .pagina-como .como-foto { display: block; margin-top: 32px; max-width: 520px; }
}
.pagina-como .faq-g { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; }
.pagina-como .faq { border-top: 1px solid var(--border); }
.pagina-como .faq-seta { display: inline-flex; transition: transform var(--dur-hover) var(--ease-pass); }
.pagina-como .faq-seta--aberta { transform: rotate(90deg); }
/* hover e foco: a seta avança 4 px, como no LinkSeta (girada, avança para baixo) */
.pagina-como .faq-seta .seta-mini { transition: transform var(--dur-hover) var(--ease-pass); } /* avança = pass */
.pagina-como .faq .v-expansion-panel-title:focus-visible .faq-seta .seta-mini { transform: translateX(var(--shift-hover)); }
@media (hover: hover) and (pointer: fine) { .pagina-como .faq .v-expansion-panel-title:hover .faq-seta .seta-mini { transform: translateX(var(--shift-hover)); } }
/* resposta: entra com opacity + 4 px, fecha seco */
.pagina-como .faq .v-expansion-panel--active .v-expansion-panel-text__wrapper { animation: faq-abre var(--dur-hover) var(--ease-settle) both; }
@keyframes faq-abre { from { opacity: 0; transform: translateY(-4px); } }
.pagina-como .como-fecho { margin-top: 56px; }
@media (min-width: 1024px) {
  .pagina-como .faq-g { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 0 64px; align-items: start; }
}
</style>
