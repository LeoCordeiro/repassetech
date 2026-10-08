<script setup>
// Sobre. Só o que a Repasse Tech confirma: sem foto de fundador, ano de fundação, nº de clientes ou história pessoal.
// Bloco abaixo da dobra com reveal padrão, um por vez.
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import TituloSecao from '@/components/blocos/TituloSecao.vue'
import FichaEmpresa from '@/components/blocos/FichaEmpresa.vue'
import BtnContorno from '@/components/marca/BtnContorno.vue'
import LinkSeta from '@/components/marca/LinkSeta.vue'
</script>

<template>
  <div class="pagina pag-sobre">
    <SecaoBloco tom="claro" labelledby="t-sobre">
      <TituloSecao id="t-sobre" :nivel="1" rotulo="Sobre" titulo="A gente conecta e confere. Quem vende e quem compra são vocês." />
      <div v-reveal class="sobre-txt">
        <p class="lead">
          Repasse de lote entre lojistas sempre existiu. Sobra parada de um lado, loja precisando repor do outro. Hoje isso
          roda em grupo de WhatsApp: qualquer número anuncia, nota fiscal aparece quando aparece, e quem compra confia na foto.
        </p>
        <p>
          A Repasse Tech organiza esse repasse com regra: só empresa com CNPJ ativo, lote só com nota fiscal, celular e tablet com chip só
          com IMEI, e conferência antes de publicar. Ela não compra, não revende e não estoca. Ganha uma comissão quando o
          repasse fecha.
        </p>
        <p class="sobre-mais"><LinkSeta to="/como-funciona">Ver como funciona</LinkSeta></p>
      </div>
    </SecaoBloco>

    <!-- borda seca, sem costura: a ficha da empresa não é estado do lote -->
    <SecaoBloco tom="petroleo" labelledby="t-sobre-emp">
      <div class="sobre-emp">
        <TituloSecao id="t-sobre-emp" rotulo="A empresa" titulo="Praia Grande, São Paulo">
          <div class="sobre-cta"><BtnContorno to="/contato" block-celular>Falar com a gente</BtnContorno></div>
        </TituloSecao>
        <div v-reveal><FichaEmpresa /></div>
      </div>
    </SecaoBloco>
  </div>
</template>

<style>
.pag-sobre .sobre-txt { max-width: var(--medida); margin-top: 24px; }
.pag-sobre .sobre-txt .lead { margin: 0; color: var(--text); }
.pag-sobre .sobre-txt p:not(.lead) { margin: 20px 0 0; color: var(--text-2); }
.pag-sobre .sobre-mais { margin-top: 28px !important; }
.pag-sobre .sobre-emp { display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px; }
.pag-sobre .sobre-cta { margin-top: 28px; }
@media (min-width: 1024px) {
  .pag-sobre .sobre-emp { grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 64px; align-items: start; }
}
</style>
