<script setup>
// Loja = o CATÁLOGO: os tipos de lote que circulam, cada um com a condição aceita, o documento
// que exige e a regra de entrada no selo. Nenhum lote real (sem quantidade, preço nem data): os lotes reais vão só para
// empresa cadastrada, pela equipe, no WhatsApp. "Quero receber os lotes" → Quero comprar em "Conte o que você procura"
// (?alerta=1): ao lado do título a partir de 640; no celular, depois do catálogo (a 1ª tela fica com o título, os filtros e a 1ª categoria).
// Filtros (categoria e condição) vivem na query da URL (só valor de filtro, nunca dado pessoal); trocar filtro não mexe na
// rolagem. "Limpar filtros" leva o foco à contagem: o Tab seguinte chega ao 1º card (nunca o foco perdido no <body>).
// Bloco petróleo: o que o selo de cada lote quer dizer, com o queixo ampliado nas duas versões (com e sem IMEI).
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import FiltroLotes from '@/components/lote/FiltroLotes.vue'
import GradeCatalogo from '@/components/lote/GradeCatalogo.vue'
import EstadoVazio from '@/components/lote/EstadoVazio.vue'
import BtnSeta from '@/components/marca/BtnSeta.vue'
import LinkSeta from '@/components/marca/LinkSeta.vue'
import SeloVerificado from '@/components/marca/SeloVerificado.vue'
import { CATEGORIAS, FILTROS, GRUPOS_FILTRO, alertaPara } from '@/data/catalogo'
import { IMEI } from '@/data/conferencia-imei'

const route = useRoute()
const router = useRouter()
const { smAndUp, mdAndUp } = useDisplay()
const valido = (g, v) => FILTROS[g].opcoes.some((o) => o.valor !== null && o.valor === v)

const filtros = computed(() =>
  Object.fromEntries(GRUPOS_FILTRO.map((g) => [g, valido(g, route.query[g]) ? route.query[g] : null])),
)
function aplicar(f) {
  const query = Object.fromEntries(GRUPOS_FILTRO.filter((g) => f[g]).map((g) => [g, f[g]]))
  return router.replace({ query })
}
const contagemEl = ref(null)
async function limpar() {
  await aplicar({})
  await nextTick()
  contagemEl.value?.focus({ preventScroll: true })
}

const n = ref(CATEGORIAS.length)
const contagem = computed(() => (n.value === 0 ? 'Nenhuma categoria com esse filtro' : n.value === 1 ? '1 categoria' : `${n.value} categorias`))
const alertaTo = computed(() => alertaPara(filtros.value))
const alertaGeral = { path: '/quero-comprar', query: { alerta: '1' } }
const legendaCta = 'Os lotes reais são mostrados só a empresas cadastradas, depois da conferência.'
// quantas fotos estão na 1ª dobra (sem lazy): 1 coluna no celular, 2 de 640 a 1023, a 1ª linha de 4 a partir de 1024
const naDobra = computed(() => (mdAndUp.value ? 4 : smAndUp.value ? 2 : 1))
// bloco "O selo": o 2º carimba --stagger-passo depois de o 1º COMEÇAR a carimbar
const primeiroCarimbou = ref(false)
</script>

