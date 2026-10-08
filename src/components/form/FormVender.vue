<script setup>
/**
 * Formulário do vendedor. Fecha no WhatsApp com [VENDER]; nada vai
 * para servidor. Ordem: Tipo → Nota fiscal → IMEI → lote → CNPJ. A pergunta que reprova o lote vem antes do investimento.
 * IMEI só em aparelho com chip (celular e tablet 4G/5G). Tablet só Wi-Fi, acessório, áudio e vídeo e "Outros": só a nota,
 * a pergunta some e a mensagem diz "IMEI: não se aplica".
 * Sem nota (ou sem o IMEI de todos, quando o tipo tem IMEI) o lote não é aceito: o botão continua ativo, mas a ponta
 * some e o toque leva o foco ao aviso, que oferece tirar a dúvida no WhatsApp com os dados já digitados (link [CONTATO]
 * em outra aba: a pessoa não sai da página nem perde nada).
 * Ao lado (≥ 1024), a EtiquetaLote em prévia. Abaixo de 1024, uma linha de prévia acima do botão.
 * Último campo: o aceite dos Termos de uso (AceiteTermos); a mensagem leva a linha do aceite com a versão.
 * Aviso de NF/IMEI: o marcador de limite da marca (SetaMini limite) no lugar da borda de "alert"; o título diz só o que
 * falta (a nota, o IMEI ou os dois).
 * `categoria` (?tipo= do catálogo, "Tenho um lote assim"): tipo, marca e condição da categoria já escolhidos — o que a URL
 * pôs sai quando a URL tira; o que a pessoa escolheu fica. A faixa antes do 1º campo diz a categoria e o que ela exige.
 */
import { computed, nextTick, reactive, ref, watch } from 'vue'
import CampoForm from './CampoForm.vue'
import EscolhaChips from './EscolhaChips.vue'
import EnvioForm from './EnvioForm.vue'
import AceiteTermos from './AceiteTermos.vue'
import SetaMini from '../marca/SetaMini.vue'
import LinkSeta from '../marca/LinkSeta.vue'
import EtiquetaLote from '../lote/EtiquetaLote.vue'
import { cnpjValido } from '@/lib/cnpj'
import { montarMensagem } from '@/lib/whatsapp'
import { documentoDe } from '@/data/catalogo'
import { reduzirAgora } from '@/composables/useReduzirMovimento'
import {
  CONDICOES, MARCAS, MAX, ORDEM_ACEITE, ORDEM_EMPRESA, REGRAS_ACEITE, REGRAS_EMPRESA, formatarPreco, inteiroMin1, lerPreco, mascararCampoCnpj,
  obrigatorio, precoValido, useEnvioWhatsapp,
} from '@/composables/useEnvioWhatsapp'
import './form-lote.css'

const props = defineProps({
  categoria: { type: Object, default: null }, // item de data/catalogo.js (?tipo=)
})

const TIPOS = ['Celulares', 'Tablets com chip', 'Tablets só Wi-Fi', 'Acessórios', 'Áudio e vídeo', 'Outros'] // plural, como os outros chips
const COM_IMEI = ['Celulares', 'Tablets com chip'] // aparelho com chip (4G/5G) tem IMEI; o resto vai só com a nota
const IMEI_TODOS = 'Sim, de todos'
const IMEI_OPCOES = [IMEI_TODOS, 'Só de alguns', 'Não']

// os campos que a categoria da URL preenche, e se o valor de agora veio dela e ninguém mexeu (a escolha da pessoa vira "dela")
const DA_URL = ['tipo', 'marca', 'cond']
const daUrl = { tipo: false, marca: false, cond: false }
const pelaUrl = () => ({
  tipo: TIPOS.includes(props.categoria?.tipo) ? props.categoria.tipo : null,
  marca: MARCAS.includes(props.categoria?.marca) ? props.categoria.marca : null,
  cond: props.categoria?.conds.length === 1 ? props.categoria.conds[0] : null,
})
const marcarOrigemDaUrl = (u) => DA_URL.forEach((k) => (daUrl[k] = u[k] !== null))
/** Os valores do começo (os da URL entram e ficam marcados como "da URL"): o formulário novo e o "Mandar outro lote". */
const reiniciarValores = () => {
  const u = pelaUrl()
  marcarOrigemDaUrl(u)
  return { ...u, nf: null, imei: null, marcaOutra: '', modelo: '', qtd: '', preco: '', cnpj: '', empresa: '', obs: '', aceite: false }
}
const v = reactive(reiniciarValores())
const mexeu = (k) => (daUrl[k] = false)
// a mesma página pode trocar de ?tipo sem remontar: acompanha só o campo que a URL pôs (ou vazio)
watch(
  () => props.categoria?.id,
  () => {
    const u = pelaUrl()
    for (const k of DA_URL) {
      if (!daUrl[k] && v[k] !== null) continue // escolha da pessoa: fica
      v[k] = u[k]
      daUrl[k] = u[k] !== null
    }
  },
)

