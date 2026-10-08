// Versão dos documentos amarrada ao texto: a linha do aceite cita a versão dos Termos (que incluem a Política de repasse)
// como prova do que a empresa aceitou; sem amarra, dois textos diferentes circulariam com a mesma "versão". Mesmo padrão do
// hash do script inline na CSP: o build recalcula o hash do texto e confere com SITE.versoesDocs[SITE.vigenciaDocs].
//   node scripts/versao-docs.mjs     mostra a versão atual, o hash do texto de hoje e a linha a registrar
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { lerEnvProducao } from './env-producao.mjs'

export const DOCS = ['src/pages/PaginaTermos.vue', 'src/pages/PaginaPrivacidade.vue', 'src/pages/PaginaPoliticaRepasse.vue']

/** O texto que a pessoa lê num .vue: o <template> sem comentário, tag e atributo, com os espaços colapsados. */
export function textoDoTemplate(vue) {
  const t = vue.replace(/\r\n?/g, '\n').match(/<template>([\s\S]*)<\/template>/)?.[1] ?? ''
  return t.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Hash do texto dos três documentos + o que eles leem da config: o trecho do IMEI, os dados da empresa e os canais de
 * contato (WhatsApp e e-mail do .env.production, Instagram e Reclame Aqui do site.js). Trocar um canal muda a versão.
 * Mexer em marcação (tag, classe, componente) não muda o hash; mexer em palavra muda.
 */
export function hashDocs(raiz, { termosImei = '', site = {} } = {}) {
  const env = lerEnvProducao(raiz)
  const extras = JSON.stringify({
    termosImei, titular: site.titular, cnpj: site.cnpj, cidade: site.cidade, uf: site.uf,
    whatsapp: env.VITE_WHATSAPP_NUMBER || '', email: env.VITE_EMAIL_CONTATO || '', instagram: site.instagram || '', reclameAqui: site.reclameAqui || '',
  })
  const texto = `${DOCS.map((f) => textoDoTemplate(readFileSync(join(raiz, f), 'utf8'))).join('\n')}\n${extras}`
  return createHash('sha256').update(texto).digest('hex').slice(0, 16)
}

/** Pendência da versão dos documentos, ou ''. Só confere quando a vigência já é uma data (antes disso, outra guarda cobra). */
export function conferirVersaoDocs({ vigencia, versoes = {}, hash }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vigencia || '')) return ''
  const registrado = versoes[vigencia]
  if (!registrado) return `SITE.versoesDocs não tem o hash da versão ${vigencia}: registre '${vigencia}': '${hash}' (node scripts/versao-docs.mjs)`
  if (registrado !== hash)
    return `o texto da Privacidade/Termos/Política de repasse mudou e a versão continua ${vigencia}: versão nova em SITE.vigenciaDocs (data nova) e '<data nova>': '${hash}' em SITE.versoesDocs — o hash de uma data que já foi ao ar não se troca`
  return ''
}
