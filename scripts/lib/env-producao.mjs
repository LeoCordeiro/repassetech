// O .env.production versionado, lido pelo MESMO parser do Vite: uma regex própria se desligaria sozinha com sintaxe válida
// de .env (aspas, "# comentário" no fim, export).
// Usado pelo vite.config (listarPendencias, htmlDoBuild), pelo conferir-deploy, pelo versao-docs e pelos testes de unidade.
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadEnv } from 'vite'

/**
 * Só o .env.production, pelo loadEnv do Vite: numa pasta temporária com a cópia dele (sem .env, .env.local nem
 * .env.production.local, que não são o oficial) e sem as VITE_* do processo (o loadEnv dá preferência a elas, e aqui a
 * pergunta é o que está ESCRITO no arquivo).
 */
export function lerEnvProducao(raiz) {
  const arq = join(raiz, '.env.production')
  if (!existsSync(arq)) return {}
  const dir = mkdtempSync(join(tmpdir(), 'repasse-envprod-'))
  const doProcesso = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('VITE_')))
  try {
    copyFileSync(arq, join(dir, '.env.production'))
    for (const k of Object.keys(doProcesso)) delete process.env[k]
    return loadEnv('production', dir, 'VITE_')
  } finally {
    Object.assign(process.env, doProcesso)
    rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * Número oficial versionado: { numero } (null = ainda vazio, de propósito) ou { erro } — falha FECHADO quando há uma linha
 * do número que o Vite não lê como ^55\d{10,11}$ (valor estranho, ou a chave escrita de outro jeito).
 */
export function numeroOficial(raiz) {
  const arq = join(raiz, '.env.production')
  if (!existsSync(arq)) return { numero: null }
  const valor = lerEnvProducao(raiz).VITE_WHATSAPP_NUMBER
  const linhas = readFileSync(arq, 'utf8').split(/\r?\n/).filter((l) => /WHATS/i.test(l) && !/^\s*#/.test(l))
  if (valor === undefined || valor === '') {
    // linha que fala de WhatsApp mas que o Vite não leu como VITE_WHATSAPP_NUMBER (chave errada) ou com valor que ficou vazio
    const estranha = linhas.find((l) => !/^\s*(export\s+)?VITE_WHATSAPP_NUMBER\s*=\s*(["']?)\2\s*(#.*)?$/.test(l))
    return estranha ? { numero: null, erro: `não entendi o número oficial do .env.production: "${estranha.trim()}" (o Vite não leu VITE_WHATSAPP_NUMBER dessa linha)` } : { numero: null }
  }
  if (!/^55\d{10,11}$/.test(valor)) return { numero: null, erro: `não entendi o número oficial do .env.production: o Vite leu "${valor}", fora de ^55\\d{10,11}$ (55 + DDD + número, sem espaço nem traço)` }
  return { numero: valor }
}