const temImei = computed(() => COM_IMEI.includes(v.tipo))
const regras = {
  tipo: [obrigatorio('Escolha o tipo de mercadoria.')],
  nf: [obrigatorio('Responda se o lote tem nota fiscal.')],
  imei: [(x) => !temImei.value || obrigatorio('Responda se você tem o IMEI de cada aparelho.')(x)],
  marca: [obrigatorio('Escolha a marca.')],
  marcaOutra: [(x) => v.marca !== 'Outra' || !!String(x).trim() || 'Escreva qual é a marca.'],
  modelo: [obrigatorio('Informe o modelo.')],
  qtd: [inteiroMin1('Informe a quantidade: 1 ou mais, sem vírgula.')],
  preco: [precoValido('Informe o preço por unidade. Ex.: 850 ou 1.250,00.')],
  cond: [obrigatorio('Escolha a condição do lote.')],
  ...REGRAS_EMPRESA,
  ...REGRAS_ACEITE,
}
const ORDEM = ['tipo', 'nf', 'imei', 'marca', 'marcaOutra', 'modelo', 'qtd', 'preco', 'cond', ...ORDEM_EMPRESA, ...ORDEM_ACEITE]
const ROTULOS = {
  tipo: 'Tipo de mercadoria', nf: 'Nota fiscal', imei: 'IMEI', marca: 'Marca', marcaOutra: 'Qual marca', modelo: 'Modelo',
  qtd: 'Quantidade', preco: 'Preço por unidade', cond: 'Condição', cnpj: 'CNPJ da empresa', aceite: 'Aceite dos Termos de uso',
}
const ID = { marcaOutra: 'fv-marca-outra' }
const idDe = (k) => ID[k] || `fv-${k}`

const marcaFinal = computed(() => (v.marca === 'Outra' ? v.marcaOutra.trim() : v.marca) || '')
const qtdOk = computed(() => inteiroMin1('')(v.qtd) === true)
const preco = computed(() => lerPreco(v.preco))
const faltaNf = computed(() => v.nf === 'Não')
const faltaImei = computed(() => temImei.value && v.imei !== null && v.imei !== IMEI_TODOS)
const semDocs = computed(() => faltaNf.value || faltaImei.value)
const loteTexto = computed(() => [marcaFinal.value, v.modelo.trim()].filter(Boolean).join(' '))

const { estado, url, enviar, reiniciar, whatsappPendente, erro, tocar, descricao, anuncio } = useEnvioWhatsapp({
  tipo: 'VENDER',
  ordem: ORDEM,
  regras,
  rotulos: ROTULOS,
  valores: v,
  idDe,
  inicial: reiniciarValores,
  resumo: () => [`${Number(v.qtd)} un.`, loteTexto.value, v.cond].join(' · '),
  campos: () => [
    ['Loja', v.empresa],
    ['CNPJ', v.cnpj],
    ['Tipo de mercadoria', v.tipo],
    ['Marca', marcaFinal.value],
    ['Modelo', v.modelo],
    ['Quantidade', `${Number(v.qtd)} un.`],
    ['Condição', v.cond],
    ['Preço pretendido por unidade', formatarPreco(preco.value)],
    ['Nota fiscal', v.nf],
    temImei.value ? ['IMEI de cada aparelho', v.imei] : ['IMEI', 'não se aplica'],
    ['Categoria do catálogo', props.categoria?.titulo || ''],
    ['Observações', v.obs],
  ],
})
/** O título do aviso diz só o que falta (a nota, o IMEI ou os dois), e o texto diz o que destrava. */
const avisoDocs = computed(() => {
  if (faltaNf.value && faltaImei.value)
    return { titulo: 'Sem nota fiscal e sem o IMEI de cada aparelho, o lote não entra.', texto: 'A mensagem só sai quando os dois estiverem em ordem. Ficou com dúvida sobre a documentação?' }
  if (faltaImei.value) return { titulo: 'Sem o IMEI de cada aparelho, o lote não entra.', texto: 'A mensagem só sai quando o IMEI de cada aparelho estiver em ordem. Ficou com dúvida sobre a documentação?' }
  return { titulo: 'Sem nota fiscal, o lote não entra.', texto: 'A mensagem só sai quando a nota estiver em ordem. Ficou com dúvida sobre a documentação?' }
})

