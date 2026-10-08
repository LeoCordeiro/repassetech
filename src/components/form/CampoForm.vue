<script setup>
/**
 * Wrapper de campo: <label for> ACIMA do input do Vuetify (sem rótulo flutuante do Material).
 * Obrigatório é dito por texto, não só asterisco. O input do slot precisa receber o mesmo `id`.
 * O erro mora aqui, não no VMessages do Vuetify: cada `.v-input__details` do Vuetify é uma região viva própria e enviar
 * vazio enfileirava um anúncio por campo. O input liga `aria-describedby` em `${id}-dica` / `${id}-erro` (descricao()).
 */
defineProps({
  id: { type: String, required: true },
  rotulo: { type: String, required: true },
  obrigatorio: { type: Boolean, default: false },
  dica: { type: String, default: '' },
  erro: { type: String, default: '' },
})
</script>

<template>
  <div class="campo-form" :class="{ 'campo-form--erro': erro }">
    <!-- id do label: o VTextField aponta aria-labelledby para `${id}-label` -->
    <label :id="`${id}-label`" class="campo-form__rot" :for="id">
      {{ rotulo }}<span v-if="obrigatorio" class="campo-form__obr"> obrigatório</span>
    </label>
    <p v-if="dica" :id="`${id}-dica`" class="legenda campo-form__dica">{{ dica }}</p>
    <slot />
    <p v-if="erro" :id="`${id}-erro`" class="campo-form__erro">{{ erro }}</p>
  </div>
</template>

<style>
/* align-content: start — esticado pela linha do par (vizinho com erro de 2 linhas), o grid repartia a sobra entre as
   faixas e o campo descia em relação ao do lado */
.campo-form { display: grid; gap: 6px; min-width: 0; align-content: start; }
.campo-form__rot { font: 500 15px/1.3 var(--ff-t); color: var(--c-petroleo); }
.campo-form__obr { font: 400 13px/1 var(--ff-c); color: var(--c-cinza-petroleo); }
.campo-form__dica { margin: 0; }
/* erro: cor --c-erro, ícone de alerta pela máscara; entra com opacity + 4 px, sem shake */
.campo-form__erro {
  display: flex; gap: 6px; align-items: flex-start; margin: 0; color: var(--c-erro); font: 500 14px/1.4 var(--ff-c);
  animation: rt-erro-entra var(--dur-hover) var(--ease-settle) backwards;
}
.campo-form__erro::before {
  content: ""; flex: none; width: 16px; height: 16px; margin-top: 2px; background: currentColor;
  -webkit-mask: var(--icone-alerta) center / contain no-repeat; mask: var(--icone-alerta) center / contain no-repeat;
}
@keyframes rt-erro-entra { from { opacity: 0; transform: translateY(-4px); } }
</style>
