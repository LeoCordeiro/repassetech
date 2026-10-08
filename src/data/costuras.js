// Rótulos de costura: o chip diz o ESTADO DO LOTE naquele ponto da página, nunca vocativo nem lista de documento.
// Costura com rótulo fora desta lista não compila (conferirCosturas no vite.config) e avisa no console em dev (validator
// da CosturaSecao). Até 12 caracteres: cabe em 1 linha a 320.
// Um nome por passo, na ordem do caminho (um juízo, como "Na regra", não é passo).
export const ESTADOS_LOTE = ['O lote entra', 'Conferindo', 'Conferido', 'Na loja', 'Negociando', 'Repassado']
