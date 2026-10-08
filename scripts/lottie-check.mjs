// lottie:check — confere o catálogo Lottie antes de entrar no site (node puro, sem deps).
// Falha (exit 1) se: cor fora da paleta (±1 por canal), arquivo > 25 KB, total dos
// não-invertidos > 150 KB, expressão, fonte/texto, imagem, efeito (blur/glow) ou fr ≠ 30.
// Overshoot medido pela AMPLITUDE: nenhuma tangente de easing com y fora de [0,1], e escala acima do valor final só no
// enviado-sucesso (a comemoração), com pico entre 6% e 8% (com menos de 1% ninguém vê).
//   node scripts/lottie-check.mjs [pasta]   (padrão: src/assets/lottie; o build e o npm run lottie:check passam essa pasta)
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PALETA as P } from '../src/styles/paleta.js'

const PASTA = resolve(process.argv[2] ?? 'src/assets/lottie')
// a paleta do site (src/styles/paleta.js), não uma cópia: se uma cor mudar lá, a conferência muda junto
const PALETA = Object.fromEntries(Object.entries(P).map(([nome, hex]) => [hex.toUpperCase(), nome]))
const MAX_ARQ = 25 * 1024
const MAX_TOTAL = 150 * 1024

const canais = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const paraHex = (rgb) => '#' + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()).join('')
function naPaleta(rgb) {
  const alvo = rgb.map((v) => v * 255)
  return Object.keys(PALETA).find((hex) => canais(hex).every((c, i) => Math.abs(c - alvo[i]) <= 1))
}

/** Varre o JSON e devolve cores e problemas estruturais. */
function inspecionar(json) {
  const cores = []
  const problemas = []
  const pegarCor = (k, onde) => {
    if (Array.isArray(k) && k.length >= 3 && k.slice(0, 3).every((n) => typeof n === 'number')) cores.push({ rgb: k.slice(0, 3), onde })
  }
  ;(function andar(no, onde) {
    if (Array.isArray(no)) return no.forEach((x) => andar(x, onde))
    if (!no || typeof no !== 'object') return
    const aqui = no.nm ? `${onde}/${no.nm}` : onde
    if (typeof no.x === 'string') problemas.push(`expressão em ${aqui}`)
    if (no.ty === 5 || no.t?.d) problemas.push(`camada de texto em ${aqui}`)
    if (no.ty === 2 || (typeof no.p === 'string' && no.u !== undefined)) problemas.push(`imagem em ${aqui}`)
    if ((no.ty === 'gf' || no.ty === 'gs')) problemas.push(`gradiente em ${aqui} (cor não conferível)`)
    if (Array.isArray(no.ef) && no.ef.length) problemas.push(`efeito (blur/glow) em ${aqui}`)
    if (no.c && typeof no.c === 'object' && 'k' in no.c) {
      if (no.c.a === 1) for (const kf of no.c.k) { pegarCor(kf.s, aqui); pegarCor(kf.e, aqui) }
      else pegarCor(no.c.k, aqui)
    }
    for (const [chave, v] of Object.entries(no)) if (chave !== 'c') andar(v, aqui)
  })(json, '')
  if (json.fonts || json.chars) problemas.push('tem "fonts"/"chars"')
  if (json.assets?.some((a) => a.p || a.u)) problemas.push('asset de imagem')
  if (json.fr !== 30) problemas.push(`fr = ${json.fr} (esperado 30)`)
  return { cores, problemas }
}

/** Overshoot: tangentes fora de [0,1] e o pico de escala acima do valor final (maior razão entre os componentes x/y). */
function overshoot(json) {
  const tangentes = []
  let pico = 1
  ;(function andar(no, onde, chave) {
    if (Array.isArray(no)) return no.forEach((x) => andar(x, onde, chave))
    if (!no || typeof no !== 'object') return
    const aqui = no.nm ? `${onde}/${no.nm}` : onde
    if (no.a === 1 && Array.isArray(no.k) && no.k[0]?.s) {
      for (const kf of no.k) for (const h of [kf.o, kf.i]) if (h && [].concat(h.y).some((y) => y < 0 || y > 1)) tangentes.push(`${aqui}.${chave}`)
      if (chave === 's') {
        const final = no.k[no.k.length - 1].s
        for (const kf of no.k) kf.s.slice(0, 2).forEach((v, i) => final[i] > 0 && (pico = Math.max(pico, v / final[i])))
      }
    }
    for (const [k, v] of Object.entries(no)) andar(v, aqui, k)
  })(json.layers, '', '')
  return { tangentes: [...new Set(tangentes)], pico: +pico.toFixed(4) }
}
const picos = []

