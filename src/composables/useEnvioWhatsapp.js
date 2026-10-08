/**
 * Fluxo de envio dos formulários Quero Vender / Quero Comprar.
 * Validação SÍNCRONA no próprio clique: o window.open precisa sair na mesma tarefa do gesto, senão o
 * bloqueador de pop-up barra. Nada vai para servidor: a mensagem abre no WhatsApp da pessoa.
 * Sem 'noopener' na feature string: com ele o window.open devolve null SEMPRE e o bloqueio não é detectável;
 * o opener é cortado na mão logo depois.
 * Erros: a regra de cada campo roda aqui, não no VForm. O erro aparece depois da 1ª tentativa de
 * envio (e no campo que a pessoa já preencheu e saiu) e acompanha a digitação; quem desenha é o CampoForm/EscolhaChips,
 * sem região viva por campo. No envio inválido sai UM anúncio ("Confira 3 campos. O primeiro é …") e o foco vai ao 1º.
 * Aceite dos Termos: campo obrigatório `aceite` no fim dos dois formulários (AceiteTermos) e a
 * linha LINHA_ACEITE ("Li e aceito os Termos de uso da Repasse Tech (versão de DD/MM/AAAA)") na mensagem, logo antes do rodapé.
 * "Mandar outro lote" / "Fazer outro pedido": o painel onde estava o foco some; o foco vai ao 1º campo.
 * Mexeu no formulário depois do "pronto" (ou do bloqueado/erro): o painel some e o envio volta ao começo — o "Abrir o
 * WhatsApp de novo" nunca reabre a mensagem velha com um dado que a pessoa já trocou.
 * Duplo clique, toque duplo ou Enter repetido no envio: a 1ª vez monta e abre; enquanto monta, as outras não fazem nada.
 */
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { montarMensagem } from '@/lib/whatsapp'
import { LINHA_ACEITE, whatsappPendente } from '@/config/site'
import { reduzirAgora } from './useReduzirMovimento'
import { erroCnpj, mascararCnpj, normalizarCnpj, posicaoNaMascara } from '@/lib/cnpj'
import { CONDICOES_LOTE, MARCAS_LOTE } from '@/data/opcoes'
import { ui } from '@/lib/ui'
import { ms } from '@/lib/motion'
import { lerPreco } from '@/lib/preco'

export { formatarPreco, lerPreco } from '@/lib/preco'

// a mesma lista dos filtros da loja (data/opcoes.js): o ?condicao= da loja entra no Quero comprar sem se perder
export const MARCAS = [...MARCAS_LOTE, 'Outra']
export const CONDICOES = CONDICOES_LOTE

export const vazio = (v) => (Array.isArray(v) ? v.length === 0 : v === null || v === undefined || String(v).trim() === '')
export const obrigatorio = (msg) => (v) => !vazio(v) || msg
export const inteiroMin1 = (msg) => (v) => (/^\d+$/.test(String(v ?? '').trim()) && Number(v) >= 1) || msg
export const precoValido = (msg) => (v) => lerPreco(v) > 0 || msg
/** Tamanho máximo dos campos de texto livre (maxlength): a mensagem inteira fica abaixo do teto do wa.me. */
export const MAX = { curto: 120, marca: 60, modelo: 300, obs: 500 }

/**
 * Bloco "Sua empresa", igual nos dois formulários: só o CNPJ é obrigatório (nome da loja é opcional). O CNPJ incompleto
 * diz quantos caracteres faltam; o completo que não confere diz isso (lib/cnpj.js).
 */
export const REGRAS_EMPRESA = { cnpj: [(x) => erroCnpj(x) || true] }
export const ORDEM_EMPRESA = ['cnpj']

/**
 * O que chega no campo de CNPJ (digitado ou colado) passa pela máscara sem jogar o cursor para o fim: ele volta para depois
 * do mesmo caractere que vale (lib/cnpj.js, posicaoNaMascara). O campo não tem maxlength: o navegador cortaria a colagem
 * (" 11.222.333/0001-81", "CNPJ: …") antes de a máscara limpar.
 */
export function mascararCampoCnpj(id, bruto, gravar) {
  const el = document.getElementById(id)
  const pos = el && document.activeElement === el && typeof el.selectionStart === 'number' ? el.selectionStart : null
  const antes = pos === null ? null : normalizarCnpj(String(bruto).slice(0, pos)).length
  const mascarado = mascararCnpj(bruto)
  gravar(mascarado)
  if (antes === null) return
  nextTick(() => {
    if (document.activeElement !== el) return
    const i = posicaoNaMascara(el.value, antes)
    el.setSelectionRange(i, i)
  })
}
/** Aceite dos Termos de uso: o último campo dos dois formulários. */
export const REGRAS_ACEITE = { aceite: [(v) => v === true || 'Marque que você leu e aceita os Termos de uso.'] }
export const ORDEM_ACEITE = ['aceite']

