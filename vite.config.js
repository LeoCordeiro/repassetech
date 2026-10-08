import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { PALETA } from './src/styles/paleta.js'
import { ESTADOS_LOTE } from './src/data/costuras.js'
import { SITE } from './src/config/site.js'
import { IMEI } from './src/data/conferencia-imei.js'
import { CATEGORIAS, SIZES_CARD } from './src/data/catalogo.js'
import { formatarWhatsapp } from './src/lib/whatsapp.js'
import { numeroOficial } from './scripts/lib/env-producao.mjs'
import { conferirVersaoDocs, hashDocs } from './scripts/lib/versao-docs.mjs'
import { cspDoHeaders, hashesInline, regrasRedirects, servirArquivo } from './scripts/lib/cabecalhos.mjs'

const raiz = fileURLToPath(new URL('.', import.meta.url))
const SITE_JS = join(raiz, 'src/config/site.js')
/** Endereço do site quando nada é configurado (o og:image sai absoluto com ele). */
export const DOMINIO_PADRAO = 'https://repassetech.com.br'

/** Todos os .vue/.js de src/ (sem node_modules; src é pequeno). */
function arquivosFonte(pasta = join(raiz, 'src')) {
  return readdirSync(pasta).flatMap((n) => {
    const p = join(pasta, n)
    if (statSync(p).isDirectory()) return arquivosFonte(p)
    return /\.(vue|js)$/.test(n) ? [p] : []
  })
}

/**
 * Endereço público do site: VITE_SITE_URL, se existir; senão URL (a Netlify põe no build o endereço principal do site);
 * senão o domínio padrão. Devolve { url, origem } — a origem entra na mensagem da guarda.
 */
export function enderecoDoSite(env = {}) {
  if (env.VITE_SITE_URL) return { url: env.VITE_SITE_URL, origem: 'VITE_SITE_URL' }
  if (env.URL) return { url: env.URL, origem: 'URL (Netlify)' }
  return { url: DOMINIO_PADRAO, origem: 'padrão' }
}

/**
 * O que falta para o build de produção sair. Exportada para a guarda poder ser testada fora do build.
 *  - número de WhatsApp; o do ambiente não pode divergir do oficial versionado em .env.production, lido pelo MESMO parser do
 *    Vite — e linha do número que o Vite não entende reprova (falha fechado);
 *  - endereço do site (VITE_SITE_URL › URL da Netlify › padrão) em https://domínio, sem barra no fim: o og:image sai com ele;
 *  - logo em brand/; e-mail fora do formato;
 *  - SITE.vigenciaDocs (AAAA-MM-DD) e o hash do texto registrado para a versão em SITE.versoesDocs (mudou o texto sem
 *    trocar a versão, o build falha);
 *  - SITE.conferenciaImei ('todos' ou 'amostra');
 *  - qualquer marcador literal de pendência (colchete + PREENCHER) em src/ fora do site.js (marcador visível na página).
 *    Marcador de pendência que já tem guarda própria usa marcaPendente() do site.js e não conta aqui.
 */
