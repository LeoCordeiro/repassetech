// 1º: endereço com caminho vira a rota do hash antes de o router existir (lib/caminho.js)
import './lib/caminho'
// Fontes auto-hospedadas (subset latin cobre ç, ã, é). Nenhuma requisição ao Google.
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'

import 'vuetify/styles'
import './styles/motion.css'
import './styles/tokens.css'
import './styles/contextos.css'
import './styles/base.css'
import './styles/tipografia.css'
import './styles/vuetify-overrides.css'
import './styles/fontes.css'

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router, { routes } from './router'
import { vReveal } from './composables/useReveal'
import './composables/useReduzirMovimento' // liga a classe .rm ao vivo
import { depoisDaCarga } from './lib/motion'

// O preload das fontes e do logo do header está NO index.html do build (plugin preCarregarNoHtml do vite.config):
// por JS ele só saía depois do index.js executar.

// Monta só com a 1ª rota resolvida (o import() da página já chegou): antes, com route.meta vazio, o app pintava o header de
// página interna e o rodapé no topo, e o hero empurrava tudo ao chegar (CLS 0,96 na Home).
const app = createApp(App).use(vuetify).use(router).directive('reveal', vReveal)
router.isReady().then(() => app.mount('#app'))

// Pré-carrega os chunks das outras páginas fora do caminho crítico: só depois do load (no ocioso eles
// saíam junto com a rota e disputavam a 4G com o que a tela precisava). A Home já vem no chunk de entrada.
depoisDaCarga(() => routes.forEach((r) => typeof r.component === 'function' && r.component().catch(() => {})), '--ocioso-paginas')