/** Foca o campo pelo id (o input do Vuetify recebe o id; grupo de chips: o marcado ou o 1º). */
export function focarCampo(id) {
  let el = document.getElementById(id)
  if (el && !el.matches('input, textarea, select, button')) el = el.querySelector('input:checked') || el.querySelector('input:not([type=hidden]), textarea, button')
  if (!el) return
  el.focus({ preventScroll: true })
  el.scrollIntoView({ block: 'center', behavior: reduzirAgora() ? 'instant' : 'smooth' })
}

/**
 * @param {{ form?: import('vue').Ref, tipo: 'VENDER'|'COMPRAR', ordem: string[], regras: Record<string, Function[]>,
 *   rotulos: Record<string, string>, valores: Record<string, any>, campos: () => Array<[string, any]>,
 *   resumo?: () => string, idDe?: (k: string) => string, inicial?: () => Record<string, any> }} p
 */
export function useEnvioWhatsapp({ tipo, ordem, regras, rotulos = {}, valores, campos, resumo, idDe = (k) => k, inicial = () => ({}) }) {
  const estado = ref('ocioso') // ocioso | montando | pronto | bloqueado (pop-up) | erro (não deu para montar)
  const router = useRouter()
  const url = ref('')
  const tentou = ref(false)
  const tocados = reactive({})
  const anuncio = ref('')
  let timer = 0

  /** 1ª regra que falha no campo, ou ''. */
  const falha = (k) => {
    for (const r of regras[k] || []) {
      const x = r(valores[k])
      if (x !== true) return x
    }
    return ''
  }
  /** Mensagem visível do campo: depois da 1ª tentativa, ou quando a pessoa já preencheu e saiu dele. */
  const erro = (k) => (tentou.value || tocados[k] ? falha(k) : '')
  /** blur com valor: a partir daí o campo mostra o próprio erro (CNPJ digitado errado não espera o envio). */
  const tocar = (k) => {
    if (!vazio(valores[k])) tocados[k] = true
  }
  /** aria-describedby do input: dica + erro do CampoForm. */
  const descricao = (k, id, dica = false) => [dica && `${id}-dica`, erro(k) && `${id}-erro`].filter(Boolean).join(' ') || undefined
  function anunciar(t) {
    anuncio.value = ''
    nextTick(() => (anuncio.value = t)) // mesmo texto duas vezes seguidas: esvazia antes para o leitor falar de novo
  }

  function enviar() {
    if (estado.value === 'montando') return
    const invalidos = ordem.filter((k) => falha(k))
    if (invalidos.length) {
      tentou.value = true
      const primeiro = rotulos[invalidos[0]] || invalidos[0]
      anunciar(invalidos.length === 1 ? `Confira o campo ${primeiro}.` : `Confira ${invalidos.length} campos. O primeiro é ${primeiro}.`)
      // foco e rolagem DEPOIS da pintura: dentro do handler, o layout forçado do scrollIntoView pesava
      // 133 ms no INP do envio vazio a CPU 8×; o anúncio já sai pela região viva
      requestAnimationFrame(() => setTimeout(() => focarCampo(idDe(invalidos[0]))))
      return
    }
    if (whatsappPendente) return // dev/homologação: o botão já está desabilitado; nunca abrir wa.me inválido
    let m
    try {
      m = montarMensagem(tipo, campos(), { resumo: resumo?.(), aceite: LINHA_ACEITE })
    } catch (err) {
      // nunca engolir: o clique sem resposta é o pior estado (era o URIError de emoji cortado ao meio)
      console.warn('[envio]', err)
      url.value = ''
      estado.value = 'erro'
      return
    }
    url.value = m.url
    const janela = window.open(m.url, '_blank')
    if (janela) janela.opener = null
    estado.value = 'montando'
    ui.formEnviado = true
    clearTimeout(timer)
    timer = setTimeout(() => (estado.value = janela ? 'pronto' : 'bloqueado'), ms('--dur-envio-min'))
  }
  // o formulário mudou depois do envio: o painel (pronto, bloqueado ou erro) some e o próximo envio monta a mensagem nova
  watch(valores, () => {
    if (estado.value !== 'pronto' && estado.value !== 'bloqueado' && estado.value !== 'erro') return
    estado.value = 'ocioso'
    url.value = ''
  })
  /** "Outro lote/pedido": o link limpa a query; o formulário volta ao início DEPOIS da navegação (props novas). */
  async function reiniciar() {
    clearTimeout(timer)
    await router.push({ query: {} }).catch(() => {})
    await nextTick()
    estado.value = 'ocioso'
    url.value = ''
    tentou.value = false
    anuncio.value = ''
    Object.keys(tocados).forEach((k) => delete tocados[k])
    Object.assign(valores, inicial())
    await nextTick()
    focarCampo(idDe(ordem[0]))
  }
  onBeforeUnmount(() => clearTimeout(timer))
  return { estado, url, enviar, reiniciar, whatsappPendente, erro, tocar, descricao, anuncio }
}
