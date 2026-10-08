<script setup>
/**
 * Logo oficial da Repasse Tech (brand/, fora do src). NUNCA desenhar o R, o celular ou a seta, nem inverter com filter.
 * `size` = ALTURA em px; a largura sai da proporção do arquivo (RAZAO). A altura também pode vir do CSS do pai por
 * `--logo-h` (header e menu: 72 de 320 a 359, 80 de 360 a 1023, 72 a partir de 1024; rodapé 80 pela prop). Lockup nunca
 * abaixo de 72: com 56 o "TECH" tinha 5,19 px de caixa alta e virava mancha. Cadeia resolvida no build; @error avança;
 * sem arquivo = slot rotulado.
 */
import { computed, inject, ref, unref, watch } from 'vue'
import { RAZAO, candidatosLogo } from '@/lib/marca'

const props = defineProps({
  variant: { type: String, default: 'auto', validator: (v) => ['normal', 'invertida', 'auto'].includes(v) },
  tipo: { type: String, default: 'lockup', validator: (v) => ['lockup', 'icone', 'icone-sem-seta'].includes(v) },
  size: { type: Number, default: 112 },
  alt: { type: String, default: 'Repasse Tech' },
})

const tom = inject('rtTom', null)
const variante = computed(() => (props.variant === 'auto' ? (unref(tom) === 'petroleo' ? 'invertida' : 'normal') : props.variant))
const candidatos = computed(() => candidatosLogo(props.tipo, variante.value))
const indice = ref(0)
watch(candidatos, () => (indice.value = 0))
const atual = computed(() => candidatos.value[indice.value])
const razao = computed(() => RAZAO[props.tipo])
const caixa = computed(() => ({ '--logo-h-prop': `${props.size}px`, '--logo-razao': razao.value }))
const pequeno = computed(() => props.size < 80)
</script>

<template>
  <img
    v-if="atual"
    class="logo-marca"
    :data-arquivo="atual.nome"
    :src="atual.url"
    :alt="alt"
    :width="Math.round(size * razao)"
    :height="size"
    :style="caixa"
    @error="indice++"
  />
  <span
    v-else
    class="logo-marca slot-logo"
    :class="{ 'slot-logo--p': pequeno }"
    role="img"
    aria-label="Logo oficial — arquivo pendente em brand/"
    :style="caixa"
  >
    <slot name="fallback"><b>LOGO OFICIAL</b><small>— brand/</small></slot>
  </span>
</template>

<style>
.logo-marca { display: block; flex: none; height: var(--logo-h, var(--logo-h-prop)); width: auto; aspect-ratio: var(--logo-razao); max-width: none; }
/* sem arquivo de logo: slot rotulado */
.slot-logo { display: grid; place-content: center; gap: 2px; text-align: center; border: 1.5px dashed var(--slot-borda); color: var(--text-2); background: transparent; }
.slot-logo b { font: 500 11px/1.2 var(--ff-t); letter-spacing: .14em; }
.slot-logo small { font: 400 11px/1.2 var(--ff-c); }
.slot-logo--p b { font-size: 9px; letter-spacing: .06em; }
.slot-logo--p small { font-size: 9px; }
</style>
