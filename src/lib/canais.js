// Canais oficiais de atendimento (rodapé, Contato): WhatsApp e e-mail do ambiente, Instagram e Reclame Aqui do site.js.
// A Política de repasse lista os mesmos canais em "Como reclamar".
import { SITE } from '../config/site.js'

export const linkInstagram = SITE.instagram ? `https://www.instagram.com/${SITE.instagram}/` : ''
export const linkReclameAqui = SITE.reclameAqui ? `https://www.reclameaqui.com.br/empresa/${SITE.reclameAqui}/` : ''
