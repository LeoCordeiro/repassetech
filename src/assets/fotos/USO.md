# Onde cada foto entra

Fotos de banco (origem e licença: `CREDITOS.md`). Elas ilustram **categoria de produto e situação de trabalho**; não
mostram a operação, a loja, a equipe, o estoque nem lotes reais da Repasse Tech. Legenda e `alt` nunca dizem isso, e
nenhum texto sugere parceria com as marcas que aparecem nos aparelhos.

Recorte já na proporção final: catálogo **4:3** (480, 800 e 1200 px de largura), seção **3:2** (640, 960 e 1440 px).
`object-position` só importa se o contêiner tiver outra proporção (`object-fit: cover`).

```html
<img src="…/catalogo-tablets-800.webp"
     srcset="…/catalogo-tablets-480.webp 480w, …/catalogo-tablets-800.webp 800w, …/catalogo-tablets-1200.webp 1200w"
     sizes="(max-width: 640px) 100vw, 380px" width="800" height="600"
     loading="lazy" decoding="async" alt="Tablet Samsung cinza com caneta ao lado, visto de cima sobre tecido claro">
```
(`<img>`, nunca `v-img`; `loading="lazy"` só fora da 1ª dobra.)

## Catálogo da loja (4:3)

| Arquivo | Onde | `alt` sugerido | Ponto focal | Observação |
|---|---|---|---|---|
| `catalogo-iphone-seminovo` | Loja › categoria iPhones seminovos (Home › prévia da loja) | Quatro iPhones de cores diferentes abertos em leque, seguros com as duas mãos e vistos pela traseira | `50% 40%` | Só mãos. Logo da Apple nos aparelhos. |
| `catalogo-samsung-galaxy` | Loja › Samsung Galaxy lacrados | Dois celulares Samsung Galaxy, um lilás e um creme, deitados sobre as caixas pretas dos aparelhos | `50% 45%` | "Galaxy S24/S24+" impresso nas caixas; etiqueta lateral fora de foco. |
| `catalogo-android-variados` | Loja › Android variados | Celulares Android de marcas variadas espalhados sobre uma superfície cinza | `50% 50%` | Marcas visíveis: Samsung, vivo, ASUS, Huawei. Sem Xiaomi nem Motorola. |
| `catalogo-caixas-lacradas` | Loja › caixas lacradas (lote novo) | Caixas de iPhone de vários modelos e cores enfileiradas lado a lado | `50% 50%` | A mais colorida do conjunto (cor das próprias caixas). |
| `catalogo-tablets` | Loja › tablets | Tablet Samsung cinza com caneta ao lado, visto de cima sobre tecido claro | `45% 50%` | Fundo de tecido creme, o mais quente do conjunto. |
| `catalogo-acessorios` | Loja › acessórios | Pilha de cabos de carregamento brancos enrolados | `60% 50%` | Só cabos (sem carregador nem fone na imagem). |
| `catalogo-audio` | Loja › áudio | Caixa de som Bluetooth portátil cinza com alça, sobre fundo claro | `40% 50%` | "SONY" pequeno na alça. |
| `catalogo-open-box` | Loja › open box / seminovos revisados | Caixa de celular aberta ao lado do aparelho com a tela apagada, do cabo e do carregador | `50% 50%` | iPhone; tela apagada. |

**Card de marca específica só recebe foto da mesma marca.** No catálogo (`src/data/catalogo.js`), cada categoria tem a sua
foto: "iPhone seminovo" → `catalogo-iphone-seminovo`, "Samsung Galaxy" → `catalogo-samsung-galaxy`; as categorias sem marca
(Android de várias marcas, lote lacrado, tablets, acessórios, áudio, open box) usam a foto da categoria. As fotos mostram a
categoria, nunca um lote: nada de modelo, quantidade ou preço de lote junto da foto.

## Seções (3:2)

| Arquivo | Onde | `alt` sugerido | Ponto focal | Observação |
|---|---|---|---|---|
| `secao-conferencia` | Confiança e conferência › abertura (bloco da conferência antes de publicar) | Mãos fotografam a traseira de um celular com outro celular, numa bancada com mais aparelhos | `45% 50%` | Só mãos (o recorte tira o cabelo da pessoa). A tela mostra só a câmera (rótulo pequeno "Front side"), sem IMEI nem marca. |
| `secao-lote-pronto` | Como funciona › trilha "Pra quem vende"; Quero vender › apoio | Caixas lacradas de celular e de outros eletrônicos organizadas sobre uma mesa branca | `50% 45%` | Caixas Apple (iPhone, iPad, mouse, fone). Muito clara: sobre fundo branco, dar borda ou raio. |
| `secao-balcao-loja` | Quero comprar › abertura | Dois iPhones em suportes de exposição no balcão de uma loja, em preto e branco | `45% 50%` | Preto e branco no original. Sem marca de loja nem pessoas. |
| `secao-mao-caixa` | Home (apoio) ou Sobre | Mãos tiram um celular da caixa sobre uma mesa branca | `55% 55%` | Só mãos; caneca e notebook nas bordas. |

Onde hoje há ilustração própria (`src/assets/ilustracoes/README.md`), uma foto pode entrar no mesmo slot. Foto de
documento ou de conferência real só com material da própria Repasse Tech.

## Peso (bytes)

| Foto | 480/640 | 800/960 | 1200/1440 |
|---|---|---|---|
| catalogo-iphone-seminovo | 8 304 | 16 366 | 26 766 |
| catalogo-samsung-galaxy | 8 940 | 18 564 | 34 794 |
| catalogo-android-variados | 14 798 | 58 038 | 137 850 (q 68) |
| catalogo-caixas-lacradas | 21 098 | 42 452 | 78 074 |
| catalogo-tablets | 6 590 | 32 530 | 139 992 (q 72) |
| catalogo-acessorios | 9 558 | 17 920 | 30 636 |
| catalogo-audio | 21 974 | 47 644 | 74 924 |
| catalogo-open-box | 4 970 | 10 160 | 18 750 |
| secao-conferencia | 14 312 | 23 732 | 41 740 |
| secao-lote-pronto | 10 666 | 19 050 | 38 570 |
| secao-balcao-loja | 8 642 | 14 968 | 25 752 |
| secao-mao-caixa | 14 160 | 24 614 | 44 618 |

WebP qualidade 78 (o maior do Android e do tablet desceu para 68 e 72 para caber em 140 KB: textura de concreto e de
tecido). Sem EXIF, XMP nem perfil ICC (só o bloco `VP8`), cores já em sRGB.
