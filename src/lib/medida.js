/**
 * Medida em px de um token do CSS (tokens.css), lida ao vivo: o JS não guarda cópia de número que o CSS já define
 * (folga da âncora, altura do header). Token que não existe = erro no console em dev e 0.
 */
export function px(token) {
  if (typeof document === 'undefined') return 0
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  if (!v && import.meta.env?.DEV) console.error(`[medida] ${token} não existe em src/styles/tokens.css`)
  return parseFloat(v) || 0
}
