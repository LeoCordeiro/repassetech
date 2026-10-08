<script setup>
// Bancada de componentes + style-guide (rota oculta /#/_componentes). Cada peça em todos os estados, nos dois tons.
// O formulário daqui é o do site (EscolhaChips, CampoForm com erro, AceiteTermos, EnvioForm): quem copia da bancada copia o
// certo (sem VSelect, VRadio, erro por :rules nem quantidade type=number, como nos formulários). Só existe no dev.
import { computed, ref } from 'vue'
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import EspinhaPassos from '@/components/blocos/EspinhaPassos.vue'
import RegrasVozAlta from '@/components/blocos/RegrasVozAlta.vue'
import ComparativoWhatsapp from '@/components/blocos/ComparativoWhatsapp.vue'
import FechoDuplo from '@/components/blocos/FechoDuplo.vue'
import BrandLottie from '@/components/marca/BrandLottie.vue'
import LogoMarca from '@/components/marca/LogoMarca.vue'
import BtnSeta from '@/components/marca/BtnSeta.vue'
import BtnContorno from '@/components/marca/BtnContorno.vue'
import LinkSeta from '@/components/marca/LinkSeta.vue'
import SetaMini from '@/components/marca/SetaMini.vue'
import SetaMarca from '@/components/marca/SetaMarca.vue'
import SeloVerificado from '@/components/marca/SeloVerificado.vue'
import CardCategoria from '@/components/lote/CardCategoria.vue'
import GradeCatalogo from '@/components/lote/GradeCatalogo.vue'
import FiltroLotes from '@/components/lote/FiltroLotes.vue'
import EtiquetaLote from '@/components/lote/EtiquetaLote.vue'
import EstadoVazio from '@/components/lote/EstadoVazio.vue'
import CampoForm from '@/components/form/CampoForm.vue'
import EscolhaChips from '@/components/form/EscolhaChips.vue'
import PreviaPedido from '@/components/lote/PreviaPedido.vue'
import EstadoEnvio from '@/components/form/EstadoEnvio.vue'
import AceiteTermos from '@/components/form/AceiteTermos.vue'
import EnvioForm from '@/components/form/EnvioForm.vue'
import { PALETA } from '@/styles/paleta'
import { manifest } from '@/lib/lottie'
import { PASSOS_HOME } from '@/data/passos'
import { CATEGORIAS, categoriaPorId } from '@/data/catalogo'
import { CONDICOES_LOTE } from '@/data/opcoes'
import { IMEI } from '@/data/conferencia-imei'
import { cnpjValido, mascararCnpj, montarMensagem } from '@/lib/whatsapp'

const TONS = ['petroleo', 'claro']
const ROTULO_TOM = { petroleo: 'O lote entra', claro: 'Na loja' } // costura = estado do lote (data/costuras.js)
const chaves = Object.keys(manifest)
const tipo = ref(null)
const marcas = ref(['Samsung'])
const filtros = ref({ categoria: null, condicao: null })
const manual = ref(null)

// formulário de bancada: as peças dos formulários do site, com o erro desenhado pelo CampoForm
const cnpj = ref('')
const modelo = ref('')
const qtd = ref('')
const cond = ref(null)
const nf = ref(null)
const obs = ref('')
const aceite = ref(false)
const erroCnpj = computed(() => (cnpj.value && !cnpjValido(cnpj.value) ? 'Confira o CNPJ: algum número ou letra não confere.' : ''))
const erroQtd = computed(() => (qtd.value && !/^\d+$/.test(qtd.value) ? 'Informe a quantidade: 1 ou mais, sem vírgula.' : ''))
const checks = computed(() => [
  { texto: 'CNPJ informado', estado: cnpjValido(cnpj.value) ? 'ok' : 'pendente' },
  { texto: 'Nota fiscal', estado: nf.value === 'Sim' ? 'ok' : 'pendente' },
  { texto: 'IMEI de cada aparelho', estado: 'pendente' },
])
const mensagem = montarMensagem(
  'VENDER',
  [
    ['Empresa', 'Loja Teste · CNPJ 00.000.000/0000-00'],
    ['Responsável', 'Fulano'],
    ['Lote', 'Samsung Galaxy A16 128 GB'],
    ['Quantidade', '40 un.'],
    ['Observações', ''],
  ],
  { numero: '5500000000000' },
)
</script>