<template>
  <div class="pagina pag-loja">
    <SecaoBloco tom="claro" sai labelledby="t-loja">
      <div class="loja-topo">
        <TituloSecao
          id="t-loja"
          :nivel="1"
          rotulo="Loja"
          titulo="O que circula na Repasse Tech"
          lead="Os tipos de lote que lojista repassa pra lojista por aqui, com a condição aceita e o documento que cada um exige. Quantidade, condição e preço de cada lote real vêm pela equipe, no WhatsApp."
        />
        <div v-if="smAndUp" class="loja-cta">
          <BtnSeta :to="alertaGeral">Quero receber os lotes</BtnSeta>
          <p class="legenda loja-cta__leg">{{ legendaCta }}</p>
        </div>
      </div>
      <FiltroLotes :model-value="filtros" @update:model-value="aplicar" />
      <p ref="contagemEl" class="legenda loja-contagem" tabindex="-1" aria-live="polite" aria-atomic="true">{{ contagem }}</p>
      <GradeCatalogo :categorias="CATEGORIAS" :filtros="filtros" :eager="naDobra" @contagem="n = $event">
        <template #vazio>
          <EstadoVazio :nivel="2" :alerta-to="alertaTo" @limpar="limpar" />
        </template>
      </GradeCatalogo>
      <!-- no celular, depois do catálogo: a 1ª tela fica com o título, os filtros e a 1ª categoria (e a saída do vazio cabe nela) -->
      <div v-if="!smAndUp" class="loja-cta loja-cta--fim">
        <BtnSeta :to="alertaGeral" block-celular>Quero receber os lotes</BtnSeta>
        <p class="legenda loja-cta__leg">{{ legendaCta }}</p>
      </div>
    </SecaoBloco>

    <SecaoBloco tom="petroleo" costura="Conferido" radial-at="100% 0%" labelledby="t-loja-selo">
      <div class="loja-selo">
        <TituloSecao id="t-loja-selo" rotulo="O selo" titulo="O que o selo de cada lote quer dizer" :lead="IMEI.lojaLead" />
        <div class="loja-queixos">
          <figure v-for="(q, i) in IMEI.lojaQueixos" :key="q.carimbo" class="loja-queixo">
            <span class="loja-queixo__moldura"><span class="loja-queixo__tela" aria-hidden="true" /><span class="loja-queixo__base">
              <!-- os dois carimbam um depois do outro: o 2º espera --stagger-passo -->
              <SeloVerificado formato="queixo" :texto="q.texto" animado variant="invertida" :size="36" :carimbo="q.carimbo" :atraso="i ? '--stagger-passo' : ''" :liberado="!i || primeiroCarimbou" @carimbou="!i && (primeiroCarimbou = true)" />
            </span></span>
            <figcaption class="legenda">{{ q.legenda }}</figcaption>
          </figure>
        </div>
      </div>
      <p class="loja-regras">Pra entrar na loja, todo lote cumpre quatro regras: CNPJ ativo, nota fiscal, IMEI verificável em celular e tablet com chip, e conferência antes de publicar.</p>
      <p class="loja-mais"><LinkSeta to="/confianca">Ver como a conferência funciona</LinkSeta></p>
    </SecaoBloco>
  </div>
</template>

<style>
/* título à esquerda e o "Quero receber os lotes" à direita (≥ 1024); no celular o botão desce inteiro, em largura total */
.pag-loja .loja-topo { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 24px 48px; }
.pag-loja .loja-topo > .titulo-secao { flex: 1 1 520px; min-width: 0; }
.pag-loja .loja-cta { flex: 0 1 360px; display: grid; gap: 10px; justify-items: start; min-width: 0; }
.pag-loja .loja-cta__leg { margin: 0; max-width: 40ch; }
.pag-loja .loja-cta--fim { margin-top: 32px; justify-items: stretch; }
.pag-loja .loja-contagem { margin: 16px 0 0; font-variant-numeric: tabular-nums; }
.pag-loja .loja-contagem:focus { outline: none; }
.pag-loja .loja-contagem:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.pag-loja .loja-contagem + .grade-catalogo .cat-grid { margin-top: 12px; }
.pag-loja .loja-mais { margin: 16px 0 0; }
/* o selo explicado: o queixo do card ampliado (moldura --motivo, fim da tela branca, selo de 36 px) */
.loja-selo { display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px; }
.loja-queixos { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
.loja-queixo { margin: 0; display: grid; gap: 10px; justify-items: start; }
.loja-queixo__moldura { display: grid; width: min(100%, 320px); padding: 0 8px; border-radius: 0 0 var(--r-card) var(--r-card); background: var(--motivo); box-shadow: var(--sombra-card); }
.loja-queixo__tela { height: 22px; border-radius: 0 0 var(--r-tela) var(--r-tela); background: var(--c-branco); }
.loja-queixo__base { display: flex; align-items: center; justify-content: center; height: 64px; }
.loja-queixo .selo--queixo { gap: 10px; font-size: 17px; }
.loja-queixo .legenda { margin: 0; color: var(--text-2); }
.pag-loja .loja-regras { margin: 40px 0 0; max-width: 62ch; padding-top: 20px; border-top: 1px solid var(--border); color: var(--text-2); }
@media (min-width: 1024px) {
  .loja-selo { grid-template-columns: minmax(0, 6fr) minmax(0, 6fr); gap: 64px; align-items: center; }
  .loja-queixos { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
}
</style>
