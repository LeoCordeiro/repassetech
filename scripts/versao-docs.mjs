// Versão da Privacidade + Termos + Política de repasse e o hash do texto de hoje.
//   node scripts/versao-docs.mjs
// Mudou o texto dos documentos: data nova em SITE.vigenciaDocs e a linha nova em SITE.versoesDocs (src/config/site.js).
import { fileURLToPath } from 'node:url'
import { SITE } from '../src/config/site.js'
import { IMEI } from '../src/data/conferencia-imei.js'
import { conferirVersaoDocs, hashDocs } from './lib/versao-docs.mjs'

const RAIZ = fileURLToPath(new URL('..', import.meta.url))
const hash = hashDocs(RAIZ, { termosImei: IMEI.termos, site: SITE })
const problema = conferirVersaoDocs({ vigencia: SITE.vigenciaDocs, versoes: SITE.versoesDocs, hash })
console.log(`vigência: ${SITE.vigenciaDocs}\nhash do texto de hoje: ${hash}\nregistradas: ${JSON.stringify(SITE.versoesDocs)}`)
console.log(problema ? `\nPENDENTE: ${problema}` : /^\d{4}/.test(SITE.vigenciaDocs) ? '\nOK: a versão em vigor tem o hash do texto de hoje' : '\n(vigência ainda é sentinela: registre a data e o hash quando o advogado aprovar o texto)')
