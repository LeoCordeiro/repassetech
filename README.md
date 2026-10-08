# Repasse Tech — site

Site da **Repasse Tech** (Praia Grande/SP, CNPJ 55.524.103/0001-42), que conecta lojistas de celulares e eletrônicos
com CNPJ para o repasse de lotes: de um lado, o lote parado; do outro, a reposição. A Repasse Tech confere a nota fiscal
e o IMEI antes de o lote entrar na loja.

O site explica como o repasse funciona, mostra o catálogo das categorias de lote que circulam (Loja), recebe os pedidos
de quem quer vender e de quem quer comprar e publica a Política de privacidade, os Termos de uso e a Política de
repasse. Os formulários montam a mensagem e abrem o WhatsApp oficial da Repasse Tech: nada é enviado para servidor, o
site não usa cookies nem carrega script de terceiros.

## Stack

- [Vue 3](https://vuejs.org) + [Vuetify 3](https://vuetifyjs.com) + vue-router 4 (endereços com `#`: `https://domínio/#/loja`)
- [Vite 6](https://vite.dev) — servidor de desenvolvimento, build e servidor local do build
- lottie-web (player `lottie_light`, carregado sob demanda) para as animações da marca
- Fontes Poppins e Inter auto-hospedadas (`@fontsource`): nenhuma requisição ao Google
- Site estático: sem backend e sem banco de dados. Hospedagem na Netlify

## Requisitos

- Node.js 24 (a mesma versão do build na Netlify, definida no `netlify.toml`) e npm
- O `.npmrc` desliga os scripts de instalação de dependências (`ignore-scripts=true`): o projeto não depende deles

## Como rodar

```bash
npm ci
npm run dev
```

O site abre em `http://localhost:5190`. Para usar outra porta: `npm run dev -- --port 5173`.

Rotas: `/`, `/como-funciona`, `/loja`, `/quero-vender`, `/quero-comprar`, `/confianca`, `/sobre`, `/contato`,
`/privacidade`, `/termos` e `/politica-de-repasse` (o endereço antigo `/vitrine` leva à `/loja`). Endereço que não existe
mostra "Página não encontrada". Só no modo de desenvolvimento existe a bancada de componentes, em `/#/_componentes`.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (porta 5190) |
| `npm run build` | confere as animações (`lottie:check`) e gera o site em `dist/`, com as guardas de publicação |
| `npm run preview` | serve o `dist/` como a Netlify serve: cabeçalhos do `public/_headers`, regras do `public/_redirects` e compressão |
| `npm test` | testes de unidade: preço, mensagem do WhatsApp, CNPJ, textos da conferência do IMEI, versão dos documentos e leitura do `.env.production` |
| `npm run lottie:check` | confere as animações de `src/assets/lottie` (cores, tamanho, estrutura) |
| `npm run lottie:gerar` | gera de novo as animações a partir de `scripts/lottie-gerar.mjs` |
| `node scripts/versao-docs.mjs` | mostra a versão dos documentos e o hash do texto atual |
| `node scripts/conferir-deploy.mjs https://domínio` | confere o site publicado (ver "Depois de publicar") |

## Build

`npm run build` **falha de propósito** quando falta um dado oficial ou quando algo publicaria o site quebrado:

- número de WhatsApp ausente, fora do formato `55` + DDD + número, ou diferente do número oficial do `.env.production`;
- endereço do site fora do formato `https://domínio` (sem barra no fim) — ele é usado na imagem de compartilhamento;
- e-mail de contato fora do formato;
- logo ausente em `brand/`;
- vigência dos documentos fora do formato `AAAA-MM-DD`, ou texto da Privacidade, dos Termos ou da Política de repasse
  diferente do que foi registrado para essa vigência;
- modo da conferência do IMEI não definido;
- marcador de dado pendente esquecido em `src/`;
- rótulo de transição entre seções fora da lista de estados do lote;
- `public/_headers` ausente, sem o hash do script inline do `index.html` na CSP, ou `public/_redirects` sem a regra
  `/*  /index.html  200`.

A mensagem de erro diz o que falta. Para gerar uma versão de homologação mesmo com pendências:
`VITE_PERMITIR_PENDENCIAS=1 npm run build` — o erro vira aviso, uma faixa no topo lista o que falta e o HTML ganha
`<meta name="rt-build" content="homologacao">`. **Nunca** use essa variável no ambiente de produção.

## Deploy na Netlify

1. Na Netlify, crie um projeto importando um repositório existente (*Import an existing project*) e escolha este
   repositório.
2. O comando de build (`npm run build`), a pasta publicada (`dist`) e a versão do Node (24) já estão no `netlify.toml`:
   não é preciso preencher nada na tela de configuração do build.
3. Variáveis de ambiente: os dados oficiais (WhatsApp e e-mail) ficam versionados no `.env.production`, então nenhuma
   variável é obrigatória no painel.
   - Opcional: `VITE_SITE_URL=https://seu-dominio` (sem barra no fim), o endereço usado na imagem de compartilhamento.
     Sem ela, vale a variável `URL` que a própria Netlify define no build (o endereço principal do site) e, na falta
     dela, `https://repassetech.com.br`.
   - Se `VITE_WHATSAPP_NUMBER` for criada no painel, ela tem de ser igual à do `.env.production`, senão o build falha.
   - **Nunca** crie `VITE_PERMITIR_PENDENCIAS` no painel.
4. Domínio: em *Domain management*, adicione o domínio e siga as instruções de DNS da Netlify. O HTTPS é automático.
5. Deixe **desligados** no painel: **Analytics, Forms, Identity, Split Testing e Snippet injection**. O site não tem
   formulário de servidor, login, cookies nem script de terceiros, e a Política de privacidade diz isso. O Split Testing
   grava cookie, e o Snippet injection altera o HTML: o hash do script inline deixa de bater com a CSP e o site para de
   funcionar.

Os cabeçalhos HTTP (CSP, HSTS, cache) estão em `public/_headers`. A regra que faz `domínio/quero-vender` (endereço sem o
`#`) abrir o site está em `public/_redirects`.

### Depois de publicar

```bash
node scripts/conferir-deploy.mjs https://seu-dominio
```

Confere no site no ar: o número de WhatsApp embutido no código é o oficial; os cabeçalhos de segurança chegaram iguais
aos do `public/_headers` e a CSP aceita o script inline; nenhuma resposta grava cookie; nenhum script vem de outro
domínio; o build é de produção (não de homologação); a imagem de compartilhamento responde; cache e compressão; ícones e
manifesto; e o endereço com caminho. Sai com código diferente de 0 se algo reprovar. Para conferir um build local antes
de publicar, rode `npm run build && npm run preview` e, em outro terminal,
`node scripts/conferir-deploy.mjs http://localhost:4173 --origem https://seu-dominio`.

### Acesso às contas

Quem tem acesso ao repositório, ao painel da Netlify ou ao registro do domínio consegue mudar o site — inclusive o
número de WhatsApp que recebe os pedidos. Use verificação em duas etapas nas três contas e mantenha o acesso restrito.

## Mais informações

- Estrutura do código, paleta e tokens, componentes, animações, guardas do build e como atualizar contatos e
  documentos: [`DESENVOLVIMENTO.md`](DESENVOLVIMENTO.md).
- Origem e licença das fotos: [`src/assets/fotos/CREDITOS.md`](src/assets/fotos/CREDITOS.md). Material de terceiros:
  [`src/assets/LICENSES.md`](src/assets/LICENSES.md). Animações: autoria própria
  ([`src/assets/lottie/LICENSES.md`](src/assets/lottie/LICENSES.md)).
- A logo em `brand/` é da Repasse Tech: use só os arquivos oficiais, sem redesenhar nem recolorir.
