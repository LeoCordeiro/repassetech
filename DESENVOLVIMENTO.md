# Desenvolvimento

Notas para quem mantém o site da Repasse Tech. Como rodar, publicar e conferir o deploy: [`README.md`](README.md).

## Estrutura

```
index.html              HTML base: metadados, ícones e o script inline (classes .js/.rm e pré-carga da foto da Loja no celular)
vite.config.js          guardas do build, HTML do build (theme-color, og:image, bloco sem JavaScript), pré-carga de fontes
                        e logo, e o `vite preview` servindo o dist/ como a Netlify
netlify.toml            comando de build, pasta publicada e versão do Node
.env.production         WhatsApp e e-mail oficiais (dados públicos, versionados)
.env.development        os mesmos dados para o `npm run dev`
brand/                  logo oficial em SVG: lockup, ícone e ícone sem seta (normal, invertida e branca)
public/                 _headers (CSP, cache), _redirects, ícones, site.webmanifest, robots.txt, og-image.png
scripts/                lottie-gerar · lottie-check · unidade (npm test) · versao-docs · conferir-deploy
scripts/lib/            leitores do .env.production, do _headers/_redirects e o hash dos documentos (usados pelo vite.config)
src/main.js             fontes → vuetify/styles → styles/* → app; pré-carrega as outras páginas depois do load
src/App.vue             LinkPular · AvisoPendencias · SiteHeader (fora da Home) · MenuCelular · RouterView com transição
                        · SiteFooter · BotaoWhatsappFixo
src/router/index.js     rotas (hash), meta { titulo, descricao, pagina? }, rolagem e âncoras; /vitrine → /loja;
                        /_componentes só no dev; "Página não encontrada" para o resto
src/config/site.js      dados da empresa, canais, vigência e versões dos documentos, modo da conferência do IMEI, linha do aceite
src/plugins/vuetify.js  temas repasse (claro) e repassePetroleo, quebras 640/1024, ícones próprios, defaults dos componentes
src/styles/             paleta.js · tokens.css · contextos.css · motion.css · base.css · tipografia.css · fontes.css
                        · vuetify-overrides.css · settings.scss
src/lib/                lottie · whatsapp (mensagem e link wa.me) · cnpj · preco · caminho · visita · visivel · motion
                        · medida · canais · marca · ui
src/composables/        useEnvioWhatsapp · useNudge · useReveal (diretiva v-reveal) · useSequencia · useReduzirMovimento
src/data/               catalogo · fotos · ilustracoes · opcoes · conferencia-imei · passos · regras · comparativo · faq
                        · costuras · confianca
src/components/         marca/ · blocos/ · lote/ · form/ · layout/
src/pages/              uma página por rota (+ _Componentes.vue, a bancada de componentes, só no dev)
src/assets/             lottie/ (JSON + manifest) · fotos/ (WebP em 3 larguras) · ilustracoes/ (SVG) · reserva/ (quadro parado
                        do scan)
```

Navegação por hash (`createWebHashHistory`): âncora dentro da página é `:to="{ hash: '#id' }"`, nunca `href="#id"` (trocaria
a rota). Endereço com caminho (`domínio/quero-vender`, colado sem o `#`) chega pelo `public/_redirects` e vira rota do hash
em `src/lib/caminho.js`, antes de o router existir.

## Paleta e tokens

- **`src/styles/paleta.js` é o único lugar com hex.** O tema do Vuetify, o `vite.config.js` (theme-color e bloco sem
  JavaScript) e os scripts do Lottie leem dele.

  | Nome | Hex | Uso |
  |---|---|---|
  | `petroleo` | `#0F4C5C` | cor principal, texto, blocos escuros |
  | `petroleo-profundo` | `#0A3541` | rodapé, fundos mais escuros |
  | `acao` | `#F26B1D` | laranja: só botão de ação, seta e costura (`acao-hover` `#D9560F`, `acao-pressed` `#C24A0A`) |
  | `azul-claro` / `azul-texto` | `#5FA8B5` / `#2C7280` | detalhes; texto azul com contraste |
  | `branco` / `gelo` | `#FFFFFF` / `#EAF4F6` | fundos claros |
  | `cinza-petroleo` | `#4A6670` | texto secundário |
  | `fio` / `borda-controle` | `#D5E5E9` / `#6F8F98` | linhas; borda de campo e chip (3:1 no branco) |
  | `texto-2-escuro` / `superficie-escura-2` | `#A9C6CD` / `#164E5D` | texto secundário e superfície no bloco escuro |
  | `erro` | `#B3261E` | erro de campo de formulário |
  | `sombra-escura` | `#03161C` | sombras sobre bloco escuro |

