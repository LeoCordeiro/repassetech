<script setup>
/**
 * Hero da Home, "a frase dividida pela costura". Contém o SiteHeader split.
 * Sequência completa só na 1ª visita da sessão (chave rt-hero-visto, lib/visita); depois, estado final com os Lottie no
 * poster. Nunca espera Lottie/fonte: dispara no mount (duplo rAF).
 * O TEXTO do hero é pintado desde o 1º quadro (H1, rótulos das metades, legenda e
 * leads: sem entrada por opacidade nem transform), porque o H1 é o elemento LCP e a entrada dele custava 0,54–0,69 s. O
 * movimento do hero fica no R, nas setas, no selo e nos CTAs.
 * Assinatura no eixo: brand/logo-icone-sem-seta (o R + celular) entra com settle e o Lottie seta-repasse desenha a
 * seta da logo saindo da perna do R, sobreposto EXATAMENTE no lugar dela. O canvas do Lottie (210×145) é o recorte
 * x 150→360, y 200→345 do desenho; o ícone usa o viewBox 80 60 292 308 → caixa da seta em % do ícone (CSS).
 * O R entra junto com a perna (sozinho ele se lia "P" por ~370 ms): os dois começam quando a vez chegou
 * (--atraso-hero-seta) E o Lottie está pronto — o player vem sob demanda, e a 375 ele chegava depois da vez.
 * Se o Lottie falhar ou passar de --espera-lottie (a `reserva` do BrandLottie): logo-icone inteiro, entrando do mesmo jeito.
 * Fora da sequência (2ª visita, reduzir movimento): logo-icone inteiro e parado. Nunca o R sem seta sozinho.
 * O selo carimba --atraso-hero-selo − --atraso-hero-seta (400 ms) depois de a seta começar.
 * A travessia: só ≥ 1024, a seta-travessia (110×48, na escala
 * da seta da logo do ícone de 144) entra pela metade de quem vende, na altura da ponta da seta da logo, e TERMINA ATRÁS DA
 * PLACA (a ponta dela fica inteira escondida): o lote entra na conferência; a seta da logo é a saída. Ordem: travessia (600)
 * → seta da logo (800) → selo. No quadro final, uma ponta laranja só no eixo: a da logo.
 * Abaixo de 1024, um atalho "Precisa repor? Quero comprar lotes" logo abaixo do CTA laranja: o CTA de quem compra
 * ficava fora da 1ª tela no celular.
 * Os CTAs na tela (IntersectionObserver) vão para ui.ctasHero: o botão fixo de WhatsApp só entra quando eles saem.
 * Selo: a reserva é o SeloEstatico (o mesmo desenho); o selo atrasado só aparece (fade) quando há o que mostrar.
 * Tempos: motion.css, lidos por ms().
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import BrandLottie from '../marca/BrandLottie.vue'
import BtnContorno from '../marca/BtnContorno.vue'
import BtnSeta from '../marca/BtnSeta.vue'
import LinkSeta from '../marca/LinkSeta.vue'
import LogoMarca from '../marca/LogoMarca.vue'
import SeloEstatico from '../marca/SeloEstatico.vue'
import SetaMarca from '../marca/SetaMarca.vue'
import SiteHeader from '../layout/SiteHeader.vue'
import { reduzirAgora } from '@/composables/useReduzirMovimento'
import { acharLogo } from '@/lib/marca'
import { ui } from '@/lib/ui'
import { IMEI } from '@/data/conferencia-imei'
import { doisQuadros, ms } from '@/lib/motion'
import { CHAVE_HERO as CHAVE, jaFoi, marcar } from '@/lib/visita' // CHAVE no sessionStorage: descrita na Política de privacidade

const { mdAndUp } = useDisplay()
const anima = ref(!jaFoi(CHAVE, true) && !reduzirAgora())
const entrou = ref(false)
const seta = ref(null)
const selo = ref(null)
const setaPronta = ref(false)
const seloPronto = ref(false)
const seloReserva = ref(false)
const seloAtrasado = ref(false)
// logo inteira e parada: fora da sequência, sem o arquivo sem seta, ou quando o Lottie falha/não chega a tempo
const completo = ref(!anima.value || !acharLogo('logo-icone-sem-seta'))
const alturaIcone = computed(() => (mdAndUp.value ? 144 : 96))
const tamSeta = computed(() => ({ w: (210 * alturaIcone.value) / 308, h: (145 * alturaIcone.value) / 308 }))
const seloVez = ref(!anima.value) // fora da sequência o selo nasce no poster, visível
const setaVez = ref(!anima.value) // a seta também: o quadro 0 dela é um ponto solto na perna do R
const iconeVez = ref(!anima.value) // o R (ou a logo inteira) entra com a seta
let vezDaSeta = false
let setaComecou = false
// o selo atrasado (rede lenta) só aparece quando há o que mostrar: o Lottie chegou ou a reserva entrou
const seloVisivel = computed(() => seloVez.value && (!seloAtrasado.value || seloPronto.value || seloReserva.value))
// travessia: seta-travessia 110×48 (a ponta ocupa 44 = 94 × 144/308, a mesma da seta da logo no ícone de 144), só ≥ 1024
const travessia = ref(null)
const travessiaVez = ref(!anima.value) // o quadro 0 da seta é um ponto solto: invisível até a vez
const TRAVESSIA = { w: 110, h: 48 }
let travessiaPronta = false
let travessiaAtrasada = false
const timers = []
const raiz = ref(null)
let ioCtas = null
// os CTAs nascem na tela: o botão fixo já começa esperando (o observer corrige no 1º quadro)
ui.ctasHero = true

/**
 * R + seta da logo (ou a logo inteira, se o Lottie falhou/atrasou), e o selo 400 ms depois. Uma vez. O R e a perna aparecem
 * juntos no 1º quadro em que o Lottie ANDA (o play() só começa 1–2 quadros depois do pedido, mais sob carga): o R sem a perna,
 * o "P", fica ≤ 150 ms. Rede: se o teto de Lottie segurar a seta (fila de 300 ms), os dois aparecem com ela no poster.
 */
