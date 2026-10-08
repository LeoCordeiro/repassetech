<script setup>
/**
 * Botão fixo de WhatsApp (quadrado petróleo, raio 0, não FAB laranja). Some nas rotas meta.semWhatsFixo (formulários e
 * Contato, onde o WhatsApp já está na tela). Link [CONTATO] com a página de onde a pessoa chamou (meta.pagina: a Home vai
 * como "Início").
 * Ícone: o glifo do WhatsApp ($rtWhats, simple-icons, CC0), branco sobre o petróleo, NUNCA anima: o Lottie
 * whatsapp-nudge-invertida é só o pulso, num nó irmão. Máx. 2 por visita (useNudge).
 * Abaixo de 768 é o QUADRADO de 56, só com o glifo (o glifo
 * já diz "WhatsApp"; com o texto, 148 px cobriam o selo do 1º card e o CTA do Como funciona na 1ª tela); a partir de 768,
 * glifo + texto ("WhatsApp"; "Chamar no WhatsApp" a partir de 1024). O nome acessível contém o rótulo visível (WCAG 2.5.3).
 * Regra: o botão NUNCA fica por cima de controle nem de selo. Pode cobrir texto corrido; se fosse cobrir um link,
 * botão, chip, campo ou o selo de um lote, some (fade) até aquilo sair de baixo dele — medido a cada rolagem, mudança de
 * página e de layout (filtro que mostra o vazio, faixa que some). Com o foco nele, não some.
 * Entra --atraso-whats-fixo depois da página; na Home, só depois que os CTAs do hero saem da tela (ui.ctasHero).
 * Na rolagem: some na hora em que um controle chega debaixo dele, mas só VOLTA com a rolagem parada há --fixo-volta e
 * a área livre (no máximo 1 sumiço por gesto: sem isso, na rolagem contínua ele sumia e voltava 5 a 8 vezes); o
 * deslocamento de 16 px é só da 1ª entrada — depois, sumir e voltar é só opacidade (sai em --dur-sai pass, volta em
 * --dur-hover settle). Hover em --dur-hover. O nudge que chegou com ele escondido (fim do
 * conteúdo antes de ele entrar, ou sobre um controle) é tentado de novo quando ele aparece.
 * Escondido = sem opacidade, sem clique e fora do Tab. Anel branco de 2 px: sobre bloco petróleo o quadrado sumia.
 * Número pendente: em dev/homologação aparece desabilitado; em produção não existe.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandLottie from '../marca/BrandLottie.vue'
import { linkContato } from '@/lib/whatsapp'
import { temBotaoFixo, whatsappPendente } from '@/config/site'
import { useNudge } from '@/composables/useNudge'
import { ui } from '@/lib/ui'
import { ms } from '@/lib/motion'
import { px } from '@/lib/medida'

/** O que o botão nunca cobre: controles e todo selo da página. */
const PROTEGIDOS = [
  '#conteudo :is(a, button, summary, input, select, textarea, [role="button"])',
  '#conteudo .selo',
  'footer.site-f :is(a, button)',
].join(', ')
const FOLGA = 8 // px em volta do botão: encostar também conta (a 375 sobravam 4 px entre o CTA e ele)

const route = useRoute()
const raiz = ref(null)
const lottie = ref(null)
const entrou = ref(false)
const jaEntrou = ref(false) // a 1ª entrada (com o deslocamento) terminou: daqui em diante, só opacidade
const sobreControle = ref(false)
const largo = ref(false) // ≥ 768: glifo + texto
const existe = computed(() => temBotaoFixo(route.meta))
const visivel = computed(() => entrou.value && !ui.ctasHero && !sobreControle.value)
const nome = computed(() =>
  whatsappPendente
    ? 'WhatsApp da Repasse Tech: número pendente'
    : `${largo.value ? 'Chamar no WhatsApp da Repasse Tech' : 'Chamar a Repasse Tech no WhatsApp'} (abre em outra aba)`,
)
const href = computed(() => (whatsappPendente ? undefined : linkContato(route.meta.pagina || route.meta.titulo || '')))

