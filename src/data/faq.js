// FAQ. Respostas SÓ do que a Repasse Tech confirmou e dos Termos. Pergunta sem resposta confirmada fica fora (publicar:false).
// As duas respostas sobre IMEI moram com os outros textos do IMEI (data/conferencia-imei.js).
import { IMEI } from './conferencia-imei.js'
export const FAQ = [
  { pergunta: 'A Repasse Tech compra o meu lote?', resposta: 'Não. A Repasse Tech não compra, não revende e não estoca mercadoria. Ela conecta quem vende com quem compra e confere a documentação no meio.', publicar: true },
  { pergunta: 'Preciso ter CNPJ?', resposta: 'Sim. Só entra empresa com CNPJ ativo, tanto pra vender quanto pra comprar.', publicar: true },
  { pergunta: 'Lote sem nota fiscal entra na loja?', resposta: 'Não. Sem nota fiscal, o lote não é publicado.', publicar: true },
  { pergunta: 'Por que a Repasse Tech pede o IMEI de cada aparelho?', resposta: IMEI.faqPorQue, publicar: true },
  { pergunta: 'Que tipo de lote entra?', resposta: IMEI.faqQueLote, publicar: true },
  { pergunta: 'Quem define o preço?', resposta: 'Quem vende informa o preço por unidade. Vendedor e comprador negociam pela Repasse Tech.', publicar: true },
  { pergunta: 'Quanto custa?', resposta: 'A comissão só é cobrada no repasse fechado.', publicar: false }, // percentual ainda não definido
  { pergunta: 'O site mostra os lotes à venda?', resposta: 'Não. O site mostra as categorias de lote que circulam na Repasse Tech. Quantidade, condição e preço de cada lote real são informados pela equipe no WhatsApp, e os lotes são mostrados só a empresas cadastradas, depois da conferência.', publicar: true },
  { pergunta: 'Vocês atendem fora de Praia Grande?', resposta: '', publicar: false },
  { pergunta: 'Quem paga a comissão?', resposta: '', publicar: false },
  { pergunta: 'Quanto tempo leva a conferência?', resposta: '', publicar: false },
  { pergunta: 'Tem mensalidade?', resposta: '', publicar: false },
]
