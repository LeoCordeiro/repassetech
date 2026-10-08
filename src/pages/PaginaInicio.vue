<script setup>
// Home: hero split → confiança (P) → catálogo (C) → como funciona (P) → fecho (C).
// A confiança fica logo abaixo do hero (confiança é o produto: cedo e em destaque). Cada seção mantém o tom; a
// ordem das costuras conta o caminho do lote: o lote entra (conferência) → na loja → negociando (os passos) → repassado.
// Toda divisa entre tons tem costura com rótulo; quem tem bloco com costura embaixo leva `sai`.
// Catálogo: a prévia da Loja, 4 categorias (2 abaixo de 640) e o link para as 8. Fecho: a foto de apoio ao lado do título
// (longe da 1ª dobra em toda largura: lazy, nunca o LCP).
import { useDisplay } from 'vuetify'
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import EspinhaPassos from '@/components/blocos/EspinhaPassos.vue'
import RegrasVozAlta from '@/components/blocos/RegrasVozAlta.vue'
import FechoDuplo from '@/components/blocos/FechoDuplo.vue'
import FotoSecao from '@/components/blocos/FotoSecao.vue'
import GradeCatalogo from '@/components/lote/GradeCatalogo.vue'
import LinkSeta from '@/components/marca/LinkSeta.vue'
import HeroRepasse from '@/components/blocos/HeroRepasse.vue'
import ScanConferencia from '@/components/blocos/ScanConferencia.vue'
import { PASSOS_HOME } from '@/data/passos'
import { CATEGORIAS, DESTAQUES } from '@/data/catalogo'

const { smAndUp } = useDisplay()
</script>

<template>
  <div class="pagina pagina-inicio">
    <HeroRepasse />

    <SecaoBloco id="confianca" tom="petroleo" costura="O lote entra" sai radial-at="100% 0%" labelledby="t-conf">
      <div class="conf-g">
        <TituloSecao
          id="t-conf"
          rotulo="Confiança e conferência"
          titulo="Lote sem nota fiscal não entra na loja."
          lead="O mercado de repasse tem fama de mercadoria sem origem. Aqui, a origem vem antes do preço."
        />
        <ScanConferencia carimbo="selo-conf-inicio" />
        <RegrasVozAlta />
      </div>
      <p class="mais"><LinkSeta to="/confianca">Ver como a conferência funciona</LinkSeta></p>
    </SecaoBloco>

    <SecaoBloco id="loja" tom="claro" costura="Na loja" sai labelledby="t-loja-previa">
      <TituloSecao
        id="t-loja-previa"
        rotulo="Loja"
        titulo="O que circula na Repasse Tech"
        lead="Celular, tablet, acessório e áudio, cada um com a condição aceita e o documento que precisa pra entrar. Os lotes reais vão só pra empresa cadastrada."
      />
      <GradeCatalogo :categorias="DESTAQUES" :limite="smAndUp ? 0 : 2" aguardar-costura />
      <p class="mais"><LinkSeta to="/loja">Ver as {{ CATEGORIAS.length }} categorias da loja</LinkSeta></p>
    </SecaoBloco>

    <SecaoBloco id="como-funciona" tom="petroleo" costura="Negociando" sai labelledby="t-como">
      <div class="g-trilha">
        <TituloSecao class="g-trilha__tit" id="t-como" rotulo="Como funciona" titulo="Do estoque parado ao repasse fechado, em quatro passos">
          <p class="mais"><LinkSeta to="/como-funciona">Ver o passo a passo de quem vende e de quem compra</LinkSeta></p>
        </TituloSecao>
        <EspinhaPassos :passos="PASSOS_HOME" entrada saida />
      </div>
    </SecaoBloco>

    <SecaoBloco tom="claro" costura="Repassado" labelledby="t-fecho">
      <div class="inicio-fecho">
        <h2 id="t-fecho" class="h2 inicio-fecho__tit">Tem lote parado ou precisa repor?</h2>
        <FotoSecao class="inicio-fecho__foto" nome="secao-mao-caixa" sizes="(max-width: 1023px) calc(100vw - 32px), 460px" />
      </div>
      <FechoDuplo compacto />
    </SecaoBloco>
  </div>
</template>

<style>
.pagina-inicio .mais { margin: 32px 0 0; }
/* < 1024 o fim do hero e a confiança são os dois petróleo: um fio na divisa dá à costura "O lote entra" uma borda para
   cruzar. Sombra interna, não borda: a seta da costura fica centrada em top 0 */
@media (max-width: 1023px) { .pagina-inicio #confianca { box-shadow: inset 0 1px 0 var(--border); } }
.inicio-fecho { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; margin-bottom: 40px; }
.inicio-fecho__tit { margin: 0; }
@media (min-width: 1024px) {
  .inicio-fecho { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 64px; align-items: center; }
}
</style>
