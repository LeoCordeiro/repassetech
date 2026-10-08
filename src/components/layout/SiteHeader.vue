<script setup>
/**
 * Header. VToolbar, NÃO VAppBar: não é fixo e não entra no layout do VMain.
 * split (só Home): o header mora dentro do hero; logo e links na metade clara, CTA na metade petróleo (--focus branco).
 * Páginas internas a partir de 1024: os dois caminhos — "Quero comprar" em contorno compacto e "Quero vender meu lote"
 * no BtnSeta (laranja só no principal).
 * A navegação só fica na linha onde cabe sem tocar o eixo/os botões (medido): split a partir de 1400 e interna
 * a partir de 1200. Abaixo disso o botão Menu abre o MenuCelular (estado em ui.menuAberto).
 * Logo: lockup 72 de 320 a 359, 80 de 360 a 1023 (o do rodapé) e 72 a partir de 1024, num
 * header de 88 em toda largura. Só arquivo oficial, só tamanho: o "TECH" fica com 6,67 / 7,41 px de caixa alta (com 56 era
 * 5,19). A 320 sobram 22 px até o botão Menu; de 360 em diante, 44.
 * Páginas de formulário (≥ 1024): o header mostra só o OUTRO caminho (o CTA da própria página levava
 * para onde a pessoa já está e era o único laranja da 1ª tela).
 */
import BtnContorno from '../marca/BtnContorno.vue'
import BtnSeta from '../marca/BtnSeta.vue'
import LogoMarca from '../marca/LogoMarca.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LINKS } from './links'
import { ui } from '@/lib/ui'
import { px } from '@/lib/medida'

defineProps({ split: { type: Boolean, default: false } })
const route = useRoute()
const naVenda = computed(() => route.path === '/quero-vender')
const naCompra = computed(() => route.path === '/quero-comprar')
</script>

<template>
  <VToolbar class="site-h" :class="{ 'site-h--split': split }" tag="header" :height="px('--header-h')">
    <div class="site-h__in" :class="split ? 'site-h__in--hero' : 'wrap'">
      <div class="site-h-a">
        <RouterLink to="/" class="site-h__logo" aria-label="Repasse Tech — início">
          <LogoMarca variant="normal" :size="80" alt="" />
        </RouterLink>
        <nav class="nav-d" aria-label="Principal">
          <RouterLink v-for="l in LINKS" :key="l.to" :to="l.to">{{ l.texto }}</RouterLink>
        </nav>
      </div>
      <div class="site-h-b">
        <BtnContorno v-if="!split && !naCompra" class="h-cta-b" tom="claro" to="/quero-comprar" compacto>Quero comprar</BtnContorno>
        <BtnSeta v-if="!naVenda" class="h-cta" to="/quero-vender" :tom="split ? 'petroleo' : 'auto'">Quero vender meu lote</BtnSeta>
        <button
          class="menu-btn"
          type="button"
          data-menu-btn
          :aria-expanded="String(ui.menuAberto)"
          aria-controls="menu-celular"
          @click="ui.menuAberto = !ui.menuAberto"
        >
          <i aria-hidden="true"><b /></i>Menu
        </button>
      </div>
    </div>
  </VToolbar>
</template>

<style>
.v-toolbar.site-h { position: relative; z-index: 4; background: var(--c-branco) !important; color: var(--c-petroleo); border-bottom: 1px solid var(--c-fio); overflow: visible; }
.v-toolbar.site-h--split { background: transparent !important; border-bottom: 0; }
.site-h .v-toolbar__content { padding: 0; height: auto !important; min-height: var(--header-h); overflow: visible; }
.site-h__in { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; min-height: var(--header-h); }
.site-h__in--hero { padding-inline: var(--wrap-pad); }
.site-h-a { display: flex; align-items: center; gap: 32px; min-width: 0; }
.site-h-b { display: flex; align-items: center; justify-content: flex-end; gap: 12px; --focus: var(--c-petroleo); }
.site-h__logo, .menu-celular__topo a { text-decoration: none; }
.site-h__logo { display: block; --logo-h: 72px; --focus: var(--c-petroleo); --slot-borda: var(--c-borda-controle); --text-2: var(--c-cinza-petroleo); }
@media (min-width: 360px) and (max-width: 1023px) { .site-h__logo { --logo-h: 80px; } }
.nav-d { display: none; gap: 28px; }
/* alvo de 44 px (o mínimo de toque do site) sem mudar a linha: o texto continua com 15 px de altura, centrado na caixa */
.nav-d a { display: inline-flex; align-items: center; min-height: 44px; font: 500 15px/1 var(--ff-t); text-decoration: none; color: var(--c-petroleo); white-space: nowrap; }
.nav-d a[aria-current="page"] { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; }
@media (hover: hover) and (pointer: fine) { .nav-d a:hover { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; } }
.h-cta.v-btn, .h-cta-b.v-btn { display: none; }
.menu-btn {
  display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; border: 2px solid var(--c-petroleo);
  background: var(--c-branco); color: var(--c-petroleo); font: 600 15px/1 var(--ff-t); cursor: pointer;
}
.menu-btn i { display: grid; gap: 4px; width: 18px; }
.menu-btn i::before, .menu-btn i::after, .menu-btn i b { content: ""; display: block; height: 2px; background: currentColor; }
@media (min-width: 1024px) {
  .site-h__logo { --logo-h: 72px; }
  .site-h__in--hero { padding-inline: max(24px, calc((100vw - var(--hero-max)) / 2)); }
  .site-h--split .site-h-a, .site-h--split .site-h-b { flex: 1; }
  .site-h--split .site-h-b { --focus: var(--c-branco); }
  .h-cta.v-btn, .h-cta-b.v-btn { display: inline-flex; }
}
/* navegação na linha só onde cabe: interna (logo + nav + os dois botões) e split (logo + nav na metade clara) */
@media (min-width: 1200px) {
  .site-h:not(.site-h--split) .nav-d { display: flex; }
  .site-h:not(.site-h--split) .menu-btn { display: none; }
}
@media (min-width: 1400px) {
  .site-h--split .nav-d { display: flex; }
  .site-h--split .menu-btn { display: none; }
}
</style>
