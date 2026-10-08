# Licenças — material de terceiro no site Repasse Tech

Tudo em `src/assets/` é de autoria própria (Lottie: `lottie/LICENSES.md`; ilustrações: `ilustracoes/README.md`), **exceto**
os itens abaixo. Material de terceiro novo entra nesta tabela antes de entrar no site: fonte, versão, URL, licença e onde é
usado.

| Material | Fonte | Versão | Licença | Onde é usado |
|---|---|---|---|---|
| Glifo do WhatsApp (path SVG, `viewBox 0 0 24 24`) | pacote npm [`simple-icons`](https://simpleicons.org), arquivo `icons/whatsapp.svg` (conferido em `https://cdn.jsdelivr.net/npm/simple-icons@16.34.0/icons/whatsapp.svg` em 08/10/2026) | 16.34.0 | CC0-1.0 (o pacote) | alias `$rtWhats` em `src/plugins/vuetify.js` → ícone do botão fixo de WhatsApp (`BotaoWhatsappFixo.vue`) |
| Glifo do Instagram (path SVG, `viewBox 0 0 24 24`) | pacote npm [`simple-icons`](https://simpleicons.org), arquivo `icons/instagram.svg` (conferido em `https://cdn.jsdelivr.net/npm/simple-icons@16.34.0/icons/instagram.svg` e em `https://unpkg.com/simple-icons@16.34.0/icons/instagram.svg` em 08/10/2026, o mesmo path nos dois) | 16.34.0 | CC0-1.0 (o pacote) | alias `$rtInstagram` em `src/plugins/vuetify.js` → link do perfil @repasse_tech no rodapé (`SiteFooter.vue`) e no Contato (`PaginaContato.vue`) |
| 12 fotos de banco (WebP, 3 larguras cada) | Unsplash e Pexels — autor, página original e data de cada uma em [`fotos/CREDITOS.md`](fotos/CREDITOS.md); onde cada uma entra: [`fotos/USO.md`](fotos/USO.md) | — | Unsplash License / Pexels License (uso comercial sem atribuição obrigatória) | catálogo da Loja e da Home (`src/data/catalogo.js`) e fotos de seção (`src/data/fotos.js`) |

**Sobre as marcas WhatsApp e Instagram.** O CC0 cobre o arquivo do `simple-icons`, não a marca: os dois glifos são marcas
registradas da Meta, e o uso segue as diretrizes de marca de cada uma (o próprio `simple-icons` aponta as fontes:
`https://about.meta.com/brand/resources/whatsapp/whatsapp-brand` e `https://about.meta.com/brand/resources/instagram/instagram-brand/`).
O site usa cada glifo **só** como ícone do link que leva ao canal (a conversa no WhatsApp, o perfil no Instagram),
**monocromático** (`currentColor`, na cor do texto ou branco sobre o petróleo), sem alterar a forma, sem animar o glifo (o
pulso de atenção do botão de WhatsApp é um Lottie separado, em volta dele), sem juntar com a logo da Repasse Tech e sem
sugerir parceria ou endosso da Meta. Se a Meta mudar as diretrizes, o ícone sai e fica só o texto.

**Sobre as marcas nas fotos.** As licenças cobrem a fotografia, não as marcas que aparecem nos aparelhos e nas caixas
(Apple, Samsung, Sony e outras). As fotos ilustram a categoria do produto e a situação de trabalho; nenhum texto, legenda
ou `alt` diz que são da loja, da equipe ou do estoque da Repasse Tech, nem sugere parceria com essas marcas.

Nenhum outro arquivo, ícone, imagem ou fonte de terceiro foi copiado para `src/` — as fontes Poppins e Inter vêm do
`@fontsource` (OFL-1.1) como dependência npm, fora desta pasta.