function iniciarSeta() {
  if (setaComecou || !vezDaSeta || !(setaPronta.value || completo.value)) return
  setaComecou = true
  if (completo.value) iconeVez.value = true
  else {
    let tira = null
    const mostrar = () => {
      tira?.()
      clearTimeout(rede)
      setaVez.value = true
      iconeVez.value = true
    }
    const rede = setTimeout(mostrar, ms('--espera-vez-lottie'))
    timers.push(rede)
    // a partir do quadro 1 (a perna ainda é o ponto da ponta): ligado no 1º quadro que anda (> 0), o "P" ficava no limite (133
    // a 151 ms com a máquina carregada). O goToAndPlay(0) dispara um enterFrame no 0, e a espera na fila um no poster (pausado):
    // nenhum dos dois conta
    tira = setaAnim?.addEventListener('enterFrame', (e) => e.currentTime >= 1 && !setaAnim.isPaused && mostrar()) ?? null
    seta.value?.play()
  }
  timers.push(
    setTimeout(() => {
      seloVez.value = true
      seloPronto.value ? selo.value?.play() : (seloAtrasado.value = true)
    }, ms('--atraso-hero-selo') - ms('--atraso-hero-seta')),
  )
}
function semSeta() {
  if (setaComecou) return
  completo.value = true
  iniciarSeta()
}
let setaAnim = null
function aoSetaPronta(anim) {
  setaAnim = anim
  setaPronta.value = true
  iniciarSeta()
}

function aoSeloPronto() {
  seloPronto.value = true
  if (seloAtrasado.value) selo.value?.poster()
}
function aoTravessiaPronta() {
  travessiaPronta = true
  if (travessiaAtrasada) travessia.value?.poster()
}

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined') {
    const naTela = new Set()
    ioCtas = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? naTela.add(e.target) : naTela.delete(e.target)))
      ui.ctasHero = naTela.size > 0
    })
    raiz.value.querySelectorAll('.hero-ca, .hero-cb').forEach((el) => ioCtas.observe(el))
  } else ui.ctasHero = false
  if (!anima.value) return
  marcar(CHAVE, true)
  ui.heroAnimando = true
  doisQuadros(() => (entrou.value = true))
  timers.push(
    setTimeout(() => {
      if (!mdAndUp.value) return
      travessiaVez.value = true
      travessiaPronta ? travessia.value?.play() : (travessiaAtrasada = true)
    }, ms('--atraso-hero-travessia')),
    setTimeout(() => {
      vezDaSeta = true
      iniciarSeta()
    }, ms('--atraso-hero-seta')),
    setTimeout(() => (ui.heroAnimando = false), ms('--dur-hero-lottie')),
  )
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  ioCtas?.disconnect()
  ui.heroAnimando = false
  ui.ctasHero = false
})
</script>

