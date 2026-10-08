/**
 * Arquivos da logo oficial (brand/, fora do src), resolvidos no build. Nunca desenhar nem recolorir a logo.
 * Proporção = viewBox dos SVG em brand/ (lockup 713×308, ícone 292×308): reserva a caixa antes de o SVG chegar
 * (CLS 0). Trocou a logo: atualize RAZAO com o viewBox novo.
 */
const arquivos = import.meta.glob('/brand/*.{svg,png}', { eager: true, query: '?url', import: 'default' })

export const RAZAO = { lockup: 713 / 308, icone: 292 / 308, 'icone-sem-seta': 292 / 308 }

export const acharLogo = (nome) => arquivos[`/brand/${nome}.svg`] || arquivos[`/brand/${nome}.png`]

/**
 * Cadeia [{ nome, url }] para o tipo e a variante. O ícone sem seta NUNCA cai para outro desenho (o hero decide).
 * O nome vai para data-arquivo: o Vite embute SVG pequeno como data: e a URL deixa de dizer qual arquivo é.
 */
export function candidatosLogo(tipo, variante) {
  const base = variante === 'invertida' ? ['logo-invertida', 'logo-branca', 'logo'] : ['logo']
  const nomes =
    tipo === 'icone-sem-seta'
      ? [variante === 'invertida' ? 'logo-icone-sem-seta-invertida' : 'logo-icone-sem-seta']
      : tipo === 'icone'
        ? [...base.map((n) => n.replace('logo', 'logo-icone')), ...base]
        : base
  return [...new Set(nomes)].map((nome) => ({ nome, url: acharLogo(nome) })).filter((a) => a.url)
}