- `tokens.css` expõe as cores como `--c-*` (`rgb(var(--v-theme-x))`; com transparência, `rgba(var(--v-theme-x), .30)` —
  os triplets do Vuetify vêm com vírgula) e define tipografia (`--ff-t` Poppins, `--ff-c` Inter, `--fs-*`), espaço
  (`--sp-1` a `--sp-9`), raios (`--r-*`), sombras (`--s1` a `--s3`, `--s2d`/`--s3d` no escuro), larguras (`--wrap-max`
  1232 px, `--medida` 62ch, `--medida-doc` 56ch), `--header-h`, `--ancora-topo` e `--fixo-margem`.
- `contextos.css`: os tokens que mudam com o bloco (`--text`, `--text-2`, `--bg`, `--border`, `--focus`, `--seta`,
  `--sec-*`…). O `SecaoBloco` troca o tema; peça solta no outro tom usa `.ctx-claro` / `.ctx-petroleo`, sempre com a classe
  dobrada (`.ctx-claro.ctx-claro`) para vencer o tema herdado que o Vuetify põe no mesmo nó.
- **`motion.css` é o único lugar com curva e duração**: `--ease-pass`, `--ease-settle`, `--ease-confirm` (só no rótulo de
  sucesso do formulário), `--dur-*`, `--atraso-*`, `--stagger-*`, `--shift-*`. Sob `prefers-reduced-motion` a classe `.rm`
  vai para o `<html>` e os tokens de movimento valem 0. No JavaScript, duração só por `ms('--token')` (`src/lib/motion.js`)
  e medida só por `px('--token')` (`src/lib/medida.js`): nenhum número solto em `.js`/`.vue`.
- `fontes.css`: fontes de reserva com as métricas da Poppins e da Inter (size-adjust, ascent, descent, line-gap por peso),
  para a troca de fonte não mexer no layout. Mudou a versão das fontes: medir de novo e refazer as contas.
- `settings.scss`: fontes do Vuetify, sem o pacote de cores do Material e sem as classes utilitárias (`d-flex`, `ma-2`…
  não existem; ficam só `rounded*` e `border*`, que as props dos componentes geram).

## Componentes

Props com `*` são obrigatórias. `›` separa props de slots, eventos e métodos expostos.

### Marca (`src/components/marca`)

- `BrandLottie` — a única porta para Lottie. name*, trigger (viewport | hover | click | manual), loop (null = manifest),
  speed, decorative, ariaLabel, variant (normal | invertida | auto), size (número ou { w, h }), ciclos, posterInicial,
  reservaAteCarregar, semFila (só a bancada) › slot #fallback · eventos ready, complete, marco, reserva, falha, tocando ·
  expõe play, pause, stop, poster, anim. `play()` com a caixa fora da tela espera ela entrar.
- `SeloVerificado` — formato (chip | queixo | linha), texto (padrão: o selo do modo do IMEI), animado, trigger, variant,
  posterInicial, size, carimbo (chave de "uma vez por visita"), atraso (token), liberado › evento carimbou · expõe play,
  poster.
- `SeloEstatico` — size, variant: o selo parado (o mesmo desenho do quadro final do Lottie), sem player.
- `LogoMarca` — variant, tipo (lockup | icone | icone-sem-seta), size (= altura; ou `--logo-h` do pai), alt › #fallback.
  Lockup nunca abaixo de 72 px de altura.
- `BtnSeta` (botão principal, laranja) e `BtnContorno` (secundário) — to, href, type, disabled, block, blockCelular
  (largura total abaixo de 640), tom (auto | claro | petroleo); `BtnContorno` também compacto. Botão comum = `<VBtn>`.
- `LinkSeta` — to*. `SetaMini` — size (s | m), limite. `SetaMarca` — largura*, altura*. `CheckMarca` — o check da marca.

### Blocos (`src/components/blocos`)

- `SecaoBloco` — tom* (claro | petroleo), costura, sai, radial, radialAt, id, labelledby, wrap › provide `rtTom` e
  `rtCostura { chegou }`.