export function listarPendencias(env) {
  const falta = []
  if (!/^55\d{10,11}$/.test(env.VITE_WHATSAPP_NUMBER || '')) falta.push('VITE_WHATSAPP_NUMBER ausente ou fora de ^55\\d{10,11}$')
  const oficial = numeroOficial(raiz)
  if (oficial.erro) falta.push(oficial.erro)
  if (oficial.numero && env.VITE_WHATSAPP_NUMBER !== oficial.numero) falta.push(`VITE_WHATSAPP_NUMBER do ambiente difere do .env.production (número oficial versionado)`)
  const site = enderecoDoSite(env)
  if (!/^https:\/\/[^/\s]+$/.test(site.url))
    falta.push(`endereço do site fora de https://domínio (sem barra no fim), vindo de ${site.origem}: "${site.url}" — o og:image sai com ele e a prévia do link no WhatsApp depende disso`)
  if (env.VITE_EMAIL_CONTATO && !/^[^\s@<>"'()]+@[^\s@<>"'()]+\.[a-z]{2,}$/i.test(env.VITE_EMAIL_CONTATO)) falta.push('VITE_EMAIL_CONTATO fora do formato de e-mail (vira mailto: no rodapé e no Contato)')
  if (!['svg', 'png'].some((ext) => existsSync(`${raiz}brand/logo.${ext}`))) falta.push('brand/logo.(svg|png) ausente')
  const vigencia = SITE.vigenciaDocs
  if (/^__PREENCHER/.test(vigencia)) falta.push('SITE.vigenciaDocs ainda é sentinela (src/config/site.js)')
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(vigencia) || Number.isNaN(Date.parse(`${vigencia}T12:00:00Z`)) || new Date(`${vigencia}T12:00:00Z`).toISOString().slice(0, 10) !== vigencia)
    falta.push(`SITE.vigenciaDocs "${vigencia}" fora de AAAA-MM-DD (é a versão citada no aceite dos Termos)`)
  const versao = conferirVersaoDocs({ vigencia, versoes: SITE.versoesDocs, hash: hashDocs(raiz, { termosImei: IMEI.termos, site: SITE }) })
  if (versao) falta.push(versao)
  if (!['todos', 'amostra'].includes(SITE.conferenciaImei))
    falta.push(`SITE.conferenciaImei é ${JSON.stringify(SITE.conferenciaImei)}: falta dizer se o IMEI é conferido um por um ('todos') ou por amostra ('amostra') — o selo, o hero, os passos, o catálogo e os Termos dependem disso`)
  const marcadores = []
  for (const f of arquivosFonte()) {
    if (f === SITE_JS) continue
    readFileSync(f, 'utf8').split('\n').forEach((linha, i) => {
      if (/\[PREENCHER|__PREENCHER/.test(linha)) marcadores.push(`${relative(raiz, f).replace(/\\/g, '/')}:${i + 1}`)
    })
  }
  if (marcadores.length) falta.push(`[PREENCHER] visível na página (${marcadores.length}): ${marcadores.join(', ')}`)
  return falta
}

/** Rótulos de costura fora da lista de estados do lote (src/data/costuras.js): ["arquivo:linha "rótulo""]. */
export function costurasForaDaLista() {
  const fora = []
  for (const f of arquivosFonte()) {
    if (!f.endsWith('.vue')) continue
    readFileSync(f, 'utf8').split('\n').forEach((linha, i) => {
      for (const [, ligado, valor] of linha.matchAll(/(:?)costura="([^"]*)"/g)) {
        const rotulos = ligado ? [...valor.matchAll(/'([^']*)'/g)].map((x) => x[1]) : [valor]
        for (const r of rotulos) if (!ESTADOS_LOTE.includes(r)) fora.push(`${relative(raiz, f).replace(/\\/g, '/')}:${i + 1} "${r}"`)
      }
    })
  }
  return fora
}

/** Costura sem estado do lote não compila (vale também para homologação: é erro de código, não dado pendente). */
const conferirCosturas = () => ({
  name: 'conferir-costuras',
  apply: 'build',
  buildStart() {
    const fora = costurasForaDaLista()
    if (fora.length) this.error(`Costura com rótulo que não é estado do lote (src/data/costuras.js): ${fora.join(', ')}`)
  },
})

/**
 * Antes de escrever o dist (generateBundle, depois do HTML pronto): o <script> inline do index.html só roda com o hash dele
 * DENTRO do valor da CSP do bloco "/*" do public/_headers (mede igual ao navegador, CRLF → LF), e o _headers e o
 * _redirects (a regra "/* /index.html 200" que faz o endereço com caminho abrir o site) têm de existir. Roda só sobre um
 * build que deu certo: numa falha anterior o Rollup nem chega aqui, e o erro original aparece inteiro.
 */
function conferirPublicacao() {
  let publico = ''
  return {
    name: 'conferir-publicacao',
    apply: 'build',
    configResolved(c) {
      publico = c.publicDir
    },
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const arqHeaders = join(publico, '_headers')
        if (!existsSync(arqHeaders)) this.error('public/_headers ausente: o site iria ao ar sem CSP/COOP')
        const html = bundle['index.html']?.source
        if (typeof html !== 'string') this.error('index.html não está no bundle')
        const csp = cspDoHeaders(readFileSync(arqHeaders, 'utf8'))
        const faltam = hashesInline(html).filter((h) => !csp.includes(h))
        if (faltam.length) this.error(`CSP do public/_headers sem o hash do script inline: ${faltam.join(' ')}`)
        const arqRedirects = join(publico, '_redirects')
        const spa = existsSync(arqRedirects) && regrasRedirects(readFileSync(arqRedirects, 'utf8')).some((r) => r.de === '/*' && r.para === '/index.html' && r.status === 200)
        if (!spa) this.error('public/_redirects sem a regra "/*  /index.html  200": endereço com caminho (domínio/quero-vender) abriria uma página em branco')
      },
    },
  }
}

