<script setup>
/**
 * Rodapé de envio dos formulários: BtnSeta submit + legenda + EstadoEnvio.
 * montando: a ponta recolhe e o rótulo cruza para "Abrindo o WhatsApp…" (largura não muda: os dois rótulos
 * ocupam a mesma célula do grid). semDocs (Quero vender sem nota/IMEI): o botão continua ativo e focável, sem a ponta.
 * Painel de status recebe foco no pronto e rola até a vista (nearest).
 * `anuncio`: o resumo ÚNICO do envio inválido, numa região viva que fica sempre no DOM.
 * Abaixo de 640 o botão ocupa a largura (prop blockCelular, como o CTA do hero) e o rótulo vai centralizado
 * (em 2 linhas à esquerda sobravam ~40% de laranja vazio). A legenda cita a Meta: o texto passa por ela antes do envio.
 * Ponta e comemoração:
 *  - a ponta usa a mesma lista de funções em todo estado (BtnSeta): recolhe em 120 pass também com o ponteiro em cima;
 *  - a COMEMORAÇÃO (título com confirm, enviado-sucesso com o único overshoot do site, a ponta renascendo e partindo) é a
 *    `festa`: espera a pessoa VOLTAR para a aba (visibilitychange → visível). Com a aba visível no pronto (pop-up que abriu
 *    noutra janela, WhatsApp desktop), nasce junto com o painel. Até a festa, a ponta fica recolhida e o título espera (nada
 *    some e volta do nada). Reduzir movimento: estado final direto. Trocar de estado ou de rota antes da volta tira a espera.
 */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import BtnSeta from '../marca/BtnSeta.vue'
import EstadoEnvio from './EstadoEnvio.vue'
import { reduzirAgora } from '@/composables/useReduzirMovimento'
import { doisQuadros } from '@/lib/motion'

const props = defineProps({
  estado: { type: String, required: true }, // ocioso | montando | pronto | bloqueado | erro
  url: { type: String, default: '' },
  semDocs: { type: Boolean, default: false },
  pendente: { type: Boolean, default: false }, // número de WhatsApp não configurado (só dev/homologação)
  anuncio: { type: String, default: '' },
  descritoPor: { type: String, default: undefined },
  outroTexto: { type: String, default: 'Mandar outro lote' },
})
const emit = defineEmits(['outro'])

const painel = ref(null)
const festa = ref(false)
function aoVoltar() {
  if (document.visibilityState !== 'visible') return
  document.removeEventListener('visibilitychange', aoVoltar)
  doisQuadros(() => props.estado === 'pronto' && (festa.value = true))
}
watch(
  () => props.estado,
  async (e) => {
    festa.value = false
    document.removeEventListener('visibilitychange', aoVoltar)
    if (e === 'pronto') {
      // aba à vista no pronto (o WhatsApp abriu noutra janela): a festa nasce junto com o painel — o título nunca fica 2
      // quadros para trás do texto
      if (reduzirAgora() || document.visibilityState === 'visible') festa.value = true
      else document.addEventListener('visibilitychange', aoVoltar)
    }
    if (e !== 'pronto' && e !== 'bloqueado' && e !== 'erro') return
    await nextTick()
    painel.value?.focus({ preventScroll: true })
    painel.value?.scrollIntoView({ block: 'nearest', behavior: reduzirAgora() ? 'instant' : 'smooth' })
  },
)
onBeforeUnmount(() => document.removeEventListener('visibilitychange', aoVoltar))
</script>

<template>
  <div class="envio-form" :class="[`envio-form--${estado}`, { 'envio-form--sem-docs': semDocs, 'envio-form--festa': festa }]">
    <BtnSeta
      type="submit"
      block-celular
      :disabled="pendente"
      :aria-describedby="[descritoPor, pendente ? 'envio-pendente' : null].filter(Boolean).join(' ') || undefined"
    >
      <span class="envio-rot">
        <span class="envio-rot__a" :aria-hidden="estado === 'montando' ? 'true' : undefined">Enviar pelo WhatsApp</span>
        <span class="envio-rot__b" :aria-hidden="estado === 'montando' ? undefined : 'true'">Abrindo o WhatsApp…</span>
      </span>
    </BtnSeta>
    <p class="vh" aria-live="polite" role="status">{{ anuncio }}</p>
    <p v-if="pendente" id="envio-pendente" class="legenda envio-form__pendente">Falta o número de WhatsApp: o botão fica desligado até ele chegar.</p>
    <p class="legenda envio-form__legenda">
      O site não envia nada para a Repasse Tech: o texto abre no WhatsApp, que é da Meta, e só chega à Repasse Tech se você enviar.
      <!-- em outra aba, como os Termos do aceite: o formulário preenchido continua aqui -->
      <RouterLink to="/privacidade" target="_blank" rel="noopener">Ver a Política de privacidade<span class="vh"> (abre em outra aba)</span></RouterLink>.
    </p>
    <div v-if="estado !== 'ocioso'" ref="painel" class="envio-form__painel" tabindex="-1">
      <EstadoEnvio :estado="estado" :url="url" :festa="festa" :outro-texto="outroTexto" @outro="emit('outro')" />
    </div>
  </div>
