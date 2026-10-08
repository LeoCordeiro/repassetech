import { createRouter, createWebHashHistory } from 'vue-router'
import { reduzirAgora } from '@/composables/useReduzirMovimento'
import { ms } from '@/lib/motion'
import { px } from '@/lib/medida'
// A Home entra no chunk de entrada: com o import() dela, o router.isReady() esperava uma ida e volta
// inteira DEPOIS do index.js executar (a rota pedida em 1,91 s, chegando em 3,20 s, no 4G lento). A Loja também (a 2ª porta
// de entrada, pelos links com filtro): o chunk dela tinha 2 KB (os cards e o filtro já vêm com a Home), e a ida e volta custava
// ~0,6 s de LCP no 4G lento (3,7 s → orçamento de 3,5). As outras rotas, sob demanda.
import PaginaInicio from '@/pages/PaginaInicio.vue'
import PaginaLoja from '@/pages/PaginaLoja.vue'
import PaginaConfianca from '@/pages/PaginaConfianca.vue'

// titulo = <title> e anúncio; pagina = o nome que vai no [CONTATO] do botão fixo e no anúncio (a Home é "Início")
const p = (titulo, descricao, extra = {}) => ({ titulo, descricao, ...extra })

export const routes = [
  { path: '/', component: PaginaInicio, meta: p('Repasse de lotes entre lojistas', 'Lote parado de um lado, reposição do outro. A Repasse Tech conecta lojistas com CNPJ e confere nota fiscal e IMEI antes de o lote entrar na loja.', { headerSplit: true, pagina: 'Início' }) },
  { path: '/como-funciona', component: () => import('@/pages/PaginaComoFunciona.vue'), meta: p('Como funciona', 'Quatro passos pra quem vende e pra quem compra lote: cadastro com CNPJ, lote com nota fiscal, conferência e repasse.') },
  // o endereço antigo da loja (link salvo, mensagem antiga) continua valendo: leva à /loja com o filtro que trouxer
  { path: '/vitrine', redirect: (to) => ({ path: '/loja', query: to.query, hash: to.hash }) },
  { path: '/loja', component: PaginaLoja, meta: p('Loja', 'Os tipos de lote que circulam na Repasse Tech, com a condição aceita e o documento que cada um exige. Os lotes reais são mostrados só a empresas cadastradas.') },
  { path: '/quero-vender', component: () => import('@/pages/PaginaQueroVender.vue'), meta: p('Quero vender', 'Monte o lote com nota. Celular e tablet com chip vão com IMEI. A mensagem sai pronta pro WhatsApp da Repasse Tech, que confere antes de o lote entrar na loja.', { semWhatsFixo: true }) },
  { path: '/quero-comprar', component: () => import('@/pages/PaginaQueroComprar.vue'), meta: p('Quero comprar', 'Diga marca, modelo e quantidade: o pedido de reposição sai pronto pro WhatsApp da Repasse Tech.', { semWhatsFixo: true }) },
  { path: '/confianca', component: PaginaConfianca, meta: p('Confiança e conferência', 'Lote sem nota fiscal não entra na loja. Só CNPJ ativo, IMEI verificável e conferência antes de publicar.') },
  { path: '/sobre', component: () => import('@/pages/PaginaSobre.vue'), meta: p('Sobre', 'A Repasse Tech conecta e confere. Não compra, não revende e não estoca mercadoria.') },
  { path: '/contato', component: () => import('@/pages/PaginaContato.vue'), meta: p('Contato', 'Fale com a Repasse Tech pelo WhatsApp.', { semWhatsFixo: true }) }, // o "Chamar no WhatsApp" já está na tela
  { path: '/privacidade', component: () => import('@/pages/PaginaPrivacidade.vue'), meta: p('Política de privacidade', 'Como a Repasse Tech trata dados pessoais, no site e no WhatsApp.') },
  { path: '/termos', component: () => import('@/pages/PaginaTermos.vue'), meta: p('Termos de uso', 'Regras de uso do site e do repasse de lotes da Repasse Tech.') },
  { path: '/politica-de-repasse', component: () => import('@/pages/PaginaPoliticaRepasse.vue'), meta: p('Política de repasse e intermediação', 'Regras do repasse de lotes na Repasse Tech: quem participa, o que pode ser repassado, o que a conferência cobre, fechamento, comissão e reclamação.') },
  // bancada de componentes / style-guide: só no dev. A condição é estática (import.meta.env) para o Rollup cortar o
  // import(): em build nenhum o chunk da bancada é gerado
  ...(import.meta.env.DEV
    ? [{ path: '/_componentes', component: () => import('@/pages/_Componentes.vue'), meta: p('Componentes', 'Bancada de componentes da Repasse Tech.') }]
    : []),
  { path: '/:pathMatch(.*)*', component: () => import('@/pages/PaginaNaoEncontrada.vue'), meta: p('Página não encontrada', 'Este endereço não existe no site da Repasse Tech.') },
]