- `CosturaSecao` — rotulo* (um estado do lote, de `src/data/costuras.js`) › evento chegou.
- `TituloSecao` — rotulo, titulo*, nivel (1 = H1 da página, com tabindex -1 e a seta de cabeçalho), id, lead.
- `EspinhaPassos` — passos* ([{ titulo, texto, lottie, rotulo? }]), entrada, saida, tom, nivel.
- `RegrasVozAlta` — regras, compacto, nivel. `ComparativoWhatsapp` — linhas, tom. `FechoDuplo` — titulo, compacto, nivel.
- `FotoSecao` — nome*, sizes, eager. `FichaEmpresa` — titulo, linhas › slot padrão (ação) e #valor.
- `ScanConferencia` — carimbo*: o scan da conferência com o selo. `HeroRepasse` — o hero da Home.

### Loja (`src/components/lote`)

- `CardCategoria` — categoria*, eager, sizes, referencia, seloAnimado, seloPoster › expõe tocarSelo, posterSelo.
- `GradeCatalogo` — categorias*, filtros, aguardarCostura, limite, eager, sizes › slot #vazio · evento contagem.
- `FiltroLotes` — v-model { categoria, condicao } (null = todas), grupos.
- `EstadoVazio` — alertaTo, nivel › evento limpar. `EtiquetaLote` — lote, checks (a prévia do Quero vender).
  `PreviaPedido` — linhas* (o pedido do Quero comprar). CSS das duas em `etiqueta.css`.

### Formulários (`src/components/form`)

- `CampoForm` — id*, rotulo*, obrigatorio, dica, erro. O erro do campo é desenhado aqui, não no `VMessages` do Vuetify.
- `EscolhaChips` — id*, rotulo*, opcoes*, v-model, multiplo, obrigatorio, dica, erro.
- `AceiteTermos` — id*, v-model (Boolean), erro.
- `EnvioForm` — estado*, url, semDocs, pendente, anuncio, descritoPor, outroTexto › evento outro.
- `EstadoEnvio` — estado* (montando | pronto | bloqueado | erro), url, outroTexto, outroTo, festa.
- `FormVender` (categoria) e `FormComprar` (categoria, alerta, marca, condicao): fecham no WhatsApp com `[VENDER]` e
  `[COMPRAR]`, com a linha do aceite dos Termos. O fluxo comum está em `useEnvioWhatsapp`.

### Layout (`src/components/layout`)

`SiteHeader` (versão dividida dentro do hero da Home), `MenuCelular`, `SiteFooter`, `BotaoWhatsappFixo`,
`AvisoPendencias`, `LinkPular`, `DocLegal` (titulo*, vigencia*, secoes) e `VoltarSumario`. Layouts de página que se
repetem ficam no `base.css` (`.g-trilha`, `.conf-g`, `.conf-side`, `.conf-selo`).

## Animações (Lottie)

- **Fonte:** `scripts/lottie-gerar.mjs`. Cada animação é escrita em código como uma função de papel → cor, o que gera as
  variantes normal e `-invertida` (para fundo petróleo) do mesmo desenho, com as cores do `paleta.js`. `npm run
  lottie:gerar` grava os JSON e o `manifest.json` em `src/assets/lottie/`. Não edite os JSON à mão: mude o script e gere
  de novo.
- **Manifest:** duração, quadros, quadro de poster, gatilho, loop, `marco` (quadro que o site espera, como o fim da
  varredura do scan), uso e as variantes que o site não pede.
- **Conferência** (`npm run lottie:check`, roda antes de todo build): cor só da paleta (±1 por canal), até 25 KB por
  arquivo, até 150 KB somando as variantes normais, sem expressão, texto, imagem, efeito ou gradiente, 30 fps, nenhuma
  tangente de easing fora de [0,1] e escala acima do valor final só no `enviado-sucesso` (pico entre 6% e 8%).
- **Uso:** só pelo `BrandLottie` (nunca `loadAnimation` fora dele); cor nunca por CSS; o nó do Lottie nunca recebe
  v-reveal, transição ou animação; no máximo 5 tocando ao mesmo tempo (`pedirVez`/`liberarVez` em `src/lib/lottie.js`);
  selo nunca toca fora da tela; selo parado é o `SeloEstatico`, não um Lottie só para ficar no poster.
- **Player:** o `lottie_light` (sem eval, compatível com a CSP) entra como `<script>` clássico (import com `?url`), não
  por `import()`: o navegador guarda a falha de um import dinâmico e nunca mais pede a mesma URL.
