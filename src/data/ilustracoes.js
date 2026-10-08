// Ilustrações-objeto: SVG próprios em src/assets/ilustracoes (o README de lá diz o desenho). O viewBox é a caixa do desenho
// (2 px de folga), então ele começa na borda do texto e do CTA e o tamanho natural é 1:1 com o traço do catálogo Lottie
// (w/h abaixo = o do viewBox); o alt é curto e igual ao <title> do arquivo.
// `?no-inline`: arquivo próprio (o lazy só vale para arquivo). A da Confiança é a exceção: está na 1ª dobra e é o LCP da
// página no celular — a página importa o SVG com `?inline` (dentro do JS DELA, pintado junto com o texto, sem mais um pedido
// depois do chunk); aqui fica só o que descreve o slot.
// Variante invertida no bloco petróleo. Nunca no hero, na loja nem em card.
import notaImeiInvertida from '@/assets/ilustracoes/nota-imei-invertida.svg?no-inline'

export const ILUSTRACOES = {
  // Como funciona › trilha de quem compra (bloco petróleo: invertida), passo "Você confere"; só ≥ 1024
  compra: {
    src: notaImeiInvertida, arquivo: 'nota-imei-invertida.svg', w: 416, h: 298,
    alt: 'Ilustração: o IMEI na tela do celular é o mesmo da etiqueta da caixa, com a nota fiscal atrás',
  },
  // Confiança › abertura (bloco claro): logo abaixo do texto de abertura, alinhada a ele, em toda largura. Sem o selo
  // desenhado: o carimbo do scan, logo acima, é o único selo da tela
  conferencia: {
    arquivo: 'conferencia.svg', w: 282, h: 201,
    alt: 'Ilustração do que a conferência olha: nota fiscal, lista de IMEI e CNPJ ativo',
  },
}
