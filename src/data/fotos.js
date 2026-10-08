// Fotos de banco (src/assets/fotos: origem e licença em CREDITOS.md, onde cada uma entra em USO.md). Ilustram categoria de
// produto e situação de trabalho: o alt descreve o que aparece e nunca diz que é a loja, a equipe ou o estoque da Repasse
// Tech. Recorte já na proporção final: catálogo 4:3 (480, 800, 1200), seção 3:2 (640, 960, 1440).
const urls = import.meta.glob('../assets/fotos/*.webp', { eager: true, query: '?url', import: 'default' })

export const FOTOS = {
  'catalogo-iphone-seminovo': { alt: 'Quatro iPhones de cores diferentes abertos em leque, seguros com as duas mãos e vistos pela traseira', foco: '50% 40%' },
  'catalogo-samsung-galaxy': { alt: 'Dois celulares Samsung Galaxy, um lilás e um creme, deitados sobre as caixas pretas dos aparelhos', foco: '50% 45%' },
  'catalogo-android-variados': { alt: 'Celulares Android de marcas variadas espalhados sobre uma superfície cinza', foco: '50% 50%' },
  'catalogo-caixas-lacradas': { alt: 'Caixas de iPhone de vários modelos e cores enfileiradas lado a lado', foco: '50% 50%' },
  'catalogo-tablets': { alt: 'Tablet Samsung cinza com caneta ao lado, visto de cima sobre tecido claro', foco: '45% 50%' },
  'catalogo-acessorios': { alt: 'Pilha de cabos de carregamento brancos enrolados', foco: '60% 50%' },
  'catalogo-audio': { alt: 'Caixa de som Bluetooth portátil cinza com alça, sobre fundo claro', foco: '40% 50%' },
  'catalogo-open-box': { alt: 'Caixa de celular aberta ao lado do aparelho com a tela apagada, do cabo e do carregador', foco: '50% 50%' },
  'secao-conferencia': { alt: 'Mãos fotografam a traseira de um celular com outro celular, numa bancada com mais aparelhos', foco: '45% 50%' },
  'secao-lote-pronto': { alt: 'Caixas lacradas de celular e de outros eletrônicos organizadas sobre uma mesa branca', foco: '50% 45%' },
  'secao-balcao-loja': { alt: 'Dois iPhones em suportes de exposição no balcão de uma loja, em preto e branco', foco: '45% 50%' },
  'secao-mao-caixa': { alt: 'Mãos tiram um celular da caixa sobre uma mesa branca', foco: '55% 55%' },
}

/**
 * Dados do <img> de uma foto: src (a largura do meio), srcset (as 3 larguras), width/height na proporção (o navegador
 * reserva a caixa antes de a foto chegar: zero CLS), alt e o ponto focal (object-position).
 */
export function foto(nome) {
  const larguras = Object.keys(urls)
    .map((k) => k.match(/\/([\w-]+)-(\d+)\.webp$/))
    .filter((m) => m && m[1] === nome)
    .map((m) => Number(m[2]))
    .sort((a, b) => a - b)
  const url = (w) => urls[`../assets/fotos/${nome}-${w}.webp`]
  const secao = nome.startsWith('secao-')
  return {
    nome,
    src: url(larguras[1] ?? larguras[0]),
    srcset: larguras.map((w) => `${url(w)} ${w}w`).join(', '),
    width: secao ? 960 : 800,
    height: secao ? 640 : 600,
    ...FOTOS[nome],
  }
}
