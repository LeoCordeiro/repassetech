// Dados do negócio + sentinelas. Regra: nunca inventar contato.
// O build (verificarPendencias no vite.config) falha enquanto houver sentinela.
const env = import.meta.env || {}

export const SITE = {
  marca: 'Repasse Tech',
  titular: 'Ivandelino Mendes Xavier',
  cnpj: '55.524.103/0001-42',
  cidade: 'Praia Grande',
  uf: 'SP',
  email: env.VITE_EMAIL_CONTATO || '', // vazio = não aparece em lugar nenhum
  instagram: 'repasse_tech', // https://www.instagram.com/repasse_tech/
  reclameAqui: 'repassetech', // https://www.reclameaqui.com.br/empresa/repassetech/
  vigenciaDocs: '2026-10-08', // data da versão de Privacidade, Termos e Política de repasse, em ISO AAAA-MM-DD (a guarda confere o formato)
  /**
   * Conferência do IMEI: 'todos' = um por um · 'amostra' = por amostragem em cada lote · null = sem resposta (mostra os
   * textos de 'todos' e o build de produção FALHA). Selo, hero, passos, catálogo e Termos leem daqui
   * (src/data/conferencia-imei.js).
   */
  conferenciaImei: 'todos',
  /**
   * Texto de cada versão dos documentos que foi ao ar: { 'AAAA-MM-DD': hash }. O hash (node scripts/versao-docs.mjs) é do
   * texto de Privacidade, Termos e Política de repasse, mais os dados que eles leem; o build recalcula e exige que a versão
   * de vigenciaDocs tenha esse hash. Mudou o texto: versão NOVA (data nova) + hash novo, numa linha nova. Nunca trocar o
   * hash de uma data que já foi ao ar: é a versão que as empresas aceitaram.
   */
  versoesDocs: {
    '2026-10-08': 'ab00475746ee03aa',
  },
}

export const WHATSAPP_NUMBER = env.VITE_WHATSAPP_NUMBER || '55PREENCHER'
export const whatsappPendente = !/^55\d{10,11}$/.test(WHATSAPP_NUMBER)
export const vigenciaPendente = SITE.vigenciaDocs === '__PREENCHER_DATA__'
export const conferenciaImeiPendente = !['todos', 'amostra'].includes(SITE.conferenciaImei)
/** AAAA-MM-DD → DD/MM/AAAA (o formato da faixa da página e da linha do aceite); outro formato sai como veio. */
export const dataBr = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('/') : v)
/**
 * Aceite expresso dos Termos: a linha que a mensagem [VENDER]/[COMPRAR] leva quando a pessoa marca o aceite. "da Repasse
 * Tech": dentro do WhatsApp, "os Termos de uso" sozinho lia como os do próprio WhatsApp. A versão vai em DD/MM/AAAA, como
 * na linha da versão da página.
 */
export const versaoDocs = vigenciaPendente ? '[data pendente]' : dataBr(SITE.vigenciaDocs)
export const LINHA_ACEITE = `Li e aceito os Termos de uso da Repasse Tech (versão de ${versaoDocs})`
/** Dev ou build de homologação: mostra a faixa de pendências e o botão fixo desabilitado. */
export const mostrarPendencias = Boolean(env.DEV) || env.VITE_PERMITIR_PENDENCIAS === '1'

/**
 * Marcador visível de dado que falta e que JÁ tem guarda própria no build (número de WhatsApp, conferência do IMEI): só
 * aparece em dev ou homologação. Pendência sem guarda própria fica como texto literal "[PREENCHER: …]" no componente — e
 * o build de produção falha enquanto ela existir (verificarPendencias no vite.config).
 */
export const marcaPendente = (o_que) => '[' + 'PREENCHER: ' + o_que + ']'

/** O botão fixo de WhatsApp existe nesta rota? (o rodapé reserva espaço para ele não cobrir o "©") */
export const temBotaoFixo = (meta = {}) => !meta.semWhatsFixo && (!whatsappPendente || mostrarPendencias)
