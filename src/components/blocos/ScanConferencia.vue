<script setup>
/**
 * Scan da conferência + selo (Home e Confiança: o mesmo bloco). Caixa .conf-side do grid .conf-g (base.css). Scan: 2 ciclos
 * por entrada na tela, do quadro 0 (BrandLottie :ciclos), depois poster (WCAG 2.2.2); fora da tela pausa e rearma.
 * O selo nasce VISÍVEL, parado no poster (nunca a vaga vazia: até o Lottie chegar, o selo parado, o mesmo desenho), e
 * carimba do quadro 0 quando a varredura do 1º ciclo termina
 * (o `marco` do manifest, quadro 44), uma vez por visita (`carimbo` = chave de lib/visita, uma por página). Visita que já
 * carimbou: o selo parado (SeloEstatico, sem Lottie).
 * Lottie atrasado ou bloqueado: a RESERVA do scan é o quadro do poster dele desenhado (src/assets/reserva, embutido no JS:
 * não depende de mais nenhum pedido de rede) — a caixa nunca fica vazia nem muda de tamanho.
 */
import { computed, inject, ref, unref } from 'vue'
import { useDisplay } from 'vuetify'
import BrandLottie from '../marca/BrandLottie.vue'
import SeloEstatico from '../marca/SeloEstatico.vue'
import { jaFoi, umaVez } from '@/lib/visita'
import scanNormal from '@/assets/reserva/scan-imei-nf.svg?inline'
import scanInvertida from '@/assets/reserva/scan-imei-nf-invertida.svg?inline'

const props = defineProps({ carimbo: { type: String, required: true } })
const { mdAndUp } = useDisplay()
const selo = ref(null)
const jaCarimbou = jaFoi(props.carimbo)
const tom = inject('rtTom', null)
const variante = computed(() => (unref(tom) === 'petroleo' ? 'invertida' : 'normal')) // a do Lottie (auto), para o selo parado
const lado = computed(() => (mdAndUp.value ? 128 : 96))
function aoMarco() {
  if (umaVez(props.carimbo)) selo.value?.play()
}
</script>

<template>
  <div class="conf-side" aria-hidden="true">
    <BrandLottie name="scan-imei-nf" :ciclos="2" :size="lado" @marco="aoMarco">
      <template #fallback>
        <img class="conf-scan-reserva" :src="variante === 'invertida' ? scanInvertida : scanNormal" :width="lado" :height="lado" alt="" data-reserva="scan-imei-nf" />
      </template>
    </BrandLottie>
    <span class="conf-selo">
      <SeloEstatico v-if="jaCarimbou" :size="48" :variant="variante" />
      <BrandLottie v-else ref="selo" name="selo-verificado" trigger="manual" :size="48" poster-inicial reserva-ate-carregar>
        <template #fallback><SeloEstatico :size="48" :variant="variante" /></template>
      </BrandLottie>
    </span>
  </div>
</template>