- O `play()` só anda 1 ou 2 quadros depois do pedido; peça CSS que precisa andar junto liga no `enterFrame`.

## Guardas do build

Plugins no `vite.config.js`:

- `verificarPendencias` → `listarPendencias(env)`: número de WhatsApp (formato e igual ao do `.env.production`, lido com o
  parser do próprio Vite em `scripts/lib/env-producao.mjs`), endereço do site em `https://domínio` (`VITE_SITE_URL` › `URL`
  da Netlify › `https://repassetech.com.br`), formato do e-mail, logo em `brand/`, `SITE.vigenciaDocs` + hash do texto
  dos documentos registrado em `SITE.versoesDocs`, `SITE.conferenciaImei` (`'todos'` ou `'amostra'`) e marcador literal de
  pendência (colchete + PREENCHER) em `src/`. Com `VITE_PERMITIR_PENDENCIAS=1` a falha vira aviso (homologação).
- `conferirCosturas`: todo rótulo de costura (`costura="…"`) tem de estar em `src/data/costuras.js` (O lote entra ·
  Conferindo · Conferido · Na loja · Negociando · Repassado; até 12 caracteres). Falha também na homologação.
- `conferirPublicacao`: `public/_headers` existe e a CSP do bloco `/*` contém o hash do `<script>` inline do `index.html`;
  `public/_redirects` tem a regra `/*  /index.html  200`.
- `htmlDoBuild`: theme-color, og:image absoluto, bloco `<noscript>` com os canais e, na homologação,
  `<meta name="rt-build" content="homologacao">`.
- `preCarregarNoHtml`: pré-carga da Poppins 700, da Inter 400 e do logo; os outros pesos só a partir de 1024 px; a foto
  da 1ª categoria vai num `<meta>` que o script inline usa quando a pessoa chega na Loja pelo celular.
- `servirComoNetlify`: o `npm run preview` aplica `_headers`, `_redirects`, brotli e ETag como a Netlify.

O `listarPendencias` lê comentários também: nunca escreva o marcador literal de pendência (colchete + PREENCHER) num
comentário de `src/`.

**Script inline do `index.html`:** qualquer mudança nele (até espaço ou comentário) muda o hash. Atualize o
`sha256-…` do `script-src` no `public/_headers` (o build falha e mostra o hash esperado). O `npm run preview` lê o
`_headers` quando sobe: depois de mexer nele, pare e rode de novo o `npm run preview`.

## Como trocar contato

- **WhatsApp e e-mail:** `VITE_WHATSAPP_NUMBER` (`55` + DDD + número, sem espaço nem traço) e `VITE_EMAIL_CONTATO` no
  `.env.production` e no `.env.development`. A troca entra no repositório com autor e data.
- **Instagram e Reclame Aqui:** `SITE.instagram` e `SITE.reclameAqui` em `src/config/site.js`.
- **Dados da empresa:** `SITE.titular`, `SITE.cnpj`, `SITE.cidade`, `SITE.uf` em `src/config/site.js`.
- Os canais e os dados da empresa aparecem nos documentos e entram no hash deles: trocar qualquer um é **versão nova dos
  documentos** (abaixo). O `npm run build` avisa.
- Nunca invente contato: o que não existe fica vazio (o e-mail vazio simplesmente não aparece).

## Vigência dos documentos

Privacidade (`PaginaPrivacidade.vue`), Termos (`PaginaTermos.vue`) e Política de repasse (`PaginaPoliticaRepasse.vue`)
têm uma versão só, em `SITE.vigenciaDocs`, e cada versão publicada tem o hash do texto registrado em `SITE.versoesDocs`. A
mensagem do WhatsApp leva a linha do aceite com essa data ("Li e aceito os Termos de uso da Repasse Tech (versão de
DD/MM/AAAA)").

Mudou uma palavra dos documentos (ou um canal, um dado da empresa, o modo do IMEI):

1. Ponha a data nova em `SITE.vigenciaDocs` (`'AAAA-MM-DD'`).
2. Rode `node scripts/versao-docs.mjs` e acrescente a linha que ele mostra em `SITE.versoesDocs`
   (`'AAAA-MM-DD': '<hash>'`).
3. `npm run build` confere.

Nunca troque o hash de uma data que já foi ao ar: é a versão que as empresas aceitaram. Mudança só de marcação (tag,
classe, componente) não muda o hash; mudança de palavra muda.