// A página velha some primeiro (after-leave da Transition em App.vue) e só então rola: o salto acontece na tela vazia.
// Navegação nova dentro da saída (clicar e voltar em menos de --dur-sai): a espera anterior é CANCELADA e não rola mais —
// antes ela ficava só com a rede e rolava para o topo ~600 ms DEPOIS da 2ª.
let saida = null
export function avisarSaida() {
  saida?.fim(true)
  saida = null
}
const esperarSaida = () =>
  new Promise((r) => {
    saida?.fim(false)
    let feito = false
    const rede = setTimeout(() => fim(true), ms('--rede-rota')) // rede: transição que não dispara after-leave não trava a rolagem
    function fim(rolar) {
      if (feito) return
      feito = true
      clearTimeout(rede)
      r(rolar)
    }
    saida = { fim }
  })

/** O alvo da âncora está a até 1,5 tela da posição atual? */
const perto = (hash) => {
  const el = document.getElementById(decodeURIComponent(hash.slice(1)))
  return !!el && Math.abs(el.getBoundingClientRect().top - px('--ancora-topo')) <= 1.5 * window.innerHeight
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, salvo) {
    const mesma = to.path === from.path
    const alvo = () => {
      if (salvo) return { ...salvo, behavior: 'instant' }
      // folga da âncora: um token só (--ancora-topo, tokens.css), o mesmo do scroll-padding-top do html
      // rolagem suave só até 1,5 tela: "Voltar ao sumário" na Privacidade rolava 10,8 telas em 1,47 s a
      // cada clique; acima disso o salto é instantâneo e o foco leva o leitor ao destino
      if (to.hash) return { el: to.hash, top: px('--ancora-topo'), behavior: mesma && !reduzirAgora() && perto(to.hash) ? 'smooth' : 'instant' }
      return { top: 0, behavior: 'instant' }
    }
    if (mesma) return to.hash ? alvo() : false // filtro por query não mexe na rolagem
    if (!from.matched.length) return alvo() // 1ª carga: sem transição de rota
    return esperarSaida().then((rolar) => (rolar ? alvo() : false))
  },
})

router.afterEach((to, from) => {
  const { titulo, descricao } = to.meta
  document.title = to.path === '/' ? `Repasse Tech · ${titulo}` : `${titulo} · Repasse Tech`
  document.querySelector('meta[name="description"]')?.setAttribute('content', descricao || '')
  // âncora na mesma página (atalhos, sumário): o foco vai junto da rolagem (troca de página: o App foca o H1)
  if (to.hash && from.matched.length && to.path === from.path) {
    requestAnimationFrame(() => {
      const alvo = document.getElementById(to.hash.slice(1))
      if (!alvo) return
      if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
      alvo.focus({ preventScroll: true })
    })
  }
})

export default router
