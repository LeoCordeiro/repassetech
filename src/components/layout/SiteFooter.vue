<script setup>
/**
 * Rodapé petróleo-profundo, SEM costura (não é etapa do lote). Os quatro canais oficiais (WhatsApp, e-mail, Instagram
 * e Reclame Aqui) e os três documentos. Abaixo de 1024, "O site" e "Pra lojista" lado a lado (o rodapé empilhado passava
 * de uma tela no celular). Os links mantêm o alvo de 44 px; link para fora do site abre em outra aba e diz isso.
 * O glifo do WhatsApp fica só no botão de contato: aqui o WhatsApp é texto.
 */
import { computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import LogoMarca from '../marca/LogoMarca.vue'
import { LINKS } from './links'
import { SITE, temBotaoFixo, whatsappPendente } from '@/config/site'
import { formatarWhatsapp, linkContato } from '@/lib/whatsapp'
import { linkInstagram, linkReclameAqui } from '@/lib/canais'

provide('rtTom', 'petroleo')
const ano = new Date().getFullYear()
const route = useRoute()
const comFixo = computed(() => temBotaoFixo(route.meta)) // o botão fixo não pode cobrir o "©" no fim da página
const hrefWhats = computed(() => (whatsappPendente ? undefined : linkContato(route.meta.pagina || route.meta.titulo || '')))
</script>

<template>
  <VFooter class="site-f ctx-petroleo" :class="{ 'site-f--com-fixo': comFixo }" color="petroleo-profundo" tag="footer">
    <div class="wrap site-f__in">
      <div class="site-f__g">
        <div class="site-f__col site-f__marca">
          <LogoMarca variant="invertida" :size="80" />
          <p class="site-f__frase">Conecta e confere. Não compra nem revende.</p>
        </div>
        <nav class="site-f__col" aria-labelledby="f-site">
          <p id="f-site" class="rotulo">O site</p>
          <RouterLink v-for="l in LINKS" :key="l.to" :to="l.to">{{ l.texto }}</RouterLink>
        </nav>
        <nav class="site-f__col" aria-labelledby="f-lojista">
          <p id="f-lojista" class="rotulo">Pra lojista</p>
          <RouterLink to="/quero-vender">Quero vender</RouterLink>
          <RouterLink to="/quero-comprar">Quero comprar</RouterLink>
        </nav>
        <div class="site-f__col site-f__canais">
          <p class="rotulo">Atendimento</p>
          <a v-if="hrefWhats" :href="hrefWhats" target="_blank" rel="noopener">WhatsApp {{ formatarWhatsapp() }}<span class="vh"> (abre em outra aba)</span></a>
          <a v-if="SITE.email" :href="`mailto:${SITE.email}`">{{ SITE.email }}</a>
          <a v-if="linkInstagram" :href="linkInstagram" target="_blank" rel="noopener" class="site-f__ig">
            <VIcon icon="$rtInstagram" :size="18" aria-hidden="true" />
            <span><span class="vh">Instagram </span>@{{ SITE.instagram }}<span class="vh"> (abre em outra aba)</span></span>
          </a>
          <a v-if="linkReclameAqui" :href="linkReclameAqui" target="_blank" rel="noopener">Reclame Aqui<span class="vh"> (abre em outra aba)</span></a>
        </div>
        <div class="site-f__col site-f__empresa">
          <p class="rotulo">Empresa</p>
          <span>{{ SITE.titular }}</span>
          <span class="t-dado">CNPJ {{ SITE.cnpj }}</span>
          <span>{{ SITE.cidade }}/{{ SITE.uf }}</span>
          <RouterLink to="/privacidade">Privacidade</RouterLink>
          <RouterLink to="/termos">Termos de uso</RouterLink>
          <RouterLink to="/politica-de-repasse">Política de repasse</RouterLink>
        </div>
      </div>
      <p class="legenda site-f__fim"><span>Os lotes reais são mostrados só a empresas cadastradas.</span><span>© {{ ano }} Repasse Tech</span></p>
    </div>
  </VFooter>
</template>

<style>
.v-footer.site-f { display: block; padding: 48px 0 32px; color: var(--c-branco) !important; flex: none; }
.v-footer.site-f--com-fixo { padding-bottom: calc(32px + 56px + 16px + env(safe-area-inset-bottom)); } /* 32 + botão + folga */
.site-f__g { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 24px; }
.site-f__g > :is(.site-f__marca, .site-f__canais, .site-f__empresa) { grid-column: 1 / -1; }
.site-f__col { display: grid; justify-items: start; align-content: start; gap: 10px; min-width: 0; font: 400 15px/1.4 var(--ff-c); }
/* link do rodapé com 44 px de alvo: com o header não fixo, o rodapé é a navegação de quem chega ao fim */
nav.site-f__col, .site-f__canais { gap: 0; }
.site-f__col a { display: inline-flex; align-items: center; min-height: 44px; }
.site-f__col a { color: var(--c-branco); text-decoration: none; overflow-wrap: anywhere; }
.site-f__col a[aria-current="page"] { text-decoration: underline; text-underline-offset: 4px; }
@media (hover: hover) and (pointer: fine) { .site-f__col a:hover { text-decoration: underline; text-underline-offset: 4px; } }
.site-f__col .rotulo { margin-bottom: 4px; }
.site-f__ig { gap: 8px; }
.site-f__ig .v-icon { flex: none; color: var(--c-branco); }
.site-f__frase { margin: 8px 0 0; color: var(--text-2); max-width: 30ch; }
.site-f__fim { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px; margin: 40px 0 0; padding-top: 20px; border-top: 1px solid var(--border); }
@media (min-width: 1024px) {
  .site-f__g { grid-template-columns: 1.3fr 1fr 1fr 1.25fr 1.2fr; }
  .site-f__g > :is(.site-f__marca, .site-f__canais, .site-f__empresa) { grid-column: auto; }
}
</style>