/** Sem documentação o envio não sai: o toque leva ao aviso (que já diz o motivo e a saída). */
function aoEnviar() {
  if (!semDocs.value) return enviar()
  const aviso = document.getElementById('fv-aviso-docs')
  aviso?.focus({ preventScroll: true })
  aviso?.scrollIntoView({ block: 'center', behavior: reduzirAgora() ? 'instant' : 'smooth' })
}
/** Dúvida sobre a documentação: [CONTATO] com o que já foi digitado. */
const urlDuvida = computed(() =>
  whatsappPendente
    ? undefined
    : montarMensagem(
        'CONTATO',
        [
          ['Tipo de mercadoria', v.tipo],
          ['Lote', loteTexto.value],
          ['Quantidade', qtdOk.value ? `${Number(v.qtd)} un.` : ''],
          ['Nota fiscal', v.nf],
          ...(temImei.value ? [['IMEI de cada aparelho', v.imei]] : []),
        ],
        { titulo: 'Tenho uma dúvida sobre a documentação de um lote.', rodape: '(preenchido no formulário Quero vender do site)' },
      ).url,
)

// observações recolhidas: "+ Adicionar observação" abre o campo (e foca)
const obsAberta = ref(false)
async function abrirObs() {
  obsAberta.value = true
  await nextTick()
  document.getElementById('fv-obs')?.focus()
}
async function aoReiniciar() {
  obsAberta.value = false
  await reiniciar()
}

const lote = computed(() => ({ modelo: loteTexto.value, qtd: qtdOk.value ? Number(v.qtd) : '', cond: v.cond || '' }))
const checks = computed(() => [
  { texto: 'CNPJ informado', estado: cnpjValido(v.cnpj) ? 'ok' : 'pendente' },
  { texto: 'Nota fiscal', estado: v.nf === 'Sim' ? 'ok' : 'pendente' },
  ...(temImei.value ? [{ texto: 'IMEI de cada aparelho', estado: v.imei === IMEI_TODOS ? 'ok' : 'pendente' }] : []),
])
const previaLinha = computed(() => [loteTexto.value || '—', lote.value.qtd ? `${lote.value.qtd} un.` : '—', v.cond || '—'].join(' · '))
</script>