const arquivos = readdirSync(PASTA).filter((n) => n.endsWith('.json')).sort()
const erros = []
let total = 0
let totalInv = 0
const linhas = []

for (const nome of arquivos) {
  const caminho = join(PASTA, nome)
  const texto = readFileSync(caminho, 'utf8')
  let json
  try { json = JSON.parse(texto) } catch (e) { erros.push(`${nome}: JSON inválido (${e.message})`); continue }
  if (!json.layers || !json.v) continue // manifest e afins
  const bytes = statSync(caminho).size
  const invertida = nome.includes('-invertida')
  if (invertida) totalInv += bytes
  else total += bytes
  if (/"x"\s*:\s*"/.test(texto)) erros.push(`${nome}: expressão ("x":"...")`)
  if (bytes > MAX_ARQ) erros.push(`${nome}: ${bytes} B > 25 KB`)
  const { cores, problemas } = inspecionar(json)
  problemas.forEach((p) => erros.push(`${nome}: ${p}`))
  const ov = overshoot(json)
  ov.tangentes.forEach((x) => erros.push(`${nome}: tangente de easing com y fora de [0,1] em ${x} (overshoot só por keyframe, só no envio)`))
  const envio = nome.startsWith('enviado-sucesso')
  if (envio && (ov.pico < 1.06 || ov.pico > 1.08)) erros.push(`${nome}: pico de escala ${ov.pico} (a comemoração pede 1,06–1,08)`)
  if (!envio && ov.pico > 1.0001) erros.push(`${nome}: escala passa do valor final (pico ${ov.pico}): overshoot só no enviado-sucesso`)
  if (envio) picos.push(`${nome} ${Math.round((ov.pico - 1) * 1000) / 10}%`)
  const vistas = new Map()
  for (const { rgb, onde } of cores) {
    const hex = naPaleta(rgb)
    if (!hex) erros.push(`${nome}: cor ${paraHex(rgb)} fora da paleta em ${onde}`)
    const chave = hex ?? `${paraHex(rgb)} (FORA)`
    vistas.set(chave, (vistas.get(chave) ?? 0) + 1)
  }
  const resumo = [...vistas].map(([h, n]) => `${h} ${PALETA[h] ?? ''}×${n}`.replace(' ×', '×')).join(', ')
  linhas.push([nome, String(bytes), `${Math.round((json.op / json.fr) * 1000)}ms`, resumo])
}

const larg = [0, 1, 2].map((i) => Math.max(...linhas.map((l) => l[i].length), ['arquivo', 'bytes', 'duração'][i].length))
const fmt = (l) => l.map((c, i) => (i < 3 ? c.padEnd(larg[i]) : c)).join(' | ')
console.log(fmt(['arquivo', 'bytes', 'duração', 'cores']))
console.log(larg.map((n) => '-'.repeat(n)).join('-|-') + '-|------')
linhas.forEach((l) => console.log(fmt(l)))
console.log(`\ntotal não-invertidos: ${total} B (${(total / 1024).toFixed(1)} KB) de 150 KB`)
console.log(`total invertidos:     ${totalInv} B (${(totalInv / 1024).toFixed(1)} KB)`)
if (total > MAX_TOTAL) erros.push(`total não-invertidos ${total} B > 150 KB`)

if (erros.length) {
  for (const e of erros) console.error('ERRO', e)
  process.exit(1)
}
console.log(`OK lottie:check — ${linhas.length} arquivos, cores só da paleta, sem expressão/fonte/imagem/efeito; overshoot só no envio (${picos.join(', ')})`)
