// Textos que dependem de COMO o IMEI é conferido. Uma fonte só:
// SITE.conferenciaImei ('todos' | 'amostra' | null). null = modo ainda não definido: o site mostra os textos de
// 'todos' e o build de produção falha (listarPendencias). Com 'amostra', o selo só afirma o que
// foi conferido inteiro (a nota): "NF conferida" em todo lote.
// Ficam iguais nos dois modos, mas moram aqui também (regra3, faqPorQue, faqQueLote): a regra
// 3 ("IMEI verificável", quem confere é o comprador) e o FAQ. O comparativo e as descrições que dizem "confere nota fiscal e
// IMEI" continuam verdade com amostra.
// Import relativo (sem @/): o vite.config e os scripts importam este arquivo no node.
import { SITE, conferenciaImeiPendente, marcaPendente } from '../config/site.js'

/** Os textos de um modo. `modo` null/inválido = os de 'todos' (Termos com o marcador de pendência). */
export function textosImei(modo) {
  const amostra = modo === 'amostra'
  return {
    modo,
    amostra,
    /** selo de lote COM IMEI (card, etiqueta, nome acessível por extenso) */
    selo: amostra ? 'NF conferida' : 'NF + IMEI conferidos',
    seloExtenso: amostra ? 'nota fiscal conferida' : 'nota fiscal e IMEI conferidos',
    heroB: `Compre lote com CNPJ e nota conferidos. Celular e tablet com chip vêm com IMEI conferido${amostra ? ' por amostra' : ''}.`,
    passoHome: amostra
      ? 'Nota de origem e uma amostra dos IMEIs conferidas antes de o lote aparecer na loja.' // "origem" nunca com "conferida": a conferência olha documentos, não garante procedência
      : 'Nota de origem e IMEI conferidos antes de o lote aparecer na loja.',
    passoVendedor: `A Repasse Tech confere a nota de origem e ${amostra ? 'uma amostra dos IMEIs' : 'o IMEI'} antes de publicar. Lote sem nota não entra. Celular e tablet com chip, sem IMEI, também não.`,
    /**
     * Catálogo: o selo do card é a REGRA de entrada da categoria (o que todo lote dela precisa ter conferido), nunca o
     * resultado de um lote. Com IMEI por amostra, só a nota é afirmada inteira.
     */
    regraEntrada: amostra ? 'Só entra com NF conferida' : 'Só entra com NF + IMEI conferidos',
    regraEntradaExtenso: amostra ? 'só entra com nota fiscal conferida' : 'só entra com nota fiscal e IMEI conferidos',
    regraEntradaNf: 'Só entra com NF conferida',
    regraEntradaNfExtenso: 'só entra com nota fiscal conferida',
    /** Termos, tu-conf: "os IMEIs dos aparelhos, ___, na consulta pública…" */
    termos: amostra ? 'por amostragem em cada lote' : modo === 'todos' ? 'um por um' : marcaPendente('"um por um" ou "por amostragem"'),
    /** regra 3 e FAQ: iguais nos dois modos (quem confere aparelho por aparelho é o comprador) */
    regra3: { titulo: 'IMEI verificável.', texto: 'Cada celular e tablet com chip vai com o IMEI informado, pro comprador conferir.' },
    faqPorQue: 'Pro comprador poder conferir aparelho por aparelho. Vale pra celular e tablet com chip. Tablet só Wi-Fi, acessórios e aparelhos de áudio e vídeo não têm IMEI e entram só com a nota fiscal. É uma das quatro regras da loja.',
    faqQueLote: 'Celular e eletrônico em lote: estoque que não gira, open box, devolução revisada, excesso de estoque, linha descontinuada. Sempre com nota fiscal; celular e tablet com chip, também com o IMEI de cada aparelho. As categorias que circulam estão na loja.',
    /** Loja, bloco "O selo": o lead e os queixos ampliados */
    lojaLead: amostra
      ? 'Nota fiscal conferida em todo lote. Em celular e tablet com chip, o IMEI é conferido por amostra: o selo só afirma o que foi conferido inteiro.'
      : 'Nota fiscal conferida e, em celular e tablet com chip, IMEI conferido. Lote sem IMEI, como acessório ou tablet só Wi-Fi, leva só a nota.',
    lojaQueixos: amostra
      ? [{ texto: 'NF conferida', legenda: 'Todo lote, com ou sem IMEI', carimbo: 'selo-loja-nf' }]
      : [
          { texto: 'NF + IMEI conferidos', legenda: 'Celular e tablet com chip', carimbo: 'selo-loja-imei' },
          { texto: 'NF conferida', legenda: 'Tablet só Wi-Fi, acessório, áudio e vídeo', carimbo: 'selo-loja-nf' },
        ],
  }
}

/** Os textos do site, no modo configurado. */
export const IMEI = textosImei(SITE.conferenciaImei)
export { conferenciaImeiPendente }
