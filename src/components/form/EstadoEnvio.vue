<script setup>
/**
 * Estado depois do envio. O site NÃO sabe se a mensagem foi enviada: nunca "Enviado!".
 * montando: carregando-lote em loop e "Preparando a mensagem com o que você preencheu…" À VISTA ao lado (o painel gelo ficava 600 ms
 * com um ícone no canto e mais nada) · pronto: enviado-sucesso 1x (único overshoot do site) · bloqueado: pop-up barrado
 * · erro: a mensagem não pôde ser montada (o clique nunca fica sem resposta).
 * O rótulo de sucesso é o ÚNICO uso de --ease-confirm em CSS. A comemoração (título + enviado-sucesso) toca na `festa`
 * (EnvioForm: quando a pessoa volta para a aba); antes dela o título espera invisível e o Lottie fica no quadro 0 (vazio).
 */
import { ref, watch } from 'vue'
import BrandLottie from '../marca/BrandLottie.vue'
import LinkSeta from '../marca/LinkSeta.vue'

const props = defineProps({
  estado: { type: String, required: true, validator: (v) => ['montando', 'pronto', 'bloqueado', 'erro'].includes(v) },
  url: { type: String, default: '' },
  outroTexto: { type: String, default: 'Mandar outro lote' },
  outroTo: { type: [String, Object], default: () => ({ query: {} }) },
  festa: { type: Boolean, default: true }, // a comemoração do pronto (a bancada mostra o pronto sem esperar)
})
defineEmits(['outro'])

const carregando = ref(null)
const sucesso = ref(null)
watch(
  () => props.estado,
  (e) => {
    if (e === 'montando') carregando.value?.play()
  },
  { flush: 'post' },
)
watch(
  () => props.estado === 'pronto' && props.festa,
  (v) => v && sucesso.value?.play(),
  { flush: 'post' },
)
</script>

<template>
  <div class="estado-envio" aria-live="polite" role="status">
    <div v-if="estado === 'montando'" class="estado-envio__linha estado-envio__linha--montando">
      <BrandLottie ref="carregando" name="carregando-lote" variant="normal" trigger="manual" loop :size="64" @ready="carregando?.play()" />
      <!-- o botão já diz "Abrindo o WhatsApp…": o painel diz o que vai na mensagem -->
      <p class="estado-envio__montando">Preparando a mensagem com o que você preencheu…</p>
    </div>
    <div v-else-if="estado === 'pronto'" class="estado-envio__linha" :class="{ 'estado-envio__linha--festa': festa }">
      <BrandLottie ref="sucesso" name="enviado-sucesso" variant="normal" trigger="manual" :size="64" @ready="festa && sucesso?.play()" />
      <div>
        <p class="h3 estado-envio__titulo">Mensagem pronta no seu WhatsApp.</p>
        <p class="estado-envio__txt">Confira os dados e envie por lá. Se a conversa não abriu, use o botão abaixo.</p>
        <div class="estado-envio__acoes">
          <VBtn :href="url" target="_blank" rel="noopener">Abrir o WhatsApp de novo<span class="vh"> (abre em outra aba)</span></VBtn>
          <LinkSeta :to="outroTo" @click="$emit('outro')">{{ outroTexto }}</LinkSeta>
        </div>
      </div>
    </div>
    <div v-else-if="estado === 'erro'" class="estado-envio__linha">
      <div>
        <p class="h3">Não deu pra montar a mensagem.</p>
        <p class="estado-envio__txt">Nada foi aberto, e o que você preencheu continua aqui. Tente de novo ou fale direto com a Repasse Tech.</p>
        <div class="estado-envio__acoes"><LinkSeta to="/contato">Falar com a Repasse Tech</LinkSeta></div>
      </div>
    </div>
    <div v-else class="estado-envio__linha">
      <!-- slot #bloqueado: outro motivo de bloqueio, ex. lote sem NF/IMEI no FormVender -->
      <slot name="bloqueado">
        <div>
          <p class="h3">O navegador bloqueou a janela do WhatsApp.</p>
          <p class="estado-envio__txt">A mensagem está pronta: use o botão pra abrir a conversa.</p>
          <div class="estado-envio__acoes">
            <VBtn :href="url" target="_blank" rel="noopener">Abrir o WhatsApp<span class="vh"> (abre em outra aba)</span></VBtn>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style>
.estado-envio { margin-top: 24px; padding: 20px; background: var(--c-gelo); color: var(--c-petroleo); }
.estado-envio__linha { display: flex; align-items: flex-start; gap: 16px; }
/* o texto encolhe e quebra (flex item sem min-width: 0 empurra o botão para fora da caixa no celular) */
.estado-envio__linha > div { min-width: 0; }
@media (max-width: 479px) { .estado-envio__linha { flex-direction: column; gap: 8px; } } /* Lottie em cima: "Abrir de novo" não cabe ao lado */
.estado-envio__txt { margin: 4px 0 0; color: var(--c-cinza-petroleo); }
.estado-envio__acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 16px; }
.estado-envio__linha--montando { flex-direction: row; align-items: center; } /* curto: cabe ao lado do Lottie também a 320 */
.estado-envio__montando { margin: 0; font: 600 var(--fs-h3)/1.25 var(--ff-t); color: var(--c-petroleo); }
.js:not(.rm) .estado-envio__linha:not(.estado-envio__linha--festa) .estado-envio__titulo { opacity: 0; }
.estado-envio__linha--festa .estado-envio__titulo { animation: rt-confirma var(--dur-move) var(--ease-confirm) backwards; }
@keyframes rt-confirma { from { opacity: 0; transform: scale(.96); } }
</style>
