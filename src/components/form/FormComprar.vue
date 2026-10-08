<script setup>
/**
 * Formulário do comprador. Fecha no WhatsApp com [COMPRAR]; nada vai para
 * servidor. "O que você precisa" vem primeiro; "Sua empresa" (só o CNPJ obrigatório) no fim.
 * Pré-preenche com ?categoria (a marca e as condições da categoria do catálogo), ?marca, ?condicao e ?alerta=1.
 * ?alerta=1 ("Quero receber os lotes" e "Pedir um lote assim", na Loja): marca "Sem prazo" (o serviço de alerta automático
 * NÃO existe: nada promete aviso nem retorno automático). O que a URL pôs sai quando a URL tira; o que a pessoa
 * escolheu fica — marca, modelo, condição e prazo.
 * Marca "Outra" abre "Qual marca?": a mensagem leva a marca escrita, nunca "Outra".
 * A 2ª linha da mensagem começa pelo prazo ("Agora: 10 un. · …"): é o que separa pedido urgente de interesse.
 * Ao lado (≥ 1024): com ?categoria, o card da categoria; sem ela, a prévia "Pedido de reposição" (espelho da etiqueta do
 * Quero vender). Abaixo de 1024, com ?categoria, uma faixa da referência ANTES do 1º campo.
 * Último campo: o aceite dos Termos de uso (AceiteTermos); a mensagem leva a linha do aceite com a versão.
 */
import { computed, onMounted, reactive, ref, nextTick, watch } from 'vue'
import { useDisplay } from 'vuetify'
import CampoForm from './CampoForm.vue'
import EscolhaChips from './EscolhaChips.vue'
import EnvioForm from './EnvioForm.vue'
import AceiteTermos from './AceiteTermos.vue'
import CardCategoria from '../lote/CardCategoria.vue'
import PreviaPedido from '../lote/PreviaPedido.vue'
import LinkSeta from '../marca/LinkSeta.vue'
import {
  CONDICOES, MARCAS, MAX, ORDEM_ACEITE, ORDEM_EMPRESA, REGRAS_ACEITE, REGRAS_EMPRESA, formatarPreco, inteiroMin1, lerPreco, mascararCampoCnpj,
  obrigatorio, useEnvioWhatsapp,
} from '@/composables/useEnvioWhatsapp'
import './form-lote.css'

const props = defineProps({
  categoria: { type: Object, default: null }, // item de data/catalogo.js (?categoria=)
  alerta: { type: Boolean, default: false },
  marca: { type: String, default: '' },
  condicao: { type: String, default: '' },
})

const SEM_PRAZO = 'Sem prazo'
const PRAZOS = ['Agora', 'Nos próximos 30 dias', SEM_PRAZO]
const daLista = (lista, x) => (lista.includes(x) ? [x] : [])
const temValor = (x) => (Array.isArray(x) ? x.length > 0 : !!x)
// os campos que a URL preenche, e se o valor de agora veio dela e ninguém mexeu (a escolha da pessoa vira "dela")
const DA_URL = ['marcas', 'modelos', 'conds', 'prazo']
const daUrl = { marcas: false, modelos: false, conds: false, prazo: false }
/** O que a URL põe em cada campo (só lê: não mexe em nada). */
const pelaUrl = () => ({
  marcas: daLista(MARCAS, props.categoria?.marca || props.marca),
  modelos: '',
  conds: props.categoria ? CONDICOES.filter((c) => props.categoria.conds.includes(c)) : daLista(CONDICOES, props.condicao),
  prazo: props.alerta ? SEM_PRAZO : null,
})
const marcarOrigemDaUrl = (u) => DA_URL.forEach((k) => (daUrl[k] = temValor(u[k])))
/** Os valores do começo (os da URL entram e ficam marcados como "da URL"): o formulário novo e o "Fazer outro pedido". */
const reiniciarValores = () => {
  const u = pelaUrl()
  marcarOrigemDaUrl(u)
  return { ...u, marcaOutra: '', qtd: '', precoMax: '', cnpj: '', empresa: '', obs: '', aceite: false }
}
const v = reactive(reiniciarValores())
const mexeu = (k) => (daUrl[k] = false)
// a mesma página pode trocar de ?categoria / ?marca / ?alerta sem remontar: acompanha só o campo que a URL pôs (ou vazio)
watch(
  () => [props.categoria?.id, props.marca, props.condicao, props.alerta],
  () => {
    const u = pelaUrl()
    for (const k of DA_URL) {
      if (!daUrl[k] && temValor(v[k])) continue // escolha da pessoa: fica
      v[k] = u[k]
      daUrl[k] = temValor(u[k])
    }
  },
)
/** As marcas como vão na mensagem e na prévia: "Outra" vira a marca escrita. */
const marcasTexto = () => v.marcas.map((m) => (m === 'Outra' ? v.marcaOutra.trim() || 'Outra' : m)).join(', ')

