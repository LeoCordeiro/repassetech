// Confere o site PUBLICADO (na Netlify, ou o build servido como ela serve). Baixa o index.html e o JavaScript que ele
// carrega e confere:
//  1. o número de WhatsApp embutido no bundle é o OFICIAL versionado em .env.production (lido pelo parser do Vite) ou o de
//     --numero: quem troca a variável no painel da Netlify ou na máquina de build desvia todos os pedidos em silêncio;
//  2. os cabeçalhos do bloco "/*" do public/_headers chegaram iguais (CSP, COOP, frame-ancestors, nosniff…), e o hash do
//     <script> inline do HTML SERVIDO está na CSP SERVIDA (a borda pode reescrever o HTML: "snippet injection");
//  3. nenhuma resposta grava cookie (a Política de privacidade diz "sem cookies"; o Split Testing da Netlify grava);
//  4. nenhum script/estilo da página vem de outro host;
//  5. não é build de homologação (VITE_PERMITIR_PENDENCIAS=1 esquecido no ambiente de produção): a marca
//     <meta name="rt-build" content="homologacao">, a flag no bundle, DEV ligado ou um chunk _Componentes reprovam;
//  6. og:image absoluto, no domínio público, e respondendo 200 (a prévia do link no WhatsApp depende dele);
//  7. cache e compressão: o index.html com max-age=0 (ou no-cache) e ETag; um /assets/*.js com max-age=31536000 e
//     immutable; o JS e o CSS de entrada comprimidos (br, zstd ou gzip);
//  8. os ícones (favicon.ico, favicon.svg, PNG, apple-touch-icon, android-chrome, site.webmanifest) e o robots.txt
//     respondem 200 com o tipo certo, e o manifesto aponta para ícones que existem;
//  9. endereço com caminho (domínio/quero-vender/): o public/_redirects entrega o index.html com 200, e o script de entrada
//     dele responde como JavaScript (com o base relativo ele virava /quero-vender/assets/… → HTML → página em branco).
//   node scripts/conferir-deploy.mjs https://dominio [--numero 55DDNNNNNNNNN] [--origem https://dominio-publico]
// --origem: o domínio que o og:image tem de apontar quando a url conferida é outra (o deploy de prévia da Netlify, ou o
// build servido localmente: `npm run build && npm run preview` e o script contra esse endereço, ANTES de publicar).
// Sai ≠ 0 se reprovar. Rodar a cada deploy. Não abre navegador: a CSP sem violação no carregamento real se confere no
// console do navegador (nenhum erro de Content-Security-Policy ao abrir as páginas).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { cabecalhosEsperados as lerCabecalhos, hashesInline } from './lib/cabecalhos.mjs'
import { numeroOficial as lerNumeroOficial } from './lib/env-producao.mjs'

const RAIZ = fileURLToPath(new URL('..', import.meta.url))

/** Valores do bloco "/*" do public/_headers: [[nome, valor]]. */
export const cabecalhosEsperados = (texto = readFileSync(join(RAIZ, 'public/_headers'), 'utf8')) => lerCabecalhos(texto)

/** Número oficial versionado (.env.production, parser do Vite) ou null. Linha que o Vite não entende: lança. */
export function numeroOficial() {
  const { numero, erro } = lerNumeroOficial(RAIZ)
  if (erro) throw new Error(erro)
  return numero
}

/** Os arquivos sem hash que o index.html e o manifesto pedem: [caminho, tipo esperado]. */
const ICONES = [
  ['favicon.ico', /^image\/(x-icon|vnd\.microsoft\.icon)/], ['favicon.svg', /^image\/svg\+xml/], ['favicon-16x16.png', /^image\/png/], ['favicon-32x32.png', /^image\/png/],
  ['apple-touch-icon.png', /^image\/png/], ['android-chrome-192x192.png', /^image\/png/], ['android-chrome-512x512.png', /^image\/png/],
  ['site.webmanifest', /^application\/(manifest\+json|json)/], ['robots.txt', /^text\/plain/],
]

/**
 * Confere `url`; devolve { falhas: string[], linhas: string[] }.
 * `origemPublica`: o domínio que o og:image tem de apontar (padrão: o da própria url). Conferindo um build servido
 * localmente (url em 127.0.0.1), o og aponta para o domínio de verdade e é baixado da url local.
 */