<template>
  <div class="fv">
    <form class="form-lote fv-form" novalidate @submit.prevent="aoEnviar">
      <!-- "Tenho um lote assim" (catálogo): a categoria de onde a pessoa veio e o que ela exige, antes do 1º campo -->
      <div v-if="categoria" class="form-faixa sobre-gelo">
        <p class="form-faixa__txt">
          <span class="rotulo form-faixa__rot">Categoria do catálogo</span>
          <strong>{{ categoria.titulo }}</strong> · {{ documentoDe(categoria) }}
        </p>
        <LinkSeta to="/loja">Ver a loja</LinkSeta>
      </div>
      <fieldset class="form-lote__grupo">
        <legend class="rotulo">O lote</legend>
        <EscolhaChips
          id="fv-tipo"
          v-model="v.tipo"
          rotulo="Tipo de mercadoria"
          :opcoes="TIPOS"
          obrigatorio
          dica="Celular e tablet com chip (4G ou 5G) vão com o IMEI. O resto vai só com a nota."
          :erro="erro('tipo')"
          @update:model-value="mexeu('tipo')"
        />
        <div class="fv-docs">
          <EscolhaChips id="fv-nf" v-model="v.nf" rotulo="O lote tem nota fiscal?" :opcoes="['Sim', 'Não']" obrigatorio :erro="erro('nf')" />
          <EscolhaChips v-if="temImei" id="fv-imei" v-model="v.imei" rotulo="Você tem o IMEI de cada aparelho?" :opcoes="IMEI_OPCOES" obrigatorio :erro="erro('imei')" />
          <!-- região do aviso sempre no DOM (o texto entra nela): região viva criada já com conteúdo costuma não ser lida -->
          <div id="fv-aviso-docs" class="fv-aviso-regiao" tabindex="-1" aria-live="polite">
            <Transition name="rt-aviso">
              <div v-if="semDocs" class="estado-envio fv-aviso" role="group" aria-labelledby="fv-aviso-tit">
                <!-- marcador de limite (a mesma seta para trás de "O que a Repasse Tech não faz"): o lote não passa adiante -->
                <SetaMini class="fv-aviso__limite" limite size="m" />
                <div class="fv-aviso__corpo">
                  <p id="fv-aviso-tit" class="h3">{{ avisoDocs.titulo }}</p>
                  <p class="estado-envio__txt">{{ avisoDocs.texto }}</p>
                  <div class="estado-envio__acoes">
                    <VBtn class="fv-duvida" :href="urlDuvida" target="_blank" rel="noopener" :disabled="whatsappPendente">Tirar a dúvida no WhatsApp<span class="vh"> (abre em outra aba)</span></VBtn>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
        <EscolhaChips id="fv-marca" v-model="v.marca" rotulo="Marca" :opcoes="MARCAS" obrigatorio :erro="erro('marca')" @update:model-value="mexeu('marca')" />
        <CampoForm v-if="v.marca === 'Outra'" id="fv-marca-outra" rotulo="Qual marca?" obrigatorio :erro="erro('marcaOutra')">
          <VTextField
            id="fv-marca-outra"
            v-model="v.marcaOutra"
            autocomplete="off"
            :maxlength="MAX.marca"
            hide-details
            :error="!!erro('marcaOutra')"
            :aria-invalid="erro('marcaOutra') ? 'true' : undefined"
            :aria-describedby="descricao('marcaOutra', 'fv-marca-outra')"
            @blur="tocar('marcaOutra')"
          />
        </CampoForm>
        <CampoForm id="fv-modelo" rotulo="Modelo" obrigatorio dica="Como aparece na nota. Mais de um modelo? Separe por vírgula." :erro="erro('modelo')">
          <VTextField
            id="fv-modelo"
            v-model="v.modelo"
            autocomplete="off"
            placeholder="Ex.: Galaxy A16 128 GB"
            :maxlength="MAX.modelo"
            hide-details
            :error="!!erro('modelo')"
            :aria-invalid="erro('modelo') ? 'true' : undefined"
            :aria-describedby="descricao('modelo', 'fv-modelo', true)"
            @blur="tocar('modelo')"
          />
        </CampoForm>
        <div class="form-lote__par">
          <CampoForm id="fv-qtd" rotulo="Quantidade" obrigatorio :erro="erro('qtd')">
            <VTextField
              id="fv-qtd"
              v-model="v.qtd"
              inputmode="numeric"
              pattern="[0-9]*"
              suffix="un."
              autocomplete="off"
              maxlength="6"
              hide-details
              :error="!!erro('qtd')"
              :aria-invalid="erro('qtd') ? 'true' : undefined"
              :aria-describedby="descricao('qtd', 'fv-qtd')"
              @blur="tocar('qtd')"
            />
          </CampoForm>
          <CampoForm id="fv-preco" rotulo="Preço pretendido por unidade" obrigatorio :erro="erro('preco')">
            <VTextField
              id="fv-preco"
              v-model="v.preco"
              prefix="R$"
              persistent-placeholder
              inputmode="decimal"
              autocomplete="off"
              placeholder="Ex.: 850,00"
              maxlength="14"
              hide-details
              :error="!!erro('preco')"
              :aria-invalid="erro('preco') ? 'true' : undefined"
              :aria-describedby="descricao('preco', 'fv-preco')"
              @blur="tocar('preco')"
            />
          </CampoForm>
        </div>
        <EscolhaChips id="fv-cond" v-model="v.cond" rotulo="Condição" :opcoes="CONDICOES" obrigatorio :erro="erro('cond')" @update:model-value="mexeu('cond')" />
      </fieldset>

      <fieldset class="form-lote__grupo">
        <legend class="rotulo">Sua empresa</legend>
        <div class="form-lote__par">
          <CampoForm id="fv-cnpj" rotulo="CNPJ da empresa" obrigatorio dica="Vale também o CNPJ novo, com letras." :erro="erro('cnpj')">
            <VTextField
              id="fv-cnpj"
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
              :aria-describedby="descricao('cnpj', 'fv-cnpj', true)"
              @update:model-value="mascararCampoCnpj('fv-cnpj', $event, (x) => (v.cnpj = x))"
              @blur="tocar('cnpj')"
            />
          </CampoForm>
          <CampoForm id="fv-empresa" rotulo="Nome da loja">
            <VTextField id="fv-empresa" v-model="v.empresa" autocomplete="organization" :maxlength="MAX.curto" hide-details />
          </CampoForm>
        </div>
        <button v-if="!obsAberta" type="button" class="form-lote__mais" aria-controls="fv-obs" aria-expanded="false" @click="abrirObs">
          <span aria-hidden="true">+</span> Adicionar observação
        </button>
        <CampoForm v-else id="fv-obs" rotulo="Observações">
          <!-- contador sempre à vista: só com o foco, ele sumia no blur e tudo abaixo subia 22 px no meio do clique -->
          <VTextarea id="fv-obs" v-model="v.obs" autocomplete="off" :maxlength="MAX.obs" hide-details="auto" persistent-counter placeholder="Ex.: bateria acima de 85%, caixa original, excesso de estoque" />
        </CampoForm>
      </fieldset>

      <AceiteTermos id="fv-aceite" v-model="v.aceite" :erro="erro('aceite')" />
      <p class="legenda form-lote__previa">Prévia da etiqueta: {{ previaLinha }} · conferência pendente</p>
      <EnvioForm
        :estado="estado"
        :url="url"
        :sem-docs="semDocs"
        :pendente="whatsappPendente"
        :anuncio="anuncio"
        :descrito-por="semDocs ? 'fv-aviso-docs' : undefined"
        outro-texto="Mandar outro lote"
        @outro="aoReiniciar"
      />
    </form>

    <aside class="fv-etq" aria-label="Prévia do lote">
      <EtiquetaLote modo="previa" :lote="lote" :checks="checks" />
      <p class="legenda fv-etq__leg">A etiqueta se preenche com o que você digita. O código e o selo só saem depois da conferência.</p>
    </aside>
  </div>