<template>
  <section id="hero" ref="raiz" class="sec sai hero-repasse" :class="{ anima, in: entrou }" aria-labelledby="h1-inicio">
    <SiteHeader split />
    <div class="wrap">
      <div class="hero-g">
        <div class="hero-fundo-b" aria-hidden="true" />
        <p class="rotulo hero-la ctx-claro">Quem tem lote parado</p>
        <h1 id="h1-inicio" class="hero-h1" tabindex="-1">
          <span class="h1-a">Lote parado de um lado,</span>
          <span class="h1-b">reposição do outro.</span>
          <span class="h1-c" data-t="A gente confere no meio.">A gente confere no meio.</span>
        </h1>
        <div class="hero-meio">
          <!-- invólucro (o nó do Lottie nunca recebe opacidade): some até a vez da travessia. Só ≥ 1024 -->
          <div v-if="mdAndUp" class="hero-travessia" :class="{ 'hero-travessia--vez': travessiaVez }" aria-hidden="true">
            <BrandLottie
              ref="travessia"
              name="seta-travessia"
              variant="normal"
              trigger="manual"
              :size="TRAVESSIA"
              :poster-inicial="!anima"
              @ready="aoTravessiaPronta"
            >
              <!-- o desenho do Lottie tem 2 px de margem em cima e embaixo: a SetaMarca de 44 de altura é a mesma seta -->
              <template #fallback><SetaMarca :largura="TRAVESSIA.w - 6" :altura="TRAVESSIA.h - 4" /></template>
            </BrandLottie>
          </div>
          <div class="hero-logo-box">
            <div class="hero-icone" :class="{ 'hero-icone--vez': iconeVez }">
              <LogoMarca v-if="completo" tipo="icone" variant="normal" :size="alturaIcone" alt="Repasse Tech" />
              <template v-else>
                <LogoMarca tipo="icone-sem-seta" variant="normal" :size="alturaIcone" alt="Repasse Tech" />
                <div class="hero-seta" :class="{ 'hero-seta--vez': setaVez }" aria-hidden="true">
                  <BrandLottie
                    ref="seta"
                    name="seta-repasse"
                    variant="normal"
                    trigger="manual"
                    :size="tamSeta"
                    @ready="aoSetaPronta"
                    @falha="semSeta"
                    @reserva="semSeta"
                  />
                </div>
              </template>
            </div>
            <div class="hero-selo" :class="{ 'hero-selo--atrasado': seloAtrasado && seloVisivel, 'hero-selo--vez': seloVisivel }" aria-hidden="true">
              <SeloEstatico v-if="!anima" :size="48" variant="normal" />
              <BrandLottie
                v-else
                ref="selo"
                name="selo-verificado"
                variant="normal"
                trigger="manual"
                :size="48"
                @ready="aoSeloPronto"
                @reserva="seloReserva = true"
              >
                <template #fallback><SeloEstatico :size="48" variant="normal" /></template>
              </BrandLottie>
            </div>
          </div>
        </div>
        <p class="lead hero-sa ctx-claro">Monte o lote com nota. Celular e tablet com chip vão com IMEI. A gente confere antes de ir pra loja.</p>
        <div class="hero-ca ctx-claro" data-h="cta">
          <BtnSeta to="/quero-vender" block-celular>Quero vender meu lote</BtnSeta>
          <p class="hero-atalho"><span>Precisa repor?</span> <LinkSeta to="/quero-comprar">Quero comprar lotes</LinkSeta></p>
        </div>
        <p class="rotulo hero-lb ctx-petroleo">Quem precisa repor</p>
        <p class="lead hero-sb ctx-petroleo">{{ IMEI.heroB }}</p>
        <!-- tom: o VBtn põe no próprio nó a classe do tema herdado (claro); o tom diz qual tema ele usa -->
        <div class="hero-cb ctx-petroleo" data-h="cta"><BtnContorno tom="petroleo" to="/quero-comprar" block-celular>Quero comprar lotes</BtnContorno></div>
      </div>
    </div>
  </section>