</template>

<style>
.envio-form { margin-top: 32px; min-width: 0; }
.envio-rot { display: grid; }
.envio-rot > span { grid-area: 1 / 1; text-align: left; transition: opacity var(--dur-sai) var(--ease-pass); }
.envio-rot__b { opacity: 0; }
.envio-form--montando .envio-rot__a { opacity: 0; }
.envio-form--montando .envio-rot__b { opacity: 1; }
/* montando, lote sem documentação e o pronto antes da festa: a ponta fica recolhida — translateX(0) scaleX(0), a mesma
   lista do repouso e do hover (interpola a partir do hover também). A classe vai dobrada para vencer o :hover/:focus-visible
   do BtnSeta (0,4,1): logo depois do clique o ponteiro continua sobre o botão. */
:is(.envio-form--montando, .envio-form--sem-docs) .v-btn.rt-btn-seta.rt-btn-seta::after,
:is(.envio-form--montando, .envio-form--sem-docs) .v-btn.rt-btn-seta.rt-btn-seta:hover::after,
:is(.envio-form--montando, .envio-form--sem-docs) .v-btn.rt-btn-seta.rt-btn-seta:focus-visible::after,
.js:not(.rm) .envio-form--pronto:not(.envio-form--festa) .v-btn.rt-btn-seta.rt-btn-seta::after,
.js:not(.rm) .envio-form--pronto:not(.envio-form--festa) .v-btn.rt-btn-seta.rt-btn-seta:hover::after,
.js:not(.rm) .envio-form--pronto:not(.envio-form--festa) .v-btn.rt-btn-seta.rt-btn-seta:focus-visible::after {
  transform: translateX(0) scaleX(0); background-color: var(--c-laranja);
}
.envio-form--montando .v-btn.rt-btn-seta.rt-btn-seta::after { transition-duration: var(--dur-sai); }
/* festa (a pessoa voltou para a aba): a ponta renasce da posição recolhida, PARTE para a direita depois do título de sucesso
   (--dur-move) e renasce no lugar — o formulário continua pronto para outro envio. Mesma lista de funções nos keyframes. */
.envio-form--festa .v-btn.rt-btn-seta::after {
  animation:
    rt-seta-volta var(--dur-hover) var(--ease-pass) calc(var(--dur-move) + var(--dur-parte)) backwards,
    rt-seta-parte var(--dur-parte) var(--ease-pass) var(--dur-move) backwards;
}
.rm .envio-form--festa .v-btn.rt-btn-seta::after { animation: none; }
@keyframes rt-seta-parte {
  from { transform: translateX(0) scaleX(0); }
  30% { transform: translateX(0) scaleX(1); opacity: 1; }
  to { transform: translateX(var(--shift-parte)) scaleX(1); opacity: 0; }
}
@keyframes rt-seta-volta { from { transform: translateX(0) scaleX(0); } to { transform: translateX(0) scaleX(1); } }
.envio-form__pendente { margin: 12px 0 0; color: var(--c-petroleo); font-weight: 500; }
.envio-form__legenda { margin: 12px 0 0; max-width: 52ch; }
.envio-form__legenda a { color: var(--c-petroleo); text-underline-offset: 3px; }
/* os 2 rótulos dividem a mesma célula: < 640 (botão em largura total) centra os dois */
@media (max-width: 639px) { .envio-form .envio-rot > span { text-align: center; } }
.envio-form__painel { scroll-margin-block: 16px; animation: rt-painel-entra var(--dur-entra) var(--ease-settle) backwards; }
.envio-form__painel:focus { outline: none; }
.envio-form__painel:focus-visible { outline: 3px solid var(--focus, var(--c-petroleo)); outline-offset: 3px; }
@keyframes rt-painel-entra { from { opacity: 0; transform: translateY(var(--shift-sm)); } }
</style>