<template>
  <div class="pagina bancada">
    <SecaoBloco tom="claro" sai>
      <TituloSecao :nivel="1" rotulo="Bancada" titulo="Componentes da Repasse Tech" lead="Cada peça em todos os estados, no bloco claro e no petróleo. Rota oculta: não entra na navegação." />
    </SecaoBloco>

    <SecaoBloco v-for="tom in TONS" :key="tom" :tom="tom" :costura="ROTULO_TOM[tom]" sai>
      <TituloSecao :rotulo="tom === 'petroleo' ? 'Tom petróleo' : 'Tom claro'" titulo="Paleta, tipografia, botões e marca" />

      <p class="rotulo bc-sub">Paleta (src/styles/paleta.js)</p>
      <div class="bc-sw">
        <div v-for="(hex, nome) in PALETA" :key="nome" class="bc-sw__i">
          <span :style="{ background: `rgb(var(--v-theme-${nome}))` }" /><b>{{ nome }}</b><i>{{ hex }}</i>
        </div>
      </div>

      <p class="rotulo bc-sub">Tipografia</p>
      <div class="bc-tipo">
        <span class="t-display">Aa</span>
        <span class="h2" style="margin: 0">Lotes na loja</span>
        <span class="h3">Feche o repasse.</span>
        <span class="rotulo">Conferido, vai pra loja</span>
        <span class="lead">{{ IMEI.passoHome }}</span>
        <span class="t-preco">R$ 1.900 – 2.100</span>
        <span class="t-dado cod">12 un. · Lote RT-0427</span>
        <span class="legenda">Legenda 13/1.45</span>
      </div>

      <p class="rotulo bc-sub">Botões</p>
      <div class="bc-linha">
        <BtnSeta>Quero vender</BtnSeta>
        <BtnSeta disabled>Quero vender</BtnSeta>
        <BtnSeta to="/quero-vender">Como link</BtnSeta>
      </div>
      <div class="bc-linha">
        <BtnContorno>Quero comprar</BtnContorno>
        <BtnContorno disabled>Quero comprar</BtnContorno>
        <VBtn>BtnM (VBtn padrão)</VBtn>
        <VBtn disabled>BtnM disabled</VBtn>
      </div>
      <div class="bc-linha">
        <LinkSeta to="/como-funciona">Ver como funciona</LinkSeta>
        <SetaMini /><SetaMini size="m" /><SetaMini limite />
        <SetaMarca :largura="44" :altura="12" /><SetaMarca :largura="90" :altura="27" /><SetaMarca :largura="200" :altura="60" />
      </div>

      <p class="rotulo bc-sub">Logo oficial (brand/; arquivo ausente = slot rotulado). size = altura</p>
      <div class="bc-linha">
        <LogoMarca :size="64" />
        <LogoMarca tipo="icone" :size="56" />
        <LogoMarca tipo="icone-sem-seta" :size="56" alt="Repasse Tech, ícone sem a seta (só para o hero)" />
        <span class="bc-logo-escuro"><LogoMarca variant="invertida" :size="48" /></span>
      </div>

      <p class="rotulo bc-sub">Selo verificado</p>
      <div class="bc-linha">
        <SeloVerificado formato="chip" />
        <SeloVerificado formato="chip" animado trigger="viewport" />
        <SeloVerificado formato="linha" />
        <span class="bc-queixo"><SeloVerificado formato="queixo" /></span>
        <span class="bc-queixo"><SeloVerificado formato="queixo" animado trigger="viewport" variant="invertida" /></span>
      </div>

      <p class="rotulo bc-sub">Comparativo</p>
      <ComparativoWhatsapp />

      <p class="rotulo bc-sub">Lottie — catálogo (variante auto pelo bloco)</p>
      <div class="bc-lottie">
        <figure v-for="k in chaves" :key="k">
          <BrandLottie :name="k" :size="manifest[k].largura > manifest[k].altura ? 160 : 72" :aria-label="`${k} (${tom})`" sem-fila />
          <figcaption class="legenda">{{ k }} · poster {{ manifest[k].posterFrame }}</figcaption>
        </figure>
      </div>
    </SecaoBloco>


    <SecaoBloco tom="petroleo" costura="Conferindo" sai>
      <TituloSecao rotulo="CardCategoria" titulo="O card do catálogo (no petróleo)" />
      <div class="bc-cards">
        <div class="bc-com-imei"><p class="rotulo">com IMEI</p><CardCategoria :categoria="categoriaPorId('iphone-seminovo')" /></div>
        <div class="bc-tablet"><p class="rotulo">IMEI só com chip</p><CardCategoria :categoria="categoriaPorId('tablets')" /></div>
        <div class="bc-sem-imei"><p class="rotulo">sem IMEI</p><CardCategoria :categoria="categoriaPorId('acessorios')" /></div>
        <div class="bc-ref"><p class="rotulo">referência do pedido</p><CardCategoria :categoria="categoriaPorId('samsung-galaxy')" referencia /></div>
      </div>
    </SecaoBloco>

    <SecaoBloco tom="claro" costura="Na loja" sai>
      <TituloSecao rotulo="GradeCatalogo · FiltroLotes · EstadoVazio" titulo="Filtro com FLIP (Acessórios + Seminovo revisado = vazio)" />
      <FiltroLotes v-model="filtros" />
      <GradeCatalogo :categorias="CATEGORIAS" :filtros="filtros" aguardar-costura>
        <template #vazio><EstadoVazio @limpar="filtros = { categoria: null, condicao: null }" /></template>
      </GradeCatalogo>
    </SecaoBloco>

    <SecaoBloco tom="petroleo" costura="Conferido" sai>
      <TituloSecao rotulo="EspinhaPassos · RegrasVozAlta" titulo="Passos na espinha" />
      <EspinhaPassos class="bc-espinha" :passos="PASSOS_HOME" entrada saida />
      <RegrasVozAlta compacto />
    </SecaoBloco>

    <SecaoBloco tom="claro" costura="Conferido" sai>
      <EspinhaPassos :passos="PASSOS_HOME" />
      <RegrasVozAlta />
    </SecaoBloco>

    <SecaoBloco tom="petroleo" costura="Negociando" sai>
      <TituloSecao rotulo="BrandLottie" titulo="Gatilhos: hover, click e manual" />
      <div class="bc-linha">
        <button type="button" class="bc-alvo">Passe o mouse <BrandLottie name="selo-verificado" trigger="hover" variant="normal" :size="32" /></button>
        <button type="button" class="bc-alvo">Clique <BrandLottie name="lote-vazio" trigger="click" variant="normal" :size="32" /></button>
        <BrandLottie ref="manual" name="enviado-sucesso" trigger="manual" :size="48" poster-inicial />
        <VBtn @click="manual?.play()">play()</VBtn>
        <VBtn @click="manual?.poster()">poster()</VBtn>
      </div>
    </SecaoBloco>

    <SecaoBloco tom="claro" costura="Repassado">
      <TituloSecao rotulo="CampoForm · EtiquetaLote · EstadoEnvio" titulo="Campos, etiqueta em prévia e estado do envio" />
      <div class="bc-form">
        <form class="bc-campos" novalidate @submit.prevent>
          <CampoForm id="bc-cnpj" rotulo="CNPJ da empresa" obrigatorio dica="Vale também o CNPJ novo, com letras." :erro="erroCnpj">
            <VTextField id="bc-cnpj" :model-value="cnpj" inputmode="text" autocapitalize="characters" autocomplete="off" placeholder="00.000.000/0000-00" maxlength="18" hide-details :error="!!erroCnpj" :aria-invalid="erroCnpj ? 'true' : undefined" @update:model-value="cnpj = mascararCnpj($event)" />
          </CampoForm>
          <CampoForm id="bc-modelo" rotulo="Modelo" obrigatorio dica="Como aparece na nota.">
            <VTextField id="bc-modelo" v-model="modelo" autocomplete="off" placeholder="Galaxy A16 128 GB" hide-details />
          </CampoForm>
          <CampoForm id="bc-qtd" rotulo="Quantidade" obrigatorio :erro="erroQtd">
            <VTextField id="bc-qtd" v-model="qtd" inputmode="numeric" pattern="[0-9]*" suffix="un." autocomplete="off" maxlength="6" hide-details :error="!!erroQtd" :aria-invalid="erroQtd ? 'true' : undefined" />
          </CampoForm>
          <EscolhaChips id="bc-cond" v-model="cond" rotulo="Condição" :opcoes="CONDICOES_LOTE" obrigatorio />
          <EscolhaChips id="bc-nf" v-model="nf" rotulo="O lote tem nota fiscal?" :opcoes="['Sim', 'Não']" obrigatorio />
          <CampoForm id="bc-obs" rotulo="Observações">
            <VTextarea id="bc-obs" v-model="obs" autocomplete="off" placeholder="Ex.: bateria acima de 85%, caixa original" hide-details="auto" />
          </CampoForm>
          <EscolhaChips id="bc-tipo" v-model="tipo" rotulo="Tipo de mercadoria (EscolhaChips)" :opcoes="['Celulares', 'Tablets com chip', 'Tablets só Wi-Fi', 'Acessórios']" obrigatorio :erro="tipo ? '' : 'Escolha o tipo de mercadoria.'" />
          <EscolhaChips id="bc-marcas" v-model="marcas" rotulo="Marcas (múltipla)" :opcoes="['Samsung', 'Apple', 'Motorola']" multiplo dica="Pode escolher mais de uma." />
          <AceiteTermos id="bc-aceite" v-model="aceite" :erro="aceite ? '' : 'Marque que você leu e aceita os Termos de uso.'" />
          <EnvioForm estado="ocioso" />
        </form>
        <div class="bc-etq">
          <EtiquetaLote :lote="{ modelo, qtd, cond }" :checks="checks" />
          <PreviaPedido :linhas="[['Marcas', marcas.join(', ')], ['Modelos', ''], ['Quantidade', '15 un.'], ['Condição', 'Open box'], ['Até quanto', ''], ['Pra quando', 'Agora']]" />
        </div>
      </div>
      <EstadoEnvio estado="montando" />
      <EstadoEnvio estado="pronto" :url="mensagem.url" />
      <EstadoEnvio estado="bloqueado" :url="mensagem.url" />
      <p class="rotulo bc-sub">lib/whatsapp — mensagem montada (número de teste)</p>
      <pre class="bc-msg">{{ mensagem.texto }}</pre>
      <hr class="fio-interno bc-fio" />
      <FechoDuplo />
    </SecaoBloco>

  </div>
