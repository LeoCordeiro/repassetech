<script setup>
/**
 * Faixa do que falta para o site sair. Só em dev ou build com VITE_PERMITIR_PENDENCIAS=1, e só
 * quando há pendência. Quem lê a homologação pode não ser técnico: texto do negócio, nunca nome de variável. Recolhida numa linha
 * de 36 px (o resumo abre a lista): com a lista aberta ela empurrava a página e mudava as medidas da 1ª tela entre dev e
 * produção. Cobre o que o build cobra (número, logo, vigência, conferência do IMEI); os marcadores de texto pendente
 * aparecem na própria página.
 */
import { conferenciaImeiPendente, mostrarPendencias, vigenciaPendente, whatsappPendente } from '@/config/site'

const logos = import.meta.glob('/brand/logo.{svg,png}', { eager: true, query: '?url', import: 'default' })
const itens = [
  whatsappPendente && 'Falta o número de WhatsApp da Repasse Tech: os formulários e o botão de WhatsApp ficam desligados.',
  !Object.keys(logos).length && 'Falta a logo oficial (pasta brand/).',
  vigenciaPendente && 'Falta a data de vigência da Política de privacidade, dos Termos de uso e da Política de repasse.',
  conferenciaImeiPendente && 'Falta dizer como o IMEI é conferido (em todo aparelho ou numa parte de cada lote): o selo e os textos da conferência dependem disso.',
].filter(Boolean)
const resumo = itens.length === 1 ? '1 pendência nesta versão de teste' : `${itens.length} pendências nesta versão de teste`
</script>

<template>
  <div v-if="mostrarPendencias && itens.length" class="aviso-pend ctx-petroleo" role="note" aria-label="Pendências">
    <details class="wrap aviso-pend__in">
      <summary>{{ resumo }}</summary>
      <ul>
        <li v-for="i in itens" :key="i">{{ i }}</li>
      </ul>
    </details>
  </div>
</template>

<style>
.aviso-pend { background: var(--c-petroleo-profundo); color: var(--c-branco); }
.aviso-pend__in { padding-block: 0; }
.aviso-pend summary { display: flex; align-items: center; min-height: 36px; font: 500 12px/1.3 var(--ff-t); letter-spacing: .06em; cursor: pointer; }
.aviso-pend summary:focus-visible { outline: 3px solid var(--c-branco); outline-offset: -3px; }
.aviso-pend ul { margin: 0; padding: 0 0 10px 18px; display: grid; gap: 4px; font: 400 13px/1.4 var(--ff-c); }
@media (max-width: 639px) { .aviso-pend summary { font-size: 11px; letter-spacing: .03em; } }
</style>
