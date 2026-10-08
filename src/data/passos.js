// Passos da espinha: os da Home e as trilhas de quem vende e de quem compra (Como funciona).
// O passo da conferência diz como o IMEI é conferido (SITE.conferenciaImei, data/conferencia-imei.js).
import { IMEI } from './conferencia-imei.js'

export const PASSOS_HOME = [
  { titulo: 'Cadastre o CNPJ.', texto: 'Só entra empresa com CNPJ ativo. Você escolhe: vende, compra ou os dois.', lottie: 'passo-1-cadastro' },
  { titulo: 'Monte o lote.', texto: 'Marca, modelo, quantidade, condição e preço. Junto vão a nota fiscal e, em celular e tablet com chip, os IMEIs.', lottie: 'passo-2-lote' },
  { titulo: 'A gente confere.', texto: IMEI.passoHome, lottie: 'passo-3-conferencia', rotulo: 'Repasse Tech' },
  { titulo: 'Feche o repasse.', texto: 'Vendedor e comprador negociam pela Repasse Tech. A comissão só é cobrada no repasse fechado.', lottie: 'passo-4-repasse' },
]

export const PASSOS_VENDEDOR = [
  { titulo: 'Cadastre o CNPJ.', texto: 'Só entra empresa com CNPJ ativo.', lottie: 'passo-1-cadastro' },
  { titulo: 'Monte o lote.', texto: 'Marca, modelo, quantidade, condição e preço por unidade. Junto vão a nota fiscal e, em celular e tablet com chip, o IMEI de cada aparelho.', lottie: 'passo-2-lote' },
  { titulo: 'Espere a conferência.', texto: IMEI.passoVendedor, lottie: 'passo-3-conferencia', rotulo: 'Repasse Tech' },
  { titulo: 'Feche o repasse.', texto: 'O comprador chama pela Repasse Tech, vocês negociam, e a comissão só é cobrada se o repasse fechar.', lottie: 'passo-4-repasse' },
]

export const PASSOS_COMPRADOR = [
  { titulo: 'Cadastre o CNPJ.', texto: 'Só compra quem tem CNPJ ativo, do mesmo jeito que só vende quem tem.', lottie: 'passo-1-cadastro' },
  { titulo: 'Procure o lote.', texto: 'Marca, condição e quantidade. Todo lote da loja já passou pela conferência.', lottie: 'passo-2-lote' },
  { titulo: 'Confira os documentos.', texto: 'A nota fiscal vai junto do lote, e o IMEI de cada celular e tablet com chip também, pra você conferir antes de fechar.', lottie: 'passo-3-conferencia', rotulo: 'Você confere' },
  { titulo: 'Feche o repasse.', texto: 'Negocie com o vendedor pela Repasse Tech. A comissão só é cobrada no repasse fechado.', lottie: 'passo-4-repasse' },
]