</template>

<style>
.bancada .titulo-secao { margin-bottom: 32px; }
.bc-logo-escuro { display: inline-block; padding: 12px 16px; background: var(--c-petroleo); }
.bc-espinha { margin-top: 56px; }
.bc-sub { margin: 36px 0 14px; padding-top: 14px; border-top: 1px solid var(--border); }
.bc-sw { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 148px), 1fr)); gap: 10px; }
.bc-sw__i { display: grid; border: 1px solid var(--border); font: 400 13px/1.4 var(--ff-c); }
.bc-sw__i span { height: 44px; border-bottom: 1px solid var(--border); }
.bc-sw__i b, .bc-sw__i i { padding: 0 10px; font-style: normal; overflow-wrap: anywhere; }
.bc-sw__i b { padding-top: 6px; font-weight: 600; }
.bc-sw__i i { padding-bottom: 8px; color: var(--text-2); }
.bc-tipo { display: grid; gap: 12px; }
.bc-linha { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 16px; }
.bc-queixo { display: inline-flex; padding: 10px 14px; background: var(--c-petroleo-profundo); }
.bc-lottie { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr)); gap: 16px; }
.bc-lottie figure { display: grid; justify-items: center; gap: 8px; margin: 0; padding: 16px 8px; border: 1px solid var(--border); }
.bc-alvo { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 12px; border: 2px solid var(--c-petroleo); background: var(--c-branco); color: var(--c-petroleo); font: 600 15px/1 var(--ff-t); cursor: pointer; }
.bc-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 236px), 1fr)); gap: 28px 22px; padding-right: 16px; }
.bc-cards .rotulo { margin-bottom: 8px; }
.bc-form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px; }
.bc-campos { display: grid; gap: 20px; }
.bc-etq { display: grid; gap: 24px; align-content: start; }
.bc-fio { margin: 48px 0; }
.bc-msg { margin: 0; padding: 14px; background: var(--c-gelo); color: var(--c-petroleo); font: 400 14px/1.5 var(--ff-c); white-space: pre-wrap; overflow-wrap: anywhere; }
@media (min-width: 1024px) { .bc-form { grid-template-columns: 7fr 5fr; } }
</style>
