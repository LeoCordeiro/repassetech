// prefers-reduced-motion ao vivo: ref reativa + classe .rm no <html> (o JS não obedece a mídia do CSS sozinho).
import { readonly, ref } from 'vue'
import { limparTokens } from '@/lib/motion'

const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
const reduzir = ref(Boolean(mq?.matches))

function aplicar(v) {
  reduzir.value = v
  document.documentElement.classList.toggle('rm', v)
  limparTokens() // os tokens de movimento valem 0 sob .rm: o cache do ms() não pode guardar o valor velho
}
if (mq) {
  aplicar(mq.matches)
  mq.addEventListener('change', (e) => aplicar(e.matches))
}

/** Valor do momento, para ler na hora de tocar. */
export const reduzirAgora = () => reduzir.value

export function useReduzirMovimento() {
  return readonly(reduzir)
}
