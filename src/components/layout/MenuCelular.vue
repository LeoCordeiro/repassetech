<script setup>
/**
 * Menu (celular e, no desktop, onde a navegação não cabe na linha do header): VNavigationDrawer temporary vindo do topo.
 * 5 links + os dois CTAs. Fecha ao navegar, com Esc e quando o botão Menu some (janela alargou); o foco volta ao Menu.
 * Aberto, o resto da página fica `inert` (o Tab não sai do menu). Links simples, um Tab cada (o VList prendia o Tab e
 * navegava por setas). Fechado não pode inflar a largura rolável.
 */
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BtnContorno from '../marca/BtnContorno.vue'
import BtnSeta from '../marca/BtnSeta.vue'
import LogoMarca from '../marca/LogoMarca.vue'
import { LINKS } from './links'
import { ui } from '@/lib/ui'

const FORA = ['.link-pular', '.aviso-pend', 'header.site-h', '#conteudo', 'footer.site-f', '.rt-whats-fixo']
const route = useRoute()
const botaoVisivel = () => document.querySelector('[data-menu-btn]')?.offsetParent != null
const fechar = async (devolverFoco = true) => {
  ui.menuAberto = false
  if (!devolverFoco) return
  await nextTick()
  document.querySelector('[data-menu-btn]')?.focus()
}
const aoTeclar = (e) => e.key === 'Escape' && ui.menuAberto && (e.stopPropagation(), fechar())
const aoRedimensionar = () => ui.menuAberto && !botaoVisivel() && fechar(false)
const inerte = (liga) => FORA.forEach((s) => document.querySelectorAll(s).forEach((el) => el.toggleAttribute('inert', liga)))
watch(() => route.fullPath, () => ui.menuAberto && fechar(false))
watch(
  () => ui.menuAberto,
  async (aberto) => {
    inerte(aberto) // pre-flush: sai do inert antes do foco voltar ao botão Menu (que mora no header)
    if (aberto) {
      document.addEventListener('keydown', aoTeclar)
      await nextTick()
      document.querySelector('#menu-celular a')?.focus()
    } else document.removeEventListener('keydown', aoTeclar)
  },
)
onMounted(() => window.addEventListener('resize', aoRedimensionar, { passive: true }))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', aoTeclar)
  window.removeEventListener('resize', aoRedimensionar)
  inerte(false)
})
</script>

<template>
  <VNavigationDrawer
    id="menu-celular"
    v-model="ui.menuAberto"
    class="menu-celular ctx-claro"
    tag="div"
    location="top"
    temporary
    :width="520"
    role="dialog"
    aria-modal="true"
    aria-label="Menu"
  >
    <div class="menu-celular__topo wrap">
      <RouterLink to="/" class="menu-celular__logo" aria-label="Repasse Tech — início"><LogoMarca variant="normal" :size="80" alt="" /></RouterLink>
      <button class="menu-btn menu-celular__fechar" type="button" @click="fechar()">Fechar</button>
    </div>
    <nav class="menu-celular__nav wrap" aria-label="Principal">
      <RouterLink v-for="l in LINKS" :key="l.to" :to="l.to">{{ l.texto }}</RouterLink>
    </nav>
    <div class="menu-celular__ctas wrap">
      <BtnSeta to="/quero-vender" block-celular>Quero vender meu lote</BtnSeta>
      <BtnContorno to="/quero-comprar" block-celular>Quero comprar lotes</BtnContorno>
    </div>
  </VNavigationDrawer>
</template>

<style>
.v-navigation-drawer.menu-celular { background: var(--c-branco) !important; color: var(--c-petroleo); border: 0; box-shadow: var(--s2); max-height: 100dvh; overflow-y: auto; }
.menu-celular__topo { display: flex; align-items: center; justify-content: space-between; min-height: var(--header-h); border-bottom: 1px solid var(--c-fio); }
.menu-celular .menu-btn { display: inline-flex; }
.menu-celular__nav { display: grid; }
/* o link ocupa a caixa inteira do .wrap (linha de ponta a ponta, como o fio do topo); o texto fica na calha */
.menu-celular__nav a {
  display: flex; align-items: center; min-height: 52px; margin-inline: calc(-1 * var(--wrap-pad)); padding-inline: var(--wrap-pad); border-bottom: 1px solid var(--c-fio);
  font: 500 15px/1.2 var(--ff-t); color: var(--c-petroleo); text-decoration: none;
}
.menu-celular__nav a[aria-current="page"] { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; }
@media (hover: hover) and (pointer: fine) { .menu-celular__nav a:hover { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; } }
.menu-celular__ctas { display: grid; gap: 16px; padding-block: 24px; }
/* a logo do menu acompanha a do header que ele cobre: 72 (320–359), 80 (360–1023) e 72 a partir de 1024 */
.menu-celular__logo { display: block; --logo-h: 72px; }
@media (min-width: 360px) and (max-width: 1023px) { .menu-celular__logo { --logo-h: 80px; } }
@media (min-width: 640px) { .menu-celular__ctas { display: flex; flex-wrap: wrap; align-items: center; } }
.v-navigation-drawer.menu-celular:not(.v-navigation-drawer--active) { box-shadow: none; }
</style>