/**
 * vite preview como a Netlify serve: o arquivo que existe ou a regra do public/_redirects, os cabeçalhos do public/_headers
 * por caminho (CSP e companhia no "/*", o cache longo no "/assets/*", no-cache no index.html), brotli para texto e
 * ETag/304. CSP, LCP e CLS medidos aqui valem para o que vai ao ar.
 */
const servirComoNetlify = () => ({
  name: 'servir-como-netlify',
  configurePreviewServer(server) {
    const dist = resolve(server.config.root, server.config.build.outDir)
    const ler = (n) => (existsSync(join(dist, n)) ? readFileSync(join(dist, n), 'utf8') : '')
    const regras = { headers: ler('_headers'), redirects: ler('_redirects') }
    server.middlewares.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next()
      servirArquivo(dist, regras, req, res)
    })
  },
})

/**
 * Pré-carga no index.html do build: a Poppins 700 (o H1 do hero, elemento LCP da Home) e a Inter 400 (o lead) com
 * crossorigin, e o logo do header (o LCP da Loja no celular, que só era descoberto na montagem). O nome com hash vem do
 * bundle. ≥ 1024 (rede de mesa) os outros 4 pesos também: toda página usa os 6, então é só descobrir antes — sem isso a
 * Inter 500 chegava depois da 1ª pintura e um chip do Quero vender pulava de linha; no celular eles disputariam a banda com
 * o index.js. Preload não é script: a CSP (hash do inline) não muda.
 * O transformIndexHtml roda sem contexto de plugin: erro aqui é throw, nunca this.error.
 */
const preCarregarNoHtml = () => {
  let base = '/'
  return {
    name: 'pre-carregar-no-html',
    apply: 'build',
    configResolved(c) {
      base = c.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html
        const achar = (nome) => Object.values(bundle).find((a) => a.type === 'asset' && (a.names || [a.name]).includes(nome))?.fileName
        const fontes = ['poppins-latin-700-normal.woff2', 'inter-latin-400-normal.woff2'].map(achar)
        const largas = ['poppins-latin-500-normal.woff2', 'poppins-latin-600-normal.woff2', 'inter-latin-500-normal.woff2', 'inter-latin-600-normal.woff2'].map(achar)
        const logo = achar('logo.svg')
        // a foto da 1ª categoria do catálogo é o LCP da Loja no celular (a 1ª dobra é título, filtros e ela): o endereço vai
        // num <meta>, e o script do <head> (index.html) só a pede quando a pessoa CHEGA na Loja abaixo de 640 — com o
        // mesmo srcset/sizes do <img> (o navegador escolhe a mesma largura e não baixa duas vezes); nas outras rotas, nada
        const foto = [480, 800, 1200].map((w) => [w, achar(`${CATEGORIAS[0].foto}-${w}.webp`)])
        if ([...fontes, ...largas].some((x) => !x) || !logo || foto.some(([, x]) => !x)) throw new Error(`pré-carga: faltou no bundle ${JSON.stringify({ fontes, largas, logo, foto })}`)
        const links = [
          ...fontes.map((x) => `<link rel="preload" as="font" type="font/woff2" href="${base}${x}" crossorigin>`),
          `<link rel="preload" as="image" type="image/svg+xml" href="${base}${logo}" fetchpriority="high">`,
          ...largas.map((x) => `<link rel="preload" as="font" type="font/woff2" href="${base}${x}" crossorigin media="(min-width: 1024px)">`),
          `<meta name="rt-foto-loja" content="${foto.map(([w, x]) => `${base}${x} ${w}w`).join(', ')}" data-sizes="${SIZES_CARD}">`,
        ]
        return html.replace('</title>', ['</title>', ...links].join('\n    '))
      },
    },
  }
}

/** O mesmo ambiente para a guarda e para o HTML: .env* pelo loadEnv do Vite + o processo (que vence). */
let ENV = {}
let COMANDO = 'serve'
const ambiente = () => ({
  name: 'ambiente',
  enforce: 'pre',
  config(_, { mode, command }) {
    ENV = { ...loadEnv(mode, raiz, 'VITE_'), ...process.env }
    COMANDO = command
  },
})

