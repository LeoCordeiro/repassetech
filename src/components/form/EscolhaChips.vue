<script setup>
/**
 * Escolha por chip (Tipo, Nota fiscal, IMEI, Marca, Condição, Pra quando; marcas e condições no Quero comprar).
 * Por baixo é <input type="radio|checkbox"> nativo dentro de <fieldset>/<legend>: Tab entra no grupo, as setas trocam
 * a escolha (rádio), Espaço marca (checkbox), e o leitor de tela fala "pergunta, opção, marcado". Nada do círculo de
 * fábrica do Material nem do VSelect (2 toques por escolha): 1 toque, alvo de 44 px.
 * O erro mora aqui (sem região viva por campo: o resumo único é do EnvioForm). Só o grupo de rádio recebe
 * role="radiogroup" + aria-invalid; no múltiplo, aria-invalid vai em cada checkbox (fieldset não aceita o atributo).
 */
import { computed } from 'vue'
import CheckMarca from '../marca/CheckMarca.vue'

const props = defineProps({
  id: { type: String, required: true },
  rotulo: { type: String, required: true },
  opcoes: { type: Array, required: true }, // ['Sim', 'Não'] ou [{ texto, valor }]
  modelValue: { type: [String, Array], default: null },
  multiplo: { type: Boolean, default: false },
  obrigatorio: { type: Boolean, default: false },
  dica: { type: String, default: '' },
  erro: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const lista = computed(() => props.opcoes.map((o) => (typeof o === 'string' ? { texto: o, valor: o } : o)))
const marcado = (v) => (props.multiplo ? (props.modelValue || []).includes(v) : props.modelValue === v)
const descricao = computed(() => [props.dica && `${props.id}-dica`, props.erro && `${props.id}-erro`].filter(Boolean).join(' ') || undefined)
function trocar(v, ligado) {
  if (!props.multiplo) return emit('update:modelValue', v)
  const atual = props.modelValue || []
  // mantém a ordem das opções (a mensagem sai na ordem da lista, não na do clique)
  emit('update:modelValue', lista.value.map((o) => o.valor).filter((x) => (x === v ? ligado : atual.includes(x))))
}
</script>

<template>
  <fieldset
    :id="id"
    class="campo-form escolha"
    :class="{ 'campo-form--erro': erro, 'escolha--multi': multiplo }"
    :role="multiplo ? undefined : 'radiogroup'"
    :aria-invalid="!multiplo && erro ? 'true' : undefined"
    :aria-required="!multiplo && obrigatorio ? 'true' : undefined"
    :aria-describedby="descricao"
  >
    <legend class="campo-form__rot">{{ rotulo }}<span v-if="obrigatorio" class="campo-form__obr"> obrigatório</span></legend>
    <p v-if="dica" :id="`${id}-dica`" class="legenda campo-form__dica">{{ dica }}</p>
    <div class="escolha__opcoes">
      <label v-for="o in lista" :key="o.valor" class="escolha__chip" :class="{ 'escolha__chip--on': marcado(o.valor) }">
        <input
          class="escolha__input"
          :type="multiplo ? 'checkbox' : 'radio'"
          :name="id"
          :value="o.valor"
          :checked="marcado(o.valor)"
          :aria-invalid="multiplo && erro ? 'true' : undefined"
          :aria-describedby="multiplo ? descricao : undefined"
          @change="trocar(o.valor, $event.target.checked)"
        />
        <CheckMarca v-if="multiplo" class="escolha__check" />
        <span>{{ o.texto }}</span>
      </label>
    </div>
    <p v-if="erro" :id="`${id}-erro`" class="campo-form__erro">{{ erro }}</p>
  </fieldset>
</template>

<style>
.escolha { margin: 0; padding: 0; border: 0; min-width: 0; }
.escolha > legend { float: left; width: 100%; padding: 0; margin: 0; } /* float: vira item do grid (gap do .campo-form) */
.escolha__opcoes { display: flex; flex-wrap: wrap; gap: 8px; }
.escolha__chip {
  position: relative; isolation: isolate; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px;
  border: 1px solid var(--c-borda-controle); border-radius: var(--r-chip); background: var(--c-branco); color: var(--c-petroleo);
  font: 500 15px/1.2 var(--ff-c); cursor: pointer; user-select: none;
  transition: transform var(--dur-press) var(--ease-settle), background-color var(--dur-hover) var(--ease-settle),
    border-color var(--dur-hover) var(--ease-settle), color var(--dur-hover) var(--ease-settle);
}
/* camada de hover (gelo + borda petróleo), como o chip de filtro */
.escolha__chip::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: var(--c-gelo); opacity: 0; transition: opacity var(--dur-hover) var(--ease-settle); }
.campo-form--erro .escolha__chip:not(.escolha__chip--on) { border-color: var(--c-erro); }
@media (hover: hover) and (pointer: fine) {
  .escolha__chip.escolha__chip:not(.escolha__chip--on):hover { border-color: var(--c-petroleo); }
  .escolha__chip:not(.escolha__chip--on):hover::before { opacity: 1; }
}
.escolha__chip:active { transform: scale(.98); }
.escolha__chip--on { background: var(--c-petroleo); border-color: var(--c-petroleo); color: var(--c-branco); }
/* o input fica por cima do chip inteiro, transparente: o toque cai nele e o foco é dele */
.escolha__input { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.escolha__input:focus-visible { outline: none; } /* o anel vai no chip (o input é transparente) */
.escolha__chip:has(.escolha__input:focus-visible) { outline: 3px solid var(--c-petroleo); outline-offset: 3px; }
.escolha__check { display: none; width: 16px; height: 16px; flex: none; }
.escolha__chip--on .escolha__check { display: block; color: var(--c-azul-claro); }
</style>