## Conferência do IMEI

`SITE.conferenciaImei` diz como o IMEI é conferido: `'todos'` (um por um) ou `'amostra'` (por amostragem em cada lote).
Tudo o que o site diz sobre isso — selo, hero, passos, catálogo, Loja e Termos — sai de `src/data/conferencia-imei.js`.
Com `'amostra'`, o selo afirma só a nota ("NF conferida").

## Regras de conteúdo

- Nada inventado: número de lojistas, depoimentos, parceiros ou lote. A Loja é um catálogo de categorias, sem
  quantidade, preço, data nem código de lote.
- A Repasse Tech não é dona, não estoca, não recebe aparelho nem o dinheiro do lote.
- A conferência olha documentos: "nota de origem", "documentação de origem", nunca "origem conferida".
- Nenhum texto promete aviso automático de lote: o `?alerta=1` do Quero comprar é "Conte o que você procura".
- Selo de verificado nunca em prévia; código RT nunca em objeto físico (ilustração, foto).
- Foto: `<img>` com srcset, sizes, width e height (`FotoSecao`, `CardCategoria`), lazy fora da 1ª dobra, nunca no hero;
  alt e legenda nunca dizem que é a loja, a equipe ou o estoque da Repasse Tech. Origem e licença: `src/assets/fotos/`.
- Costura (a seta entre duas seções) só entre tons diferentes e sempre com um estado do lote como rótulo.
- Botão fixo de WhatsApp: quadrado de 56 px abaixo de 768, nunca por cima de controle nem de selo; o glifo do WhatsApp só
  nele, monocromático, nunca animado.
- "Uma vez por visita" só por `src/lib/visita.js`; chave nova guardada no sessionStorage = texto novo na Política de
  privacidade (hoje: `rt-hero-visto` e `rt-nudge`).

## Armadilhas conhecidas

- O CSS dos componentes do Vuetify chega em chunk carregado depois do `vuetify-overrides.css`: toda regra lá começa com
  `:root ` para vencer pela especificidade. Não ligue `$layers` (o `!important` do `.rounded-0` passaria a vencer).
  Pseudo-elemento dentro de `:is()` invalida a regra inteira.
- `VBtn`/`VCard` põem no próprio nó a classe do tema herdado: botão fora de bloco do tom usa a prop `tom`; peça sempre
  branca declara o contexto claro.
- Cor de `VAlert`/`VChip` fora do tema: o Vuetify calcula o texto como preto; fixe `color: var(--text) !important`.
- O `class: 'rt-btn'` dos defaults do `VBtn` soma com a classe passada: em teste, não selecione por `.rt-btn`.
- `VCard` recebe `rounded-0 !important` dos defaults: raio próprio precisa de `!important`. `VChipGroup` é slide-group (o
  gap vai em `.v-slide-group__content`).
- `VNavigationDrawer location="top"` precisa de `width` numérico (vira a altura).
- Erro de formulário nunca no `VMessages` (cada `.v-input__details` é `role="alert"`): `hide-details` + `:error`; a
  mensagem é do `CampoForm` e o resumo único é do `EnvioForm`.
- Páginas de formulário ficam em `<KeepAlive :include>` pelo nome do arquivo (`PaginaQueroVender`, `PaginaQueroComprar`):
  renomear a página desliga o "Voltar mantém o preenchido".
- Classe posta à mão (`classList`) no nó raiz de componente do Vuetify some quando ele se re-renderiza: estado visual por
  `:class`.
- SVG importado com `?inline` vira `data:` com aspas simples.
- CNPJ alfanumérico (IN RFB 2.229/2024): 12 posições [0-9A-Z] + 2 dígitos verificadores; valor do caractere = código
  ASCII − 48. O campo usa `inputmode="text"` e `autocapitalize="characters"`.
- Página que é porta de entrada (Home, Loja, Confiança) vai no chunk de entrada; as outras, sob demanda.
- Reveal por IntersectionObserver de item que pode ficar acima da tela antes da vez dele usa `rootMargin` de cima
  "infinito": o que já passou aparece sem transição.
- Alguns arquivos usam CRLF (entre eles `PaginaTermos.vue`, `HeroRepasse.vue`, `router/index.js` e `index.html`):
  preserve o fim de linha ao editar.
- Duração e atraso em JavaScript só por `ms('--token')`; os tokens de movimento valem 0 em `.rm`.