export async function conferirDeploy(url, { numero = numeroOficial(), cabecalhos = cabecalhosEsperados(), origemPublica } = {}) {
  const falhas = []
  const linhas = []
  const ok = (cond, msg, extra = '') => {
    linhas.push(`  ${cond ? 'ok     ' : 'REPROVA'} ${msg}${extra ? ` → ${extra}` : ''}`)
    if (!cond) falhas.push(`${msg}${extra ? ` → ${extra}` : ''}`)
    return cond
  }
  const base = new URL(url.endsWith('/') ? url : `${url}/`)
  const publica = new URL(origemPublica || base.origin)
  if (!ok(/^55\d{10,11}$/.test(numero || ''), 'número oficial para comparar (.env.production ou --numero)', numero || 'nenhum: preencha VITE_WHATSAPP_NUMBER no .env.production')) return { falhas, linhas }
  const cookies = []
  const baixar = async (u) => {
    const r = await fetch(u, { redirect: 'follow', cache: 'no-store' })
    const sc = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [r.headers.get('set-cookie')].filter(Boolean)
    if (sc.length) cookies.push(`${new URL(u).pathname}: ${sc.join(' | ').slice(0, 120)}`)
    return r
  }
  let doc
  try {
    doc = await baixar(base.href)
  } catch (e) {
    ok(false, `site responde em ${base.href}`, String(e.message || e))
    return { falhas, linhas }
  }
  const html = await doc.text()
  ok(doc.ok, `index.html responde 200`, String(doc.status))
  // 2. cabeçalhos + hash do script inline do HTML servido dentro da CSP servida
  const diferentes = cabecalhos.filter(([k, v]) => (doc.headers.get(k) || '').replace(/\s+/g, ' ').trim() !== v.replace(/\s+/g, ' ').trim())
  ok(!diferentes.length, `${cabecalhos.length} cabeçalhos do public/_headers chegaram iguais (CSP, COOP, frame-ancestors…)`,
    diferentes.map(([k]) => `${k}: ${(doc.headers.get(k) || '(ausente)').slice(0, 60)}`).join(' · '))
  const cspServida = doc.headers.get('content-security-policy') || ''
  const inline = hashesInline(html)
  const semHash = inline.filter((h) => !cspServida.includes(h))
  ok(inline.length > 0 && !semHash.length, `hash do <script> inline do HTML servido está na CSP servida (${inline.length})`, semHash.join(' ') || (inline.length ? '' : 'nenhum script inline no HTML servido'))
  // 4. script/estilo só do próprio site (nenhum host de terceiro na carga)
  const refs = [...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)].map((m) => m[1])
  const fora = refs.filter((r) => { try { return new URL(r, base).host !== base.host } catch { return false } }).filter((r) => !/og-image\.png$/.test(r))
  ok(!fora.length, 'scripts, estilos e ícones vêm do próprio site', fora.join(' · '))
  // 6. og:image absoluto no domínio público e respondendo 200
  const og = (html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/) || [])[1] || ''
  let ogOk = false
  let ogInfo = og || '(sem og:image)'
  if (/^https:\/\//.test(og) && new URL(og).origin === publica.origin) {
    const local = new URL(new URL(og).pathname.replace(/^\//, ''), base).href
    try {
      const r = await baixar(publica.origin === base.origin ? og : local)
      ogOk = r.ok && /image\/png/.test(r.headers.get('content-type') || '')
      ogInfo = `${og} → ${r.status} ${r.headers.get('content-type')}`
    } catch (e) {
      ogInfo = `${og} → ${e.message}`
    }
  }
  ok(ogOk, `og:image absoluto no domínio público (${publica.origin}) e respondendo 200`, ogInfo)
  // 1. número no bundle + 5. marcas de homologação: o entry (script type=module) e o que ele importa, até 80 arquivos
  const fila = [...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/g), ...html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => new URL(m[1], base).href)
  const vistos = new Set()
  const numeros = new Set()
  const homologacao = []
  if (/<meta\s+name="rt-build"\s+content="homologacao"/.test(html)) homologacao.push('<meta name="rt-build" content="homologacao"> no index.html')
  while (fila.length && vistos.size < 80) {
    const u = fila.shift()
    if (vistos.has(u)) continue
    vistos.add(u)
    const js = await (await baixar(u)).text()
    for (const m of js.matchAll(/VITE_WHATSAPP_NUMBER"?\s*:\s*"([^"]*)"/g)) numeros.add(m[1])
    if (/VITE_PERMITIR_PENDENCIAS"?\s*:\s*"1"/.test(js)) homologacao.push(`VITE_PERMITIR_PENDENCIAS:"1" em ${new URL(u).pathname}`)
    if (/\bDEV"?\s*:\s*(!0|true)\b/.test(js)) homologacao.push(`DEV ligado em ${new URL(u).pathname}`)
    if (/_Componentes-[\w-]+\.js/.test(js)) homologacao.push(`chunk da bancada (_Componentes) referenciado em ${new URL(u).pathname}`)
    for (const m of js.matchAll(/["'`](\.{1,2}\/[\w./-]+\.js|\/?assets\/[\w./-]+\.js)["'`]/g)) fila.push(new URL(m[1], u).href)
  }
  ok(numeros.size === 1 && numeros.has(numero), `número de WhatsApp no bundle = o oficial (${numero})`, `no bundle: ${[...numeros].map((n) => n || '(vazio)').join(', ') || 'nenhum'} · ${vistos.size} arquivos JS lidos`)
  ok(!homologacao.length, 'build de PRODUÇÃO no ar (sem marca de homologação, flag de pendências, DEV nem a bancada)', [...new Set(homologacao)].slice(0, 4).join(' · '))
  // 7. cache e compressão
  const ccDoc = doc.headers.get('cache-control') || ''
  ok(/max-age=0\b|no-cache/.test(ccDoc) && !!doc.headers.get('etag'), 'index.html sem cache longo (max-age=0 ou no-cache) e com ETag: o deploy novo chega na próxima visita', `${ccDoc || '(sem Cache-Control)'} · ETag ${doc.headers.get('etag') ? 'sim' : 'não'}`)
  const entrada = html.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/)?.[1]
  const css = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/)?.[1]
  const cab = {}
  for (const [nome, u] of [['js', entrada], ['css', css]]) {
    if (!u) continue
    const r = await baixar(new URL(u, base).href)
    await r.arrayBuffer()
    cab[nome] = { cc: r.headers.get('cache-control') || '', ce: r.headers.get('content-encoding') || '' }
  }
  ok(!!cab.js && /max-age=31536000/.test(cab.js.cc) && /immutable/.test(cab.js.cc), 'arquivo com hash (/assets/*.js) com cache longo: max-age=31536000, immutable', cab.js?.cc || '(sem script de entrada)')
  ok(!!cab.js && !!cab.css && [cab.js.ce, cab.css.ce].every((x) => /^(br|zstd|gzip)$/.test(x)), 'JS e CSS de entrada comprimidos (br, zstd ou gzip)', JSON.stringify({ js: cab.js?.ce, css: cab.css?.ce }))
  // 8. ícones, manifesto e robots.txt
  const icones = []
  for (const [p, tipo] of ICONES) {
    try {
      const r = await baixar(new URL(p, base).href)
      const ct = r.headers.get('content-type') || ''
      const corpo = await r.text()
      if (!r.ok || !tipo.test(ct)) icones.push(`${p}: ${r.status} ${ct}`)
      if (p === 'site.webmanifest' && r.ok) {
        const mf = JSON.parse(corpo)
        for (const i of mf.icons || []) {
          const ri = await baixar(new URL(i.src.replace(/^\//, ''), base).href)
          await ri.arrayBuffer()
          if (!ri.ok) icones.push(`manifesto → ${i.src}: ${ri.status}`)
        }
      }
    } catch (e) {
      icones.push(`${p}: ${e.message}`)
    }
  }
  ok(!icones.length, `ícones, manifesto e robots.txt respondem 200 com o tipo certo (${ICONES.length})`, icones.join(' · '))
  // 9. endereço com caminho: o _redirects entrega o index.html, e o script de entrada dele chega como JavaScript
  try {
    const r = await baixar(new URL('quero-vender/', base).href)
    const h = await r.text()
    const ent = h.match(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/)?.[1]
    const rs = ent ? await baixar(new URL(ent, new URL('quero-vender/', base)).href) : null
    if (rs) await rs.arrayBuffer()
    ok(r.status === 200 && /text\/html/.test(r.headers.get('content-type') || '') && !!rs && rs.ok && /javascript/.test(rs.headers.get('content-type') || ''),
      'endereço com caminho (/quero-vender/): o index.html com 200 e o script de entrada dele como JavaScript (nunca a página em branco)', `${r.status} · entrada ${ent || '?'} → ${rs ? `${rs.status} ${rs.headers.get('content-type')}` : '—'}`)
  } catch (e) {
    ok(false, 'endereço com caminho (/quero-vender/) responde', e.message)
  }
  // 3. cookie
  ok(!cookies.length, 'nenhuma resposta grava cookie (Set-Cookie)', cookies.join(' · '))
  return { falhas, linhas }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url = process.argv[2]
  if (!url || url.startsWith('--')) {
    console.error('uso: node scripts/conferir-deploy.mjs https://dominio [--numero 55DDNNNNNNNNN] [--origem https://dominio-publico]')
    process.exit(2)
  }
  const valor = (k) => {
    const i = process.argv.indexOf(k)
    return i > 0 ? process.argv[i + 1] : undefined
  }
  const opcoes = {}
  if (valor('--numero')) opcoes.numero = valor('--numero')
  if (valor('--origem')) opcoes.origemPublica = valor('--origem')
  const { falhas, linhas } = await conferirDeploy(url, opcoes)
  console.log(`conferir-deploy ${url}\n${linhas.join('\n')}`)
  console.log(falhas.length ? `\nREPROVADO: ${falhas.length}\n- ${falhas.join('\n- ')}` : '\nAPROVADO')
  process.exit(falhas.length ? 1 : 0)
}