const { registrarClique, tentarDeNovo } = useNudge({ tocar: () => lottie.value?.play(), ativo: () => existe.value && visivel.value && !whatsappPendente })

/** Algum controle ou selo na área do botão (a posição de repouso, sem o deslocamento da entrada)? */
function medir() {
  quadro = 0
  const b = raiz.value?.$el
  if (!b || !b.isConnected) return (sobreControle.value = false)
  if (b.contains(document.activeElement)) return // com o foco nele, fica
  const w = b.offsetWidth || 56
  const MARGEM = px('--fixo-margem') // right/bottom do CSS (tokens.css)
  const L = document.documentElement.clientWidth
  const H = window.innerHeight
  const z = { l: L - MARGEM - w - FOLGA, r: L - MARGEM + FOLGA, t: H - MARGEM - b.offsetHeight - FOLGA, b: H }
  const cobre = [...document.querySelectorAll(PROTEGIDOS)].some((e) => {
    const r = e.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.left < z.r && r.right > z.l && r.top < z.b && r.bottom > z.t && !e.closest('[inert], .vh') && getComputedStyle(e).visibility === 'visible'
  })
  // some na hora; volta só com a rolagem parada (histerese: um sumiço por gesto, nunca o pisca-pisca da rolagem contínua)
  if (cobre) sobreControle.value = true
  else if (!rolando) sobreControle.value = false
}
let quadro = 0
let rolando = false
let tParada = 0
const agendar = () => (quadro ||= requestAnimationFrame(medir))
function aoRolar() {
  rolando = true
  clearTimeout(tParada)
  tParada = setTimeout(() => {
    rolando = false
    agendar()
  }, ms('--fixo-volta'))
  agendar()
}
const mqLargo = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(min-width: 768px)') : null
const aoLargo = () => ((largo.value = Boolean(mqLargo?.matches)), agendar())
const EVENTOS = ['transitionend', 'animationend', 'toggle', 'resize']
let mo = null
let timer = 0
onMounted(() => {
  aoLargo()
  mqLargo?.addEventListener('change', aoLargo)
  window.addEventListener('scroll', aoRolar, { passive: true })
  EVENTOS.forEach((e) => window.addEventListener(e, agendar, { passive: true, capture: true }))
  if (typeof MutationObserver !== 'undefined') {
    mo = new MutationObserver(agendar)
    mo.observe(document.getElementById('app') || document.body, { childList: true, subtree: true })
  }
  timer = setTimeout(() => ((entrou.value = true), agendar()), ms('--atraso-whats-fixo'))
})
let timerEntrou = 0
watch(visivel, (v) => {
  if (!v) return
  tentarDeNovo()
  if (!jaEntrou.value && !timerEntrou) timerEntrou = setTimeout(() => (jaEntrou.value = true), ms('--dur-entra'))
})
onBeforeUnmount(() => {
  clearTimeout(timer)
  clearTimeout(tParada)
  clearTimeout(timerEntrou)
  cancelAnimationFrame(quadro)
  mqLargo?.removeEventListener('change', aoLargo)
  window.removeEventListener('scroll', aoRolar)
  EVENTOS.forEach((e) => window.removeEventListener(e, agendar, { capture: true }))
  mo?.disconnect()
})
</script>

<template>
  <VBtn
    v-if="existe"
    ref="raiz"
    class="rt-whats-fixo"
    :class="{ 'rt-whats-fixo--in': visivel, 'rt-whats-fixo--entrou': jaEntrou }"
    :height="56"
    :href="href"
    target="_blank"
    rel="noopener"
    :disabled="whatsappPendente"
    :aria-label="nome"
    :aria-hidden="visivel ? undefined : 'true'"
    :tabindex="visivel ? undefined : -1"
    @click="registrarClique"
  >
    <span class="rt-whats-fixo__icone">
      <VIcon icon="$rtWhats" :size="24" />
      <BrandLottie ref="lottie" class="rt-whats-fixo__pulso" name="whatsapp-nudge" variant="invertida" trigger="manual" :size="48" poster-inicial />
    </span>
    <span v-if="whatsappPendente" class="rt-whats-fixo__txt">Número pendente</span>
    <span v-else class="rt-whats-fixo__txt"><span class="rt-whats-fixo__chamar">Chamar no </span>WhatsApp</span>
  </VBtn>
