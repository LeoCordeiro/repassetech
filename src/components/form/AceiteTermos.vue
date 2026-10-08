<script setup>
/**
 * Aceite dos Termos de uso: caixa obrigatória no fim do Quero vender e do Quero comprar. Marcada, a mensagem leva
 * "Li e aceito os Termos de uso da Repasse Tech (versão de DD/MM/AAAA)" (LINHA_ACEITE do site.js): é o aceite expresso,
 * com a data da versão, que sustenta a comissão, a não-desintermediação e os limites de responsabilidade.
 * Checkbox nativo (Espaço marca, o leitor de tela fala "caixa de seleção, marcada") com o desenho do site: caixa de 24 px
 * com borda de controle (3:1 no branco), marcada = petróleo com o check da marca. A linha inteira (44 px) é o <label>, com a
 * caixa dentro (o vão de 12 px entre a caixa e o texto também marca). O link dos Termos fica
 * dentro do rótulo e só abre os Termos (conteúdo interativo dentro do label não ativa a caixa).
 * Os Termos abrem em OUTRA aba: o formulário preenchido continua aqui. Erro no padrão do CampoForm (classe campo-form,
 * sem região viva própria: o resumo único é do EnvioForm).
 */
import CheckMarca from '../marca/CheckMarca.vue'

defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  erro: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="campo-form aceite" :class="{ 'campo-form--erro': erro, 'aceite--on': modelValue }">
    <label :for="id" class="aceite__linha">
      <span class="aceite__caixa">
        <input
          :id="id"
          class="aceite__input"
          type="checkbox"
          :checked="modelValue"
          aria-required="true"
          :aria-invalid="erro ? 'true' : undefined"
          :aria-describedby="erro ? `${id}-erro` : undefined"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
        <CheckMarca class="aceite__check" />
      </span>
      <span class="aceite__txt">
        Li e aceito os <RouterLink class="aceite__link" to="/termos" target="_blank" rel="noopener">Termos de uso<span class="vh"> (abre em outra aba)</span></RouterLink>
      </span>
    </label>
    <p v-if="erro" :id="`${id}-erro`" class="campo-form__erro">{{ erro }}</p>
  </div>
</template>

<style>
.aceite__linha { display: flex; align-items: center; gap: 12px; min-height: 44px; cursor: pointer; }
.aceite__caixa { position: relative; display: inline-grid; flex: none; width: 24px; height: 24px; }
.aceite__input {
  grid-area: 1 / 1; width: 24px; height: 24px; margin: 0; appearance: none; -webkit-appearance: none; cursor: pointer;
  border: 2px solid var(--c-borda-controle); border-radius: var(--r-chip); background: var(--c-branco);
  transition: background-color var(--dur-press) var(--ease-settle), border-color var(--dur-press) var(--ease-settle);
}
/* fundo, borda e check na mesma batida de 100 (com fundo e borda em 200, o check aparecia antes deles) */
.aceite__check { grid-area: 1 / 1; width: 18px; height: 18px; place-self: center; color: var(--c-branco); opacity: 0; pointer-events: none; transition: opacity var(--dur-press) var(--ease-settle); }
.aceite--on .aceite__input { background: var(--c-petroleo); border-color: var(--c-petroleo); }
.aceite--on .aceite__check { opacity: 1; }
.campo-form--erro.aceite .aceite__input { border-color: var(--c-erro); }
/* hover na linha inteira (é o alvo); com erro, a borda continua vermelha */
@media (hover: hover) and (pointer: fine) { .aceite:not(.aceite--on):not(.campo-form--erro) .aceite__linha:hover .aceite__input { border-color: var(--c-petroleo); } }
.aceite__txt { padding-block: 10px; font: 500 15px/1.4 var(--ff-c); color: var(--c-petroleo); }
.aceite .campo-form__erro { text-wrap: pretty; }
.aceite__link { color: var(--c-petroleo); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
@media (hover: hover) and (pointer: fine) { .aceite__link:hover { text-decoration-thickness: 2px; } }
</style>