const regras = {
  marcas: [obrigatorio('Escolha pelo menos uma marca.')],
  marcaOutra: [(x) => !v.marcas.includes('Outra') || !!String(x).trim() || 'Escreva qual é a marca.'],
  qtd: [inteiroMin1('Informe a quantidade: 1 ou mais, sem vírgula.')],
  precoMax: [(x) => !String(x ?? '').trim() || lerPreco(x) > 0 || 'Confira o valor. Ex.: 900 ou 1.250,00.'],
  conds: [obrigatorio('Escolha pelo menos uma condição.')],
  prazo: [obrigatorio('Diga pra quando você precisa.')],
  ...REGRAS_EMPRESA,
  ...REGRAS_ACEITE,
}
const ORDEM = ['marcas', 'marcaOutra', 'qtd', 'precoMax', 'conds', 'prazo', ...ORDEM_EMPRESA, ...ORDEM_ACEITE]
const ROTULOS = { marcas: 'Marcas de interesse', marcaOutra: 'Qual marca', qtd: 'Quantidade', precoMax: 'Até quanto por unidade', conds: 'Condição', prazo: 'Pra quando', cnpj: 'CNPJ da empresa', aceite: 'Aceite dos Termos de uso' }
const idDe = (k) => (k === 'marcaOutra' ? 'fc-marca-outra' : `fc-${k}`)
const precoMaxTexto = () => (String(v.precoMax ?? '').trim() ? formatarPreco(lerPreco(v.precoMax)) : '')

const { estado, url, enviar, reiniciar, whatsappPendente, erro, tocar, descricao, anuncio } = useEnvioWhatsapp({
  tipo: 'COMPRAR',
  ordem: ORDEM,
  regras,
  rotulos: ROTULOS,
  valores: v,
  idDe,
  inicial: reiniciarValores,
  resumo: () => [`${v.prazo}: ${Number(v.qtd)} un.`, marcasTexto(), v.conds.join(', ')].join(' · '),
  campos: () => [
    ['Loja', v.empresa],
    ['CNPJ', v.cnpj],
    ['Marcas de interesse', marcasTexto()],
    ['Modelos', v.modelos],
    ['Quantidade', `${Number(v.qtd)} un.`],
    ['Condição que aceita', v.conds.join(', ')],
    ['Até quanto por unidade', precoMaxTexto()],
    ['Pra quando', v.prazo],
    ['Categoria do catálogo', props.categoria?.titulo || ''],
    ['Observações', v.obs],
  ],
})

const obsAberta = ref(false)
async function abrirObs() {
  obsAberta.value = true
  await nextTick()
  document.getElementById('fc-obs')?.focus()
}
async function aoReiniciar() {
  obsAberta.value = false
  await reiniciar()
}

// prévia do pedido (≥ 1024, sem ?categoria): o que vai pro WhatsApp, na ordem do formulário
const pedido = computed(() => [
  ['Marcas', marcasTexto()],
  ['Modelos', v.modelos.trim()],
  ['Quantidade', inteiroMin1('')(v.qtd) === true ? `${Number(v.qtd)} un.` : ''],
  ['Condição', v.conds.join(', ')],
  ['Até quanto', precoMaxTexto() && `${precoMaxTexto()} /un.`], // por unidade, não orçamento
  ['Pra quando', v.prazo || ''],
])

