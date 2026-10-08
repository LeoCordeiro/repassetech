<script setup>
// Contato. Uma seção clara, sem costura, sem Lottie (o nudge não dispara aqui: useNudge).
// Os quatro canais oficiais: WhatsApp (número de VITE_WHATSAPP_NUMBER), e-mail (SITE.email), Instagram e Reclame Aqui
// (site.js). Sem formulário genérico, horário de atendimento ou endereço com rua (não divulgados).
// O cartão de atendimento usa o desenho da ficha do Sobre (FichaEmpresa).
// Sem botão fixo de WhatsApp aqui: o "Chamar no WhatsApp" do cartão já está na tela.
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import FichaEmpresa from '@/components/blocos/FichaEmpresa.vue'
import BtnSeta from '@/components/marca/BtnSeta.vue'
import LinkSeta from '@/components/marca/LinkSeta.vue'
import { SITE, whatsappPendente } from '@/config/site'
import { formatarWhatsapp, linkContato } from '@/lib/whatsapp'
import { linkInstagram, linkReclameAqui } from '@/lib/canais'

const href = whatsappPendente ? undefined : linkContato('Contato')
const dados = [
  ['WhatsApp', whatsappPendente ? 'Ainda não configurado' : formatarWhatsapp()],
  ...(SITE.email ? [['E-mail', SITE.email]] : []),
  ...(linkInstagram ? [['Instagram', `@${SITE.instagram}`]] : []),
  ...(linkReclameAqui ? [['Reclame Aqui', 'Página da Repasse Tech']] : []),
  ['Razão social', SITE.titular],
  ['CNPJ', SITE.cnpj],
  ['Cidade', `${SITE.cidade}/${SITE.uf}`],
]
</script>

<template>
  <div class="pagina pag-contato">
    <SecaoBloco tom="claro" labelledby="t-contato">
      <TituloSecao
        id="t-contato"
        :nivel="1"
        rotulo="Contato"
        titulo="Fale com a gente pelo WhatsApp."
        lead="É por lá que a Repasse Tech atende, recebe os dados do lote e responde pedido de reposição. E-mail, Instagram e Reclame Aqui também são canais oficiais."
      />
      <div class="ct-g">
        <FichaEmpresa class="ct-card" titulo="Atendimento" :linhas="dados">
          <BtnSeta :href="href" :disabled="whatsappPendente" target="_blank" rel="noopener" tom="claro" block-celular>Chamar no WhatsApp<span class="vh"> (abre em outra aba)</span></BtnSeta>
          <p v-if="whatsappPendente" class="legenda ct-dica">Falta o número de WhatsApp: o botão fica desligado até ele chegar.</p>
          <template #valor="{ rotulo, valor }">
            <a v-if="rotulo === 'E-mail'" :href="`mailto:${valor}`">{{ valor }}</a>
            <a v-else-if="rotulo === 'Instagram'" class="ct-ig" :href="linkInstagram" target="_blank" rel="noopener">
              <VIcon icon="$rtInstagram" :size="18" aria-hidden="true" />{{ valor }}<span class="vh"> (abre em outra aba)</span>
            </a>
            <a v-else-if="rotulo === 'Reclame Aqui'" :href="linkReclameAqui" target="_blank" rel="noopener">{{ valor }}<span class="vh"> (abre em outra aba)</span></a>
            <template v-else>{{ valor }}</template>
          </template>
        </FichaEmpresa>
        <ul class="ct-atalhos" aria-label="Atalhos">
          <li>
            <p class="h3">Tem lote parado?</p>
            <LinkSeta to="/quero-vender">Quero vender</LinkSeta>
          </li>
          <li>
            <p class="h3">Precisa repor?</p>
            <LinkSeta to="/quero-comprar">Quero comprar</LinkSeta>
          </li>
          <li>
            <p class="h3">Quer reclamar ou avisar de um lote suspeito?</p>
            <LinkSeta :to="{ path: '/politica-de-repasse', hash: '#pr-reclamar' }">Ver como reclamar</LinkSeta>
          </li>
        </ul>
      </div>
    </SecaoBloco>
  </div>
</template>

<style>
.pag-contato .ct-g { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; margin-top: 40px; }
.pag-contato .v-card.ct-card { max-width: none; }
.pag-contato .ct-dica { margin: 10px 0 0; }
/* o link da linha da ficha: alvo de 44 px sem mudar a altura da linha (a margem negativa devolve o que o padding soma) */
.pag-contato .ct-card dd a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin-block: -12px; color: var(--c-petroleo); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.pag-contato .ct-ig .v-icon { flex: none; color: var(--c-petroleo); }
.pag-contato .ct-atalhos { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; align-content: start; }
.pag-contato .ct-atalhos li { display: grid; gap: 10px; justify-items: start; padding: 20px 0; border-top: 1px solid var(--border); }
.pag-contato .ct-atalhos li:last-child { border-bottom: 1px solid var(--border); }
.pag-contato .ct-atalhos .h3 { margin: 0; }
@media (min-width: 1024px) {
  .pag-contato .ct-g { grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: 64px; }
}
</style>
