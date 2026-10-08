<script setup>
/**
 * Filtro do catálogo sem resultado. lote-vazio toca 1x a cada vez que o vazio aparece (é resposta a uma ação).
 * "Pedir um lote assim" leva ao Quero comprar em "Conte o que você procura" (?alerta=1). O serviço de alerta automático
 * NÃO existe: nada aqui promete aviso nem retorno automático.
 * Abaixo de 640: Lottie de 64 ao lado do título, texto curto, "Pedir um lote assim" em largura total logo
 * abaixo e "Limpar filtros" como link — a saída cabe na 1ª tela a 375×812 com o filtro vindo da URL.
 * A partir de 640: o Lottie fica dentro da moldura do card de lote sem lote (o
 * mesmo celular da loja, vazio), em vez do "ícone de caixa + texto" de empty state genérico. No celular, o compacto.
 * A entrada (depois da saída dos cards) é da GradeCatalogo (<Transition name="rt-vazio">): aqui não há transição.
 */
import { useDisplay } from 'vuetify'
import BrandLottie from '../marca/BrandLottie.vue'
import BtnContorno from '../marca/BtnContorno.vue'

defineProps({
  alertaTo: { type: [String, Object], default: () => ({ path: '/quero-comprar', query: { alerta: '1' } }) },
  nivel: { type: Number, default: 3 },
})
defineEmits(['limpar'])
const { smAndUp } = useDisplay()
</script>

<template>
  <div class="estado-vazio">
    <div class="estado-vazio__cab">
      <span class="estado-vazio__tela">
        <span class="estado-vazio__falante" aria-hidden="true" />
        <span class="estado-vazio__vidro"><BrandLottie name="lote-vazio" trigger="viewport" :loop="false" :size="smAndUp ? 96 : 64" /></span>
      </span>
      <component :is="`h${nivel}`" class="h3">Nenhuma categoria com esse filtro.</component>
    </div>
    <p class="estado-vazio__txt">Conte o que você procura. A Repasse Tech responde pelo WhatsApp.</p>
    <div class="estado-vazio__acoes">
      <BtnContorno :to="alertaTo" block-celular>Pedir um lote assim</BtnContorno>
      <button type="button" class="estado-vazio__limpar" @click="$emit('limpar')">Limpar filtros</button>
    </div>
  </div>
</template>

<style>
.estado-vazio { display: grid; justify-items: center; gap: 12px; padding: 32px 16px; text-align: center; color: var(--text); }
.estado-vazio__cab { display: grid; justify-items: center; gap: 12px; }
.estado-vazio__tela, .estado-vazio__vidro { display: inline-flex; }
.estado-vazio__falante { display: none; }
@media (min-width: 640px) {
  /* a moldura do card do catálogo (--motivo, raio 22, falante azul-claro) com a tela branca vazia (raio 14) */
  .estado-vazio__tela { position: relative; flex-direction: column; padding: 18px 6px 6px; border-radius: var(--r-card); background: var(--motivo); box-shadow: var(--sombra-card); }
  .estado-vazio__falante { display: block; position: absolute; top: 7px; left: 50%; width: 28px; height: 4px; margin-left: -14px; border-radius: 2px; background: var(--c-azul-claro); }
  .estado-vazio__vidro { justify-content: center; align-items: center; width: 120px; height: 136px; border-radius: var(--r-tela); background: var(--c-branco); }
}
.estado-vazio__txt { margin: 0; max-width: 46ch; color: var(--text-2); }
.estado-vazio__acoes { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px 24px; margin-top: 8px; }
/* "Limpar filtros" é link (ação menor), com alvo de 44 px */
.estado-vazio__limpar {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer;
  color: var(--text); font: 600 16px/1.3 var(--ff-t); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 5px;
}
@media (hover: hover) and (pointer: fine) { .estado-vazio__limpar:hover { text-decoration-thickness: 2px; } }
@media (max-width: 639px) {
  .estado-vazio { justify-items: stretch; gap: 8px; padding: 8px 0 0; text-align: left; }
  .estado-vazio__cab { grid-template-columns: 64px minmax(0, 1fr); align-items: center; justify-items: start; }
  .estado-vazio__acoes { flex-direction: column; align-items: stretch; gap: 4px; margin-top: 4px; }
  .estado-vazio__limpar { align-self: center; }
}
</style>
