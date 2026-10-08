<script setup>
/**
 * Shell: header, menu, botão fixo e rodapé ficam FORA da transição de rota (não piscam).
 * Rota: out-in, chave = route.path (query/âncora não troca página), sem appear (a Home tem o hero).
 * Home com a abertura do hero ainda por ver: a rota sai com fade e entra SECA ("rota-hero"): o hero já é a entrada, e as
 * duas juntas eram o fade duplo.
 * after-leave libera a rolagem (router.scrollBehavior); after-enter foca o H1 e anuncia a página.
 * Os dois formulários ficam vivos (KeepAlive) quando a pessoa sai deles pelo site: o Voltar do navegador devolve o que ela
 * já tinha preenchido.
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { avisarSaida } from '@/router'
import { ms } from '@/lib/motion'
import { CHAVE_HERO, jaFoi } from '@/lib/visita'
import { reduzirAgora } from '@/composables/useReduzirMovimento'
import AvisoPendencias from '@/components/layout/AvisoPendencias.vue'
import BotaoWhatsappFixo from '@/components/layout/BotaoWhatsappFixo.vue'
import LinkPular from '@/components/layout/LinkPular.vue'
import MenuCelular from '@/components/layout/MenuCelular.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'

const VIVAS = ['PaginaQueroVender', 'PaginaQueroComprar'] // KeepAlive casa pelo nome do arquivo do componente
const route = useRoute()
const anuncio = ref('')
const heroVaiAbrir = computed(() => route.path === '/' && !jaFoi(CHAVE_HERO, true) && !reduzirAgora())

function aoEntrar() {
  document.querySelector('#conteudo h1')?.focus({ preventScroll: true })
  anuncio.value = `Página: ${route.meta.pagina || route.meta.titulo}`
}
</script>

<template>
  <VApp>
    <LinkPular />
    <AvisoPendencias />
    <SiteHeader v-if="!route.meta.headerSplit" />
    <MenuCelular />
    <VMain id="conteudo" tabindex="-1">
      <RouterView v-slot="{ Component, route: r }">
        <Transition
          :name="heroVaiAbrir ? 'rota-hero' : 'rota'"
          mode="out-in"
          :duration="{ enter: heroVaiAbrir ? 0 : ms('--dur-rota-entra'), leave: ms('--dur-sai') }"
          @after-leave="avisarSaida"
          @after-enter="aoEntrar"
        >
          <KeepAlive :include="VIVAS">
            <component :is="Component" :key="r.path" />
          </KeepAlive>
        </Transition>
      </RouterView>
      <div id="fim-conteudo" aria-hidden="true" />
    </VMain>
    <SiteFooter />
    <BotaoWhatsappFixo />
    <p class="vh" aria-live="polite">{{ anuncio }}</p>
  </VApp>
</template>

<style>
#conteudo:focus { outline: none; }
#fim-conteudo { height: 0; } /* 1 px deixava ver o branco da .v-application entre o último bloco e o rodapé */
</style>
