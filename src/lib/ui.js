// Estado de interface compartilhado entre peças que não são pai/filho (nudge precisa saber de menu, hero e envio).
import { reactive } from 'vue'

export const ui = reactive({
  menuAberto: false,
  heroAnimando: false,
  formEnviado: false,
  ctasHero: false, // os CTAs do hero estão na tela (o botão fixo espera eles saírem)
})
