// As 4 regras. A conferência olha DOCUMENTOS — nunca "origem conferida" (promessa de procedência) — e a homologação da
// Anatel (Res. Anatel 780/2025) entra na regra 4. A regra 3 mora com os outros
// textos do IMEI (data/conferencia-imei.js).
import { IMEI } from './conferencia-imei.js'
export const REGRAS = [
  { titulo: 'Só CNPJ ativo.', texto: 'Quem vende e quem compra são empresas com CNPJ ativo na Receita.' },
  { titulo: 'Nota fiscal obrigatória.', texto: 'Sem nota, o lote não é publicado.' },
  IMEI.regra3,
  { titulo: 'Conferência antes de publicar.', texto: 'A documentação de origem e a homologação da Anatel são conferidas antes de o lote ir pra loja.' },
]