/**
 * Build falha se faltar dado oficial (listarPendencias).
 * VITE_PERMITIR_PENDENCIAS=1 transforma o erro em aviso (build de homologação) e liga o AvisoPendencias.
 */
const verificarPendencias = () => ({
  name: 'verificar-pendencias',
  apply: 'build',
  buildStart() {
    const falta = listarPendencias(ENV)
    if (!falta.length) return
    const msg = `Pendências:\n - ${falta.join('\n - ')}`
    if (ENV.VITE_PERMITIR_PENDENCIAS === '1') this.warn(`${msg}\n(VITE_PERMITIR_PENDENCIAS=1: build de homologação, AvisoPendencias visível)`)
    else this.error(`${msg}\nPara homologação: VITE_PERMITIR_PENDENCIAS=1 npm run build`)
  },
})

const html = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
/** Sem JavaScript: o essencial (o que é, que o site precisa de JS, e como falar com a Repasse Tech) em vez da página branca. */
function semJavascript() {
  const numero = /^55\d{10,11}$/.test(ENV.VITE_WHATSAPP_NUMBER || '') ? ENV.VITE_WHATSAPP_NUMBER : ''
  const email = ENV.VITE_EMAIL_CONTATO || ''
  const canais = [
    numero && `<li>WhatsApp: <a href="https://wa.me/${numero}">${html(formatarWhatsapp(numero))}</a></li>`,
    email && `<li>E-mail: <a href="mailto:${html(email)}">${html(email)}</a></li>`,
    SITE.instagram && `<li>Instagram: <a href="https://www.instagram.com/${html(SITE.instagram)}/">@${html(SITE.instagram)}</a></li>`,
  ].filter(Boolean)
  return `<noscript>
      <div style="max-width:36rem;margin:2.5rem auto;padding:0 1rem;font:16px/1.6 system-ui,sans-serif;color:${PALETA.petroleo}">
        <p style="margin:0 0 .5rem;font-size:1.25rem;font-weight:700">Repasse Tech</p>
        <p style="margin:0 0 1rem">Repasse de lotes de celulares e eletrônicos entre lojistas com CNPJ. A Repasse Tech confere a nota fiscal e o IMEI antes de o lote ir para a loja.</p>
        <p style="margin:0 0 .5rem">Este site precisa de JavaScript. Ligue o JavaScript no navegador ou fale com a gente:</p>
        ${canais.length ? `<ul style="margin:0 0 1rem;padding-left:1.25rem">${canais.join('')}</ul>` : ''}
        <p style="margin:0;color:${PALETA['cinza-petroleo']}">${html(SITE.titular)} · CNPJ ${html(SITE.cnpj)} · ${html(SITE.cidade)}/${html(SITE.uf)}</p>
      </div>
    </noscript>`
}

/**
 * O HTML do build: theme-color da paleta (paleta.js é o único lugar com hex), og:image ABSOLUTO com o endereço do site (o
 * mesmo ambiente da guarda), o bloco sem JavaScript e, no build de homologação, a marca
 * <meta name="rt-build" content="homologacao"> que o conferir-deploy reprova no ar.
 */
const htmlDoBuild = () => ({
  name: 'html-do-build',
  transformIndexHtml(texto) {
    const dominio = enderecoDoSite(ENV).url.replace(/\/+$/, '')
    const homologacao = COMANDO === 'build' && ENV.VITE_PERMITIR_PENDENCIAS === '1'
    return texto
      .replace('%COR_TEMA%', PALETA.petroleo)
      .replace('%OG_IMAGE%', `${dominio}/og-image.png`)
      .replace('<!--SEM_JS-->', semJavascript())
      .replace('</head>', `${homologacao ? '  <meta name="rt-build" content="homologacao" />\n  ' : ''}</head>`)
  },
})

export default defineConfig({
  base: '/',
  plugins: [
    ambiente(),
    vue(),
    vuetify({ autoImport: true, styles: { configFile: 'src/styles/settings.scss' } }),
    verificarPendencias(),
    conferirCosturas(),
    conferirPublicacao(),
    servirComoNetlify(),
    htmlDoBuild(),
    preCarregarNoHtml(),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // autoImport descobre componente sob demanda; sem isto o 1º load reotimiza e dispara aviso de ref
  optimizeDeps: { exclude: ['vuetify'] },
  server: { port: 5190, strictPort: true },
})