</template>

<style>
/* hero dividido (o header fica no SiteHeader split) */
.hero-repasse { isolation: isolate; padding-top: 0; background: var(--c-branco); }
.hero-g {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr);
  grid-template-rows: repeat(4, auto) 56px 56px repeat(6, auto); padding-bottom: 8px;
}
.hero-g > * { grid-column: 1; }
.hero-fundo-b { grid-row: 6 / -1; margin: 0 -16px calc(-1 * (var(--sec-pad) + var(--costura-respiro) + 8px)); background: var(--c-petroleo); z-index: -1; }
.hero-la { grid-row: 1; margin: 16px 0 0; }
.hero-h1 {
  grid-column: 1; grid-row: 2 / 11; display: grid; grid-template-rows: subgrid; margin: 0; pointer-events: none;
  font: 700 var(--fs-display)/1.05 var(--ff-t); letter-spacing: -.025em;
}
.hero-h1:focus { outline: none; }
.hero-h1 > span { display: block; }
.h1-a { grid-row: 1; margin-top: 10px; color: var(--c-petroleo-profundo); }
.h1-b { grid-row: 8; margin-top: 10px; color: var(--c-branco); }
.h1-c { grid-row: 9; margin-top: 8px; color: var(--c-texto-2-escuro); }
.hero-sa { grid-row: 3; margin: 16px 0 0; }
.hero-ca { grid-row: 4; margin: 24px 0 40px; }
.hero-meio { grid-row: 5 / 7; grid-column: 1; position: relative; display: grid; place-items: center; }
.hero-lb { grid-row: 8; margin: 32px 0 0; }
.hero-sb { grid-row: 11; margin: 16px 0 0; }
.hero-cb { grid-row: 12; margin-top: 24px; }
.hero-g .lead { margin-block: 16px 0; }
/* atalho de quem compra na 1ª tela (< 1024; a partir daí os dois CTAs dividem a linha) */
.hero-atalho { margin: 14px 0 0; font: 400 15px/1.4 var(--ff-c); color: var(--c-cinza-petroleo); }
.hero-atalho .link-seta { font-size: 15px; white-space: nowrap; }
/* travessia (só ≥ 1024): atrás da placa (z 1 < 2), na ALTURA DA PONTA da seta da logo — a ponta fica em y 295
   do viewBox do ícone (60→368), 81/308 da altura abaixo do centro dele (= centro da placa, que tem 8 px em volta). A base da
   ponta do Lottie (79,8 de 110) fica 70 px antes do eixo, dentro da placa (que tem 76 de cada lado): a ponta inteira fica
   atrás dela, e a haste (≈ 70 px à vista) entra pela metade de quem vende sem chegar ao texto (a 1024, ~30 px de folga) */
.hero-travessia { position: absolute; z-index: 1; left: calc(50% - 150px); top: calc(50% + 144px * 81 / 308); width: 110px; height: 48px; margin-top: -24px; pointer-events: none; }
.hero-travessia .rt-lottie { position: absolute; inset: 0; }
.js:not(.rm) .hero-travessia:not(.hero-travessia--vez) { opacity: 0; }
/* placa branca no eixo (metade em cada fundo): o ícone é o da variante clara */
.hero-logo-box { position: relative; z-index: 2; padding: 8px; background: var(--c-branco); --slot-borda: var(--c-borda-controle); --text-2: var(--c-cinza-petroleo); }
.hero-icone { position: relative; width: max-content; }
/* caixa da seta = recorte x 150→360, y 200→345 da logo no viewBox do ícone (80 60 292 308), em %: escala junto */
.hero-seta { position: absolute; left: calc(70 / 292 * 100%); top: calc(140 / 308 * 100%); width: calc(210 / 292 * 100%); height: calc(145 / 308 * 100%); pointer-events: none; }
.hero-seta .rt-lottie { position: absolute; inset: 0; }
/* selo colado ao canto de cima do ícone (o de baixo é a ponta da seta) */
.hero-selo { position: absolute; z-index: 3; width: 48px; height: 48px; right: -18px; top: -18px; }
/* invólucros da seta e do selo (o nó do Lottie nunca recebe opacidade): invisíveis até a vez de cada um */
.js:not(.rm) .hero-selo:not(.hero-selo--vez), .js:not(.rm) .hero-seta:not(.hero-seta--vez) { opacity: 0; }
.hero-selo--atrasado { animation: hero-selo-aparece var(--dur-hover) var(--ease-settle) both; }
@keyframes hero-selo-aparece { from { opacity: 0; } }

