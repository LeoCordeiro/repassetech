<script setup>
/**
 * "Pular para o conteúdo": <button>, não link — no hash router um href="#id" trocaria a rota (e "abrir em nova aba" caía no
 * /). Leva o foco ao H1 da página (todos têm tabindex -1): na Home o header mora dentro do hero, no <main>, e focar o
 * <main> deixava o próximo Tab na logo do header — não pulava nada.
 */
function pular() {
  const alvo = document.querySelector('#conteudo h1') || document.getElementById('conteudo')
  alvo?.focus({ preventScroll: false })
}
</script>

<template>
  <button type="button" class="link-pular" @click="pular">Pular para o conteúdo</button>
</template>