// o card de referência só existe ≥ 1024 (fora do DOM no celular: a foto dele nem é pedida)
const { mdAndUp } = useDisplay()
// o selo do card de referência carimba quando o card aparece (sob reduzir movimento, fica no poster)
const card = ref(null)
const carimbar = () => card.value?.tocarSelo()
onMounted(carimbar)
watch(() => props.categoria?.id, carimbar, { flush: 'post' })
watch(mdAndUp, carimbar, { flush: 'post' }) // a janela alargou: o card nasce agora e carimba
</script>

<template>
  <div class="fc" :class="{ 'fc--ref': categoria }">
    <form class="form-lote fc-form" novalidate @submit.prevent="enviar">
      <!-- < 1024: a categoria escolhida antes do 1º campo (o card fica ao lado, só ≥ 1024) -->
      <div v-if="categoria" class="form-faixa fc-faixa sobre-gelo">
        <p class="form-faixa__txt">
          <span class="rotulo form-faixa__rot">Categoria do catálogo</span>
          <strong>{{ categoria.titulo }}</strong> · {{ categoria.conds.join(', ') }}. Quantidade e preço de cada lote vêm pela equipe, no WhatsApp.
        </p>
        <LinkSeta to="/loja">Ver a loja</LinkSeta>
      </div>

      <fieldset class="form-lote__grupo">
        <legend class="rotulo">O que você precisa</legend>
        <EscolhaChips id="fc-marcas" v-model="v.marcas" rotulo="Marcas de interesse" :opcoes="MARCAS" multiplo obrigatorio dica="Pode escolher mais de uma." :erro="erro('marcas')" @update:model-value="mexeu('marcas')" />
        <CampoForm v-if="v.marcas.includes('Outra')" id="fc-marca-outra" rotulo="Qual marca?" obrigatorio :erro="erro('marcaOutra')">
          <VTextField
            id="fc-marca-outra"
            v-model="v.marcaOutra"
            autocomplete="off"
            :maxlength="MAX.marca"
            hide-details
            :error="!!erro('marcaOutra')"
            :aria-invalid="erro('marcaOutra') ? 'true' : undefined"
            :aria-describedby="descricao('marcaOutra', 'fc-marca-outra')"
            @blur="tocar('marcaOutra')"
          />
        </CampoForm>
        <CampoForm id="fc-modelos" rotulo="Modelos">
          <VTextField id="fc-modelos" v-model="v.modelos" autocomplete="off" placeholder="Ex.: iPhone 13 128 GB, Redmi Note 14…" :maxlength="MAX.modelo" hide-details @update:model-value="mexeu('modelos')" />
        </CampoForm>
        <div class="form-lote__par">
          <CampoForm id="fc-qtd" rotulo="Quantidade que você precisa" obrigatorio :erro="erro('qtd')">
            <VTextField
              id="fc-qtd"
              v-model="v.qtd"
              inputmode="numeric"
              pattern="[0-9]*"
              suffix="un."
              autocomplete="off"
              maxlength="6"
              hide-details
              :error="!!erro('qtd')"
              :aria-invalid="erro('qtd') ? 'true' : undefined"
              :aria-describedby="descricao('qtd', 'fc-qtd')"
              @blur="tocar('qtd')"
            />
          </CampoForm>
          <CampoForm id="fc-precoMax" rotulo="Até quanto por unidade" :erro="erro('precoMax')">
            <VTextField
              id="fc-precoMax"
              v-model="v.precoMax"
              prefix="R$"
              persistent-placeholder
              inputmode="decimal"
              autocomplete="off"
              placeholder="Ex.: 900,00"
              maxlength="14"
              hide-details
              :error="!!erro('precoMax')"
              :aria-invalid="erro('precoMax') ? 'true' : undefined"
              :aria-describedby="descricao('precoMax', 'fc-precoMax')"
              @blur="tocar('precoMax')"
            />
          </CampoForm>
        </div>
        <EscolhaChips id="fc-conds" v-model="v.conds" rotulo="Condição que você aceita" :opcoes="CONDICOES" multiplo obrigatorio dica="Pode escolher mais de uma." :erro="erro('conds')" @update:model-value="mexeu('conds')" />
        <EscolhaChips id="fc-prazo" v-model="v.prazo" rotulo="Pra quando?" :opcoes="PRAZOS" obrigatorio :erro="erro('prazo')" @update:model-value="mexeu('prazo')" />
      </fieldset>

      <fieldset class="form-lote__grupo">
        <legend class="rotulo">Sua empresa</legend>
        <div class="form-lote__par">
          <CampoForm id="fc-cnpj" rotulo="CNPJ da empresa" obrigatorio dica="Vale também o CNPJ novo, com letras." :erro="erro('cnpj')">
            <VTextField
              id="fc-cnpj"
              :model-value="v.cnpj"
              inputmode="text"
              autocapitalize="characters"
              autocorrect="off"
              spellcheck="false"
              autocomplete="off"
              placeholder="00.000.000/0000-00"
              hide-details
              :error="!!erro('cnpj')"
              :aria-invalid="erro('cnpj') ? 'true' : undefined"
              :aria-describedby="descricao('cnpj', 'fc-cnpj', true)"
              @update:model-value="mascararCampoCnpj('fc-cnpj', $event, (x) => (v.cnpj = x))"
              @blur="tocar('cnpj')"
            />
          </CampoForm>
          <CampoForm id="fc-empresa" rotulo="Nome da loja">
            <VTextField id="fc-empresa" v-model="v.empresa" autocomplete="organization" :maxlength="MAX.curto" hide-details />
          </CampoForm>
        </div>
        <button v-if="!obsAberta" type="button" class="form-lote__mais" aria-controls="fc-obs" aria-expanded="false" @click="abrirObs">
          <span aria-hidden="true">+</span> Adicionar observação
        </button>
        <CampoForm v-else id="fc-obs" rotulo="Observações">
          <!-- contador sempre à vista: só com o foco, ele sumia no blur e tudo abaixo subia 22 px no meio do clique -->
          <VTextarea id="fc-obs" v-model="v.obs" autocomplete="off" :maxlength="MAX.obs" hide-details="auto" persistent-counter placeholder="Ex.: só com caixa original, entrega em Santos" />
        </CampoForm>
      </fieldset>

      <AceiteTermos id="fc-aceite" v-model="v.aceite" :erro="erro('aceite')" />
      <EnvioForm :estado="estado" :url="url" :pendente="whatsappPendente" :anuncio="anuncio" outro-texto="Fazer outro pedido" @outro="aoReiniciar" />
    </form>

    <aside v-if="categoria && mdAndUp" class="fc-lado fc-ref" aria-label="Categoria do pedido">
      <CardCategoria ref="card" :categoria="categoria" referencia selo-animado eager sizes="340px" />
      <p class="legenda fc-ref__leg">Categoria do catálogo, usada como referência do pedido. Quantidade, condição e preço de cada lote real vêm pela equipe, no WhatsApp.</p>
      <LinkSeta to="/loja">Ver a loja</LinkSeta>
    </aside>
    <aside v-else-if="!categoria" class="fc-lado fc-pedido" aria-label="Prévia do pedido">
      <PreviaPedido :linhas="pedido" />
    </aside>
  </div>
</template>

<style>
.fc { display: grid; grid-template-columns: minmax(0, 1fr); gap: 48px; margin-top: 40px; }
.fc-lado { display: none; }
.fc-ref__leg { margin: 0; max-width: 40ch; }
.fc-ref .cat { width: min(100%, 340px); }
@media (min-width: 1024px) {
  .fc { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 64px; align-items: start; }
  .fc-lado { display: grid; justify-items: start; gap: 12px; position: sticky; top: 24px; }
  .fc-faixa { display: none; }
}
</style>
