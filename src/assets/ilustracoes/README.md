# Ilustrações-objeto

**Ilustração própria onde nenhuma foto mostra o que a página explica.** Na trilha de quem vende do Como funciona, a foto
do lote pronto (`src/assets/fotos`) ocupa o lugar da `lote-caixa`; a conferência (Confiança) e o IMEI que bate com a
etiqueta (trilha de quem compra) são desenhados.

## Onde estão

| Arquivo usado | Página › lugar | Larguras | Tamanho natural (= viewBox) |
|---|---|---|---|
| `nota-imei-invertida.svg` | Como funciona › trilha "Pra quem compra" (bloco petróleo), mesmo lugar; `loading="lazy"` | só ≥ 1024 | 416 × 298 |
| `conferencia.svg` | Confiança › abertura (bloco claro), 32 px abaixo do texto de abertura e alinhada a ele | toda largura | 282 × 201 |

Fora de uso hoje: a `lote-caixa` (e a `lote-caixa-invertida`), que saiu do Como funciona quando a foto do lote pronto entrou, e as
variantes `nota-imei` e `conferencia-invertida`; ficam com o mesmo desenho, para o dia em que um slot mudar de tom ou voltar.
Dados do slot (largura, altura, alt): `src/data/ilustracoes.js`. Ao trocar uma ilustração de lugar, confira: a variante
combina com o tom do bloco, `loading="lazy"` só fora da 1ª dobra, alt = `<title>` = `aria-label`, e o desenho começa na
borda do texto.

## O que cada uma mostra

- `lote-caixa`: caixa de lote aberta com caixas lacradas em pé, a nota fiscal atrás e a **etiqueta do lojista** na frente
  (uma linha de modelo, uma de detalhe e `•• un.`). Sem selo e **sem código RT**: o lote ainda não foi conferido.
- `nota-imei`: o celular com o IMEI na tela (`*#06#`) e a caixa dele com o mesmo IMEI na etiqueta. A seta da marca liga os
  dois (é o gesto do passo "Confira os documentos") e a nota fica atrás.
- `conferencia`: os três documentos que a conferência olha, lado a lado: nota fiscal com a chave de acesso, lista de IMEI e
  CNPJ ativo. Não aparece mercadoria. Sem seta. **Sem selo**: o carimbo do scan, logo acima na mesma tela, é o único selo;
  com o selo desenhado seriam dois selos iguais na 1ª tela.

## Regras do desenho (se for editar à mão)

- Papel → cor, igual ao catálogo Lottie (`scripts/lottie-gerar.mjs`). Normal / invertida:
  - traço: `#0F4C5C` / `#FFFFFF`;
  - detalhe: `#5FA8B5` / `#5FA8B5`;
  - neutro: `#4A6670` / `#5FA8B5`;
  - fundo: `#EAF4F6` / `#0A3541`;
  - papel: `#FFFFFF` / `#0F4C5C`.
- **Laranja só como conector entre duas coisas desenhadas**: a seta da `nota-imei` liga o IMEI da tela ao da etiqueta.
  Seta que aponta para fora do desenho, sem rótulo e sem ação, não entra — vira o maior laranja da tela e, no celular,
  aponta para o botão de WhatsApp. A seta é sempre a da logo: geometria de `brand/logo-icone.svg` em escala.
- **Código RT nunca em objeto físico**: o código só existe depois da conferência, e um adesivo RT numa caixa de mercadoria
  sugere estoque ou despacho da Repasse Tech, o que ela não faz.
- **viewBox = a caixa do desenho**, com 2 px de folga: o desenho começa na borda do texto e do CTA, e o tamanho natural do
  arquivo é 1:1 com o traço do catálogo Lottie (contorno 4 px, linha e detalhe 3 px, barra de código 2,5 px). Mudou o
  desenho, recalcule a caixa e atualize `w`/`h` em `src/data/ilustracoes.js`.
- Ponta e junção redondas. Sem filtro, gradiente, sombra ou opacidade.
- Número sempre mascarado (`•••`), nunca IMEI, chave de NF ou CNPJ plausível. Letra só contornada em Poppins (NF, IMEI,
  CNPJ, ATIVO, un., `*#06#`), nada de `<text>`.
- Até 8 KB por arquivo (hoje de 3,4 a 4,9 KB), `role="img"` + `<title>` + `aria-label` iguais.

## Como usar na página

`<img>` (nunca `v-img`) com `width`/`height` do arquivo, `height: auto` no CSS (encolhe com a coluna), `decoding="async"` e
`loading="lazy"` só fora da 1ª dobra. O `alt` é o texto do `<title>`: curto (até ~110 caracteres), começa por "Ilustração"
(diz que não é foto de mercadoria real), sem nota técnica ("números mascarados") e sem afirmar posse.

Conferido em 08/10/2026: cores extraídas por script (todas da paleta), caixa do desenho medida no Chrome.