</template>

<style>
.v-btn.rt-whats-fixo {
  position: fixed; right: var(--fixo-margem); bottom: calc(var(--fixo-margem) + env(safe-area-inset-bottom)); z-index: 20; isolation: isolate;
  width: 56px; min-width: 56px; height: 56px; padding: 0; border-radius: 0; background: var(--c-petroleo) !important; color: var(--c-branco) !important;
  font: 600 16px/1 var(--ff-t); letter-spacing: 0; text-transform: none; box-shadow: 0 0 0 2px var(--c-branco), var(--s2) !important; /* o .elevation-0 do VBtn zera com !important */
  opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(var(--shift-md));
  /* sumindo: a visibilidade só troca depois do fade; aparecendo: na hora */
  transition: opacity var(--dur-entra) var(--ease-settle), transform var(--dur-entra) var(--ease-settle), visibility 0s var(--ease-pass) var(--dur-entra);
}
.v-btn.rt-whats-fixo--in { opacity: 1; visibility: visible; pointer-events: auto; transform: none; transition-delay: 0s; }
/* depois da 1ª entrada: sumir e voltar é só opacidade — sai em 120 pass, volta em 200 settle */
.v-btn.rt-whats-fixo--entrou { transform: none; transition: opacity var(--dur-sai) var(--ease-pass), transform var(--dur-hover) var(--ease-settle), visibility 0s var(--ease-pass) var(--dur-sai); }
.v-btn.rt-whats-fixo--entrou.rt-whats-fixo--in { transition: opacity var(--dur-hover) var(--ease-settle), transform var(--dur-hover) var(--ease-settle), visibility 0s; }
.v-btn.rt-whats-fixo .v-btn__content { gap: 8px; }
/* < 768: o quadrado, só o glifo (o nome acessível diz o resto) */
.rt-whats-fixo__txt { display: none; white-space: nowrap; }
.rt-whats-fixo__chamar { display: none; }
/* o pulso (Lottie) é irmão do ícone, centrado nele por cima: anéis finos que se abrem para fora; o ícone fica parado */
.rt-whats-fixo__icone { position: relative; display: inline-grid; place-items: center; width: 24px; height: 24px; flex: none; }
.rt-whats-fixo__icone .v-icon { color: var(--c-branco); }
.rt-whats-fixo .rt-lottie.rt-whats-fixo__pulso { position: absolute; left: 50%; top: 50%; margin: -24px 0 0 -24px; pointer-events: none; }
.v-btn.rt-whats-fixo::before {
  content: ""; position: absolute; inset: 0; z-index: -1; background: var(--c-petroleo-profundo); opacity: 0;
  transition: opacity var(--dur-hover) var(--ease-settle);
}
@media (hover: hover) and (pointer: fine) {
  .v-btn.rt-whats-fixo--in:not(.v-btn--disabled):hover { transform: translateY(-2px); transition-duration: var(--dur-hover); } /* 200, não os 280 da entrada */
  .v-btn.rt-whats-fixo:not(.v-btn--disabled):hover::before { opacity: 1; }
}
/* foco visível em qualquer fundo: anel petróleo com halo branco por baixo */
.v-btn.rt-whats-fixo:focus-visible { outline: 3px solid var(--c-petroleo); outline-offset: 3px; box-shadow: 0 0 0 9px var(--c-branco), var(--s2) !important; }
.v-btn.rt-whats-fixo.v-btn--disabled { background: var(--c-cinza-petroleo) !important; color: var(--c-branco) !important; }
.v-btn.rt-whats-fixo--in.v-btn--disabled { pointer-events: none; }
@media (min-width: 768px) {
  .v-btn.rt-whats-fixo { width: auto; padding: 0 16px 0 14px; }
  .rt-whats-fixo__txt { display: inline; }
}
@media (min-width: 1024px) {
  .v-btn.rt-whats-fixo { padding: 0 18px 0 16px; }
  .rt-whats-fixo__chamar { display: inline; }
}
</style>