</template>

<style>
.fv { display: grid; grid-template-columns: minmax(0, 1fr); gap: 48px; margin-top: 40px; }
.fv-etq { display: none; }
@media (min-width: 1024px) {
  .fv { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 64px; align-items: start; }
  .fv-etq { display: block; position: sticky; top: 24px; }
}
/* NF, IMEI e o aviso num bloco só: a região do aviso vazia (só o comentário do v-if) não soma espaço */
.fv-docs { display: grid; grid-template-columns: minmax(0, 1fr); }
/* classe dobrada: o `.escolha { margin: 0 }` do EscolhaChips tem a mesma especificidade e pode vir depois */
.fv-docs.fv-docs > * + * { margin-top: 20px; }
.fv-docs.fv-docs > .fv-aviso-regiao:empty { margin-top: 0; }
.fv-aviso-regiao:focus { outline: none; }
.fv-aviso-regiao:focus-visible .fv-aviso { outline: 3px solid var(--c-petroleo); outline-offset: 3px; }
.fv-aviso { margin-top: 0; display: grid; grid-template-columns: 20px minmax(0, 1fr); column-gap: 14px; align-items: start; }
.fv-aviso .fv-aviso__limite { margin-top: calc(var(--fs-h3) * .38); }
.fv-aviso__corpo { min-width: 0; }
.fv-etq__leg { margin: 12px 0 0; max-width: 420px; }
</style>
