// O public/_headers e o public/_redirects como a Netlify aplica: usados pelo vite.config (o `vite preview` e a conferência
// da CSP no build) e pelo conferir-deploy. Um leitor e um servidor só.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

/** Valores do bloco "/*": [[nome, valor]]. */
export function cabecalhosEsperados(texto) {
  const linhas = texto.split(/\r?\n/)
  const pares = []
  for (const l of linhas.slice(linhas.findIndex((x) => x.trim() === '/*') + 1)) {
    if (!/^\s+\S/.test(l)) break
    const t = l.trim()
    if (t.startsWith('#')) continue
    pares.push([t.slice(0, t.indexOf(':')).trim(), t.slice(t.indexOf(':') + 1).trim()])
  }
  return pares
}

/** A CSP do bloco "/*" (só o valor do cabeçalho: um hash num comentário do _headers não conta). */
export const cspDoHeaders = (texto) => cabecalhosEsperados(texto).find(([k]) => k.toLowerCase() === 'content-security-policy')?.[1] || ''

/** Hash de cada <script> inline do HTML, medido como o navegador mede (o parser troca CRLF por LF antes). */
export const hashesInline = (html) =>
  [...html.replace(/\r\n?/g, '\n').matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    ([, js]) => `'sha256-${createHash('sha256').update(js).digest('base64')}'`,
  )

/** Todos os blocos do _headers: [{ padrao, pares }] (padrão "/*", "/assets/*" ou um caminho exato). */
function blocosDoHeaders(texto) {
  const blocos = []
  for (const l of texto.split(/\r?\n/)) {
    if (/^\//.test(l)) blocos.push({ padrao: l.trim(), pares: [] })
    else if (/^\s+\S/.test(l) && blocos.length) {
      const x = l.trim()
      if (x.startsWith('#')) continue
      blocos[blocos.length - 1].pares.push([x.slice(0, x.indexOf(':')).trim(), x.slice(x.indexOf(':') + 1).trim()])
    }
  }
  return blocos
}
const casa = (padrao, caminho) => (padrao.endsWith('*') ? caminho.startsWith(padrao.slice(0, -1)) : padrao === caminho)
/**
 * Cabeçalhos de um caminho como a Netlify aplica o _headers: os blocos que casam, na ordem. Sem Cache-Control, o padrão da
 * Netlify para o que não tem regra: public, max-age=0, must-revalidate.
 */
export function cabecalhosPara(texto, caminho) {
  const m = new Map()
  for (const b of blocosDoHeaders(texto).filter((x) => casa(x.padrao, caminho))) for (const [k, v] of b.pares) m.set(k.toLowerCase(), [k, v])
  if (!m.has('cache-control')) m.set('cache-control', ['Cache-Control', 'public, max-age=0, must-revalidate'])
  return [...m.values()]
}

/** Regras do _redirects: [{ de, para, status }] (linha "origem destino status"; # é comentário). */
export function regrasRedirects(texto = '') {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/))
    .filter((p) => p.length >= 2)
    .map(([de, para, status = '301']) => ({ de, para, status: Number(String(status).replace('!', '')), forcar: String(status).endsWith('!') }))
}

/** Tipo pela extensão (o que o dist tem). */
export const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
}
const COMPRIMIVEL = /^(text\/|application\/(javascript|json|manifest\+json)|image\/svg)/
/**
 * Corpo final de uma resposta estática como a borda serve: brotli (ou gzip) para texto, ETag forte. Devolve
 * { corpo, cabecalhos } — quem serve escreve. Sem compressão o JS de entrada viajava com 274 KB em vez de 98 KB e o LCP
 * medido não representava a produção.
 */
export function respostaComprimida(bruto, tipo, aceita = '') {
  const etag = `"${createHash('sha1').update(bruto).digest('base64url').slice(0, 27)}"`
  if (!COMPRIMIVEL.test(tipo) || bruto.length < 512) return { corpo: bruto, cabecalhos: [['ETag', etag]] }
  if (/\bbr\b/.test(aceita)) return { corpo: brotliCompressSync(bruto, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }), cabecalhos: [['Content-Encoding', 'br'], ['Vary', 'Accept-Encoding'], ['ETag', etag]] }
  if (/\bgzip\b/.test(aceita)) return { corpo: gzipSync(bruto), cabecalhos: [['Content-Encoding', 'gzip'], ['Vary', 'Accept-Encoding'], ['ETag', etag]] }
  return { corpo: bruto, cabecalhos: [['Vary', 'Accept-Encoding'], ['ETag', etag]] }
}

const arquivo = (dist, caminho) => {
  const p = resolve(join(dist, caminho === '/' ? 'index.html' : caminho))
  return p.startsWith(resolve(dist)) && existsSync(p) && !statSync(p).isDirectory() && !/[\\/]_(headers|redirects)$/.test(p) ? p : null
}

/**
 * Responde um GET/HEAD do dist como a Netlify: o arquivo que existe; senão a 1ª regra do _redirects que casa (200 =
 * reescreve, servindo o destino com 200; 301/302 = redireciona); senão 404. Os cabeçalhos do _headers vão pelo caminho
 * PEDIDO (é assim que a Netlify casa as regras), com brotli/gzip para texto e ETag/304.
 */
export function servirArquivo(dist, { headers = '', redirects = '' }, req, res) {
  let caminho
  try {
    caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  } catch {
    res.statusCode = 400
    return res.end()
  }
  let arq = arquivo(dist, caminho)
  if (!arq) {
    const regra = regrasRedirects(redirects).find((r) => casa(r.de, caminho))
    if (regra && (regra.status === 301 || regra.status === 302)) {
      res.writeHead(regra.status, { Location: regra.para })
      return res.end()
    }
    if (regra && regra.status === 200) arq = arquivo(dist, regra.para)
  }
  cabecalhosPara(headers, caminho).forEach(([k, v]) => res.setHeader(k, v))
  if (!arq) {
    res.statusCode = 404
    return res.end()
  }
  const tipo = TIPOS[extname(arq)] || 'application/octet-stream'
  const { corpo, cabecalhos } = respostaComprimida(readFileSync(arq), tipo, req.headers['accept-encoding'] || '')
  ;[...cabecalhos, ['Content-Type', tipo]].forEach(([k, v]) => res.setHeader(k, v))
  if (req.headers['if-none-match'] && req.headers['if-none-match'] === res.getHeader('ETag')) {
    res.statusCode = 304
    return res.end()
  }
  res.setHeader('Content-Length', corpo.length)
  res.end(req.method === 'HEAD' ? undefined : corpo)
}
