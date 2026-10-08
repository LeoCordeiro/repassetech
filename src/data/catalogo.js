// Catálogo: os TIPOS de lote que circulam na Repasse Tech, um por foto do catálogo (src/assets/fotos/USO.md). Nenhum lote
// real aqui: sem quantidade, preço, data, código ou selo de "conferido" de um lote específico. Quantidade, condição e preço
// de cada lote real são informados pela equipe no WhatsApp, e o lote só é publicado depois da conferência (Termos,
// "O catálogo do site"). O selo do card é a REGRA de entrada da categoria (data/conferencia-imei.js).
//   imei: true = celular (com chip) · 'chip' = tablet (com chip leva IMEI, só Wi-Fi não) · false = sem IMEI
//   tipo/marca: o que o Quero vender (?tipo=) e o Quero comprar (?categoria=) já deixam escolhido
import { CONDICOES_LOTE } from './opcoes.js'
import { IMEI } from './conferencia-imei.js'

export const CATEGORIAS = [
  {
    id: 'iphone-seminovo', titulo: 'iPhone seminovo', frase: 'iPhone seminovo', grupo: 'celulares', imei: true, tipo: 'Celulares', marca: 'Apple',
    texto: 'iPhone que voltou de troca ou de devolução, revisado. A saúde da bateria vem informada por quem vende.',
    conds: ['Seminovo revisado'], foto: 'catalogo-iphone-seminovo',
  },
  {
    id: 'samsung-galaxy', titulo: 'Samsung Galaxy', frase: 'Samsung Galaxy', grupo: 'celulares', imei: true, tipo: 'Celulares', marca: 'Samsung',
    texto: 'Linha A e linha S de excesso de estoque e de modelo que saiu de catálogo, na caixa ou de mostruário.',
    conds: ['Novo lacrado', 'Open box'], foto: 'catalogo-samsung-galaxy',
  },
  {
    id: 'android-variados', titulo: 'Android de várias marcas', frase: 'Android de várias marcas', grupo: 'celulares', imei: true, tipo: 'Celulares', marca: null,
    texto: 'Lote misto de marcas e modelos: o estoque que parou numa loja e gira na outra.',
    conds: [...CONDICOES_LOTE], foto: 'catalogo-android-variados',
  },
  {
    id: 'lote-lacrado', titulo: 'Lote novo lacrado', frase: 'lote novo lacrado', grupo: 'celulares', imei: true, tipo: 'Celulares', marca: null,
    texto: 'Caixa fechada e em quantidade: sobra de compra, estoque que não girou, modelo que está saindo de linha.',
    conds: ['Novo lacrado'], foto: 'catalogo-caixas-lacradas',
  },
  {
    id: 'tablets', titulo: 'Tablets', frase: 'tablets', grupo: 'tablets', imei: 'chip', tipo: null, marca: null,
    texto: 'Tablet com chip (4G ou 5G) e só Wi-Fi, do modelo de entrada ao de caneta.',
    conds: [...CONDICOES_LOTE], foto: 'catalogo-tablets',
  },
  {
    id: 'acessorios', titulo: 'Acessórios', frase: 'acessórios', grupo: 'acessorios', imei: false, tipo: 'Acessórios', marca: null,
    texto: 'Cabo, carregador, capa, película e suporte em quantidade, na caixa ou de mostruário.',
    conds: ['Novo lacrado', 'Open box'], foto: 'catalogo-acessorios',
  },
  {
    id: 'audio', titulo: 'Áudio', frase: 'áudio', grupo: 'audio', imei: false, tipo: 'Áudio e vídeo', marca: null,
    texto: 'Fone de ouvido e caixa de som Bluetooth, na caixa ou de mostruário.',
    conds: ['Novo lacrado', 'Open box'], foto: 'catalogo-audio',
  },
  {
    id: 'open-box', titulo: 'Open box e seminovo revisado', frase: 'open box e seminovo revisado', grupo: 'celulares', imei: true, tipo: 'Celulares', marca: null,
    texto: 'Celular de mostruário, de devolução sem uso e de troca revisada, com a condição de cada lote declarada por quem vende.',
    conds: ['Open box', 'Seminovo revisado'], foto: 'catalogo-open-box',
  },
]

/** O sizes do <img> do card (1 coluna < 640, 2 de 640 a 1023, 4 a partir de 1024): o CardCategoria e o preload da 1ª foto
 * no HTML do build (vite.config) usam o mesmo, e o navegador escolhe a mesma largura nos dois. */
export const SIZES_CARD = '(max-width: 639px) calc(100vw - 44px), (max-width: 1023px) calc(50vw - 36px), 270px'

/** As 4 da prévia da Home (a Loja mostra as 8). */
export const DESTAQUES = ['iphone-seminovo', 'samsung-galaxy', 'tablets', 'acessorios'].map((id) => CATEGORIAS.find((c) => c.id === id))

export const categoriaPorId = (id) => CATEGORIAS.find((c) => c.id === id) || null

/** Documento que a categoria exige para entrar (requisito; o que a conferência confere é o selo, abaixo). */
export const documentoDe = (c) =>
  c.imei === true ? 'Nota fiscal e o IMEI de cada aparelho.' : c.imei === 'chip' ? 'Nota fiscal. Com chip (4G ou 5G), também o IMEI de cada aparelho.' : 'Nota fiscal.'
/** O selo do card: a regra de entrada, no modo da conferência do IMEI. Tablet: a nota vale para todos (o IMEI, só com chip). */
export const regraDe = (c) => (c.imei === true ? IMEI.regraEntrada : IMEI.regraEntradaNf)
export const regraExtensoDe = (c) => (c.imei === true ? IMEI.regraEntradaExtenso : IMEI.regraEntradaNfExtenso)

export const FILTROS = {
  categoria: {
    rotulo: 'Categoria',
    opcoes: [
      { texto: 'Todas', valor: null },
      { texto: 'Celulares', valor: 'celulares' },
      { texto: 'Tablets', valor: 'tablets' },
      { texto: 'Acessórios', valor: 'acessorios' },
      { texto: 'Áudio', valor: 'audio' },
    ],
  },
  condicao: {
    rotulo: 'Condição',
    opcoes: [{ texto: 'Todas', valor: null }, ...CONDICOES_LOTE.map((c) => ({ texto: c, valor: c }))],
  },
}
export const GRUPOS_FILTRO = Object.keys(FILTROS)

/** filtros: { categoria, condicao } com null = todas */
export const filtrarCategorias = (lista, f = {}) =>
  lista.filter((c) => (!f.categoria || c.grupo === f.categoria) && (!f.condicao || c.conds.includes(f.condicao)))

/** Destino do "Pedir um lote assim" (EstadoVazio): Quero comprar em "Conte o que você procura" (?alerta=1), com a condição. */
export function alertaPara(f = {}) {
  const query = { alerta: '1' }
  if (f.condicao) query.condicao = f.condicao
  return { path: '/quero-comprar', query }
}