@media (min-width: 1024px) {
  .hero-repasse { background: linear-gradient(90deg, var(--c-branco) 50%, var(--c-petroleo) 50%); padding-bottom: calc(64px + var(--costura-respiro)); }
  .hero-repasse .wrap { max-width: none; padding-inline: max(24px, calc((100vw - var(--hero-max)) / 2)); }
  .hero-fundo-b { display: none; }
  .hero-g { grid-template-columns: minmax(0, 1fr) 160px minmax(0, 1fr); column-gap: 80px; grid-template-rows: repeat(6, auto); padding: 40px 0 0; }
  .hero-la { grid-area: 1 / 1; margin: 0; }
  .hero-lb { grid-area: 1 / 3; margin: 0; }
  .hero-h1 { grid-column: 1 / -1; grid-row: 2 / 4; grid-template-columns: subgrid; }
  .h1-a { grid-area: 1 / 1; align-self: center; margin: 24px 0 0; }
  .h1-b { grid-area: 1 / 3; align-self: center; margin: 24px 0 0; }
  .h1-c { grid-row: 2; grid-column: 1 / -1; margin: 28px 0 0; text-align: center; color: transparent; position: relative; }
  .h1-c::before, .h1-c::after { content: attr(data-t) / ""; position: absolute; inset: 0; text-align: inherit; }
  .h1-c::before { color: var(--c-petroleo-profundo); clip-path: inset(0 50% 0 0); }
  .h1-c::after { color: var(--c-branco); clip-path: inset(0 0 0 50%); }
  .hero-meio { grid-area: 2 / 2; margin-top: 24px; }
  .hero-sa { grid-area: 5 / 1; }
  .hero-sb { grid-area: 5 / 3; }
  .hero-g .hero-sa, .hero-g .hero-sb { margin-top: 36px; }
  .hero-ca { grid-area: 6 / 1; margin: 28px 0 0; }
  .hero-cb { grid-area: 6 / 3; margin-top: 28px; }
  .hero-atalho { display: none; }
  /* de 1024 a ~1311 o --fs-display (69–76 px) não cabia na coluna (328–406 px): "Lote / parado / de um / lado," em 4
     linhas e os CTAs fora da 1ª tela. A fonte acompanha a coluna: "Lote parado" (≈ 6 em) cabe numa linha. */
  .hero-h1 { font-size: min(var(--fs-display), calc((100vw - 368px) / 12.2)); }
}
@media (forced-colors: active) { .h1-c { color: CanvasText; } .h1-c::before, .h1-c::after { content: none; } }

/* entrada: só na 1ª visita da sessão, nunca sob .rm. O texto fica parado; os CTAs sobem no 300
   (--dur-hero / 3; a sequência CSS termina em 700) e o R entra quando a perna da seta começa (classe .hero-icone--vez, JS) */
.hero-repasse.anima [data-h] {
  transition: opacity var(--dur-reveal) var(--ease-settle), transform var(--dur-reveal) var(--ease-settle);
}
.hero-repasse.anima [data-h="cta"] { transition-delay: calc(var(--dur-hero) / 3); }
.js:not(.rm) .hero-repasse.anima:not(.in) [data-h] { opacity: 0; transform: translateY(var(--shift-sm)); }
.hero-repasse.anima .hero-icone { transition: opacity var(--dur-entra) var(--ease-settle), transform var(--dur-entra) var(--ease-settle); }
.js:not(.rm) .hero-repasse.anima .hero-icone:not(.hero-icone--vez) { opacity: 0; transform: translateY(var(--shift-sm)); }
</style>
