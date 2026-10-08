<script setup>
// Termos de uso: o contrato de adesão das empresas cadastradas. A Política de repasse e intermediação faz parte deles
// (tu-oque) e repete com as mesmas palavras fechamento, comissão e desistência. O aceite expresso é a LINHA_ACEITE do
// site.js, mandada pelo WhatsApp com a data da versão (tu-quem). O método de conferência do IMEI sai de
// SITE.conferenciaImei (data/conferencia-imei.js). Nada de prometer "100% seguro".
// Mudou uma palavra daqui, da Privacidade ou da Política de repasse: versão nova (SITE.vigenciaDocs + SITE.versoesDocs).
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import DocLegal from '@/components/layout/DocLegal.vue'
import VoltarSumario from '@/components/layout/VoltarSumario.vue'
import { LINHA_ACEITE, SITE } from '@/config/site'
import { IMEI } from '@/data/conferencia-imei'

const SECOES = [
  { id: 'tu-oque', titulo: 'O que é a Repasse Tech' },
  { id: 'tu-quem', titulo: 'Quem pode usar e como entra' },
  { id: 'tu-lote', titulo: 'Regras do lote' },
  { id: 'tu-conf', titulo: 'O que a conferência faz e o que ela não garante' },
  { id: 'tu-resp', titulo: 'Responsabilidades de quem vende e de quem compra' },
  { id: 'tu-negocio', titulo: 'Negociação, pagamento e entrega' },
  { id: 'tu-comissao', titulo: 'Comissão e serviços' },
  { id: 'tu-limites', titulo: 'Limites de responsabilidade da Repasse Tech' },
  { id: 'tu-saida', titulo: 'Recusa, suspensão e saída' },
  { id: 'tu-catalogo', titulo: 'O catálogo do site' },
  { id: 'tu-site', titulo: 'Uso do site' },
  { id: 'tu-marca', titulo: 'Propriedade intelectual' },
  { id: 'tu-cdc', titulo: 'Relação entre empresas' },
  { id: 'tu-foro', titulo: 'Lei e foro' },
  { id: 'tu-vigencia', titulo: 'Vigência e alterações' },
]
</script>

<template>
  <div class="pagina">
    <SecaoBloco tom="claro">
      <DocLegal titulo="Termos de uso" :vigencia="SITE.vigenciaDocs" :secoes="SECOES">
        <h2 id="tu-oque">O que é a Repasse Tech</h2>
        <p>
          Repasse Tech é o nome fantasia de {{ SITE.titular }}, empresário individual, CNPJ {{ SITE.cnpj }}, com sede em
          {{ SITE.cidade }}/{{ SITE.uf }}. Ela faz a intermediação de repasse de lotes de celulares e eletrônicos entre
          empresas: apresenta quem vende a quem compra e confere a documentação do lote antes de publicar.
        </p>
        <p>
          A Repasse Tech <strong>não compra, não revende, não estoca e não é dona</strong> da mercadoria. A compra e
          venda é um contrato entre o vendedor e o comprador. A Repasse Tech não é parte desse contrato, não recebe a
          mercadoria e não recebe o dinheiro do lote.
        </p>
        <p>
          A <RouterLink to="/politica-de-repasse">Política de repasse e intermediação</RouterLink> faz parte destes
          termos. Ela detalha quem pode participar, o que pode ser repassado, como o lote é conferido e publicado, como o
          repasse é fechado e o que acontece em caso de desistência, divergência ou suspensão. Se algum ponto dela
          parecer diferente destes termos, valem estes termos. O tratamento de dados pessoais está na
          <RouterLink to="/privacidade">Política de privacidade</RouterLink>.
        </p>
        <p>
          Avisos sobre o cadastro, os lotes e estes termos são dados pelo WhatsApp da Repasse Tech. Os canais oficiais
          estão na seção "Como reclamar" da Política de repasse e intermediação.
        </p>

        <VoltarSumario />

        <h2 id="tu-quem">Quem pode usar e como entra</h2>
        <ul>
          <li>
            Só empresa com CNPJ ativo na Receita Federal, para vender, comprar ou as duas coisas. Pessoa física sem CNPJ
            e consumidor final não podem usar o serviço.
          </li>
          <li>
            O cadastro é feito pelo WhatsApp da Repasse Tech. Ele só vale depois que a sua empresa aceitar estes termos
            por escrito, mandando no WhatsApp a frase "{{ LINHA_ACEITE }}". Quem envia o formulário Quero vender ou
            Quero comprar com a caixa de aceite marcada já manda essa frase na mensagem.
          </li>
          <li>
            A data na frase é a da versão destes termos, que inclui a Política de repasse e intermediação. Cada repasse
            segue a versão em vigor no dia do fechamento.
          </li>
          <li>
            Quem faz o cadastro declara que pode representar a empresa e que os dados informados são verdadeiros. A
            Repasse Tech pode confirmar os dados por outro canal, como o telefone que aparece no cadastro do CNPJ.
          </li>
          <li>
            A Repasse Tech pode recusar um cadastro, por exemplo quando o CNPJ não está ativo ou quando os dados não
            conferem.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="tu-lote">Regras do lote</h2>
        <ul>
          <li>
            A nota fiscal de origem da mercadoria é obrigatória. É a nota que mostra como a mercadoria chegou ao
            vendedor.
          </li>
          <li>
            Em celular e tablet com chip, o vendedor informa o IMEI de cada aparelho. Tablet só Wi-Fi, acessórios e
            aparelhos de áudio e vídeo não têm IMEI: entram com a nota fiscal.
          </li>
          <li>
            Produto que precisa de homologação da Anatel só entra homologado, e o código de homologação aparece no
            anúncio do lote.
          </li>
          <li>A condição do lote (novo lacrado, open box ou seminovo revisado) é declarada pelo vendedor.</li>
          <li>
            Não entra:
            <ul>
              <li>aparelho com IMEI irregular, bloqueado ou com restrição (roubo, furto, perda ou extravio);</li>
              <li>IMEI adulterado, repetido ou que não confere com a nota;</li>
              <li>produto sem homologação da Anatel, quando ela é exigida;</li>
              <li>réplica ou falsificação;</li>
              <li>mercadoria sem nota fiscal ou de origem duvidosa.</li>
            </ul>
          </li>
          <li>
            O lote só é publicado depois da conferência. A lista completa do que pode e do que não pode ser repassado
            está na Política de repasse e intermediação.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="tu-conf">O que a conferência faz e o que ela não garante</h2>
        <p>Antes de publicar, a Repasse Tech confere:</p>
        <ul>
          <li>se o CNPJ do vendedor está ativo na Receita Federal;</li>
          <li>
            se a nota fiscal de origem existe, é válida e confere com o lote (modelos, quantidades e, quando houver,
            IMEIs);
          </li>
          <li>
            os IMEIs dos aparelhos, {{ IMEI.termos }}, na consulta pública de aparelho impedido por roubo, furto ou
            perda e na consulta de aparelho irregular da Anatel;
          </li>
          <li>se o produto que precisa de homologação da Anatel está homologado.</li>
        </ul>
        <p>
          A conferência é feita nos documentos e nas bases públicas disponíveis no dia. Ela
          <strong>não garante</strong>:
        </p>
        <ul>
          <li>
            o funcionamento, a qualidade, a bateria ou o estado do aparelho além do que o vendedor declarou. A Repasse
            Tech não vê nem testa a mercadoria;
          </li>
          <li>
            que a origem da mercadoria seja regular além do que os documentos conferidos mostram. Um documento falso bem
            feito, ou uma restrição registrada depois da conferência, pode não aparecer;
          </li>
          <li>a entrega, o pagamento ou o cumprimento do que vendedor e comprador combinarem.</li>
        </ul>
        <p>A conferência da Repasse Tech não substitui a conferência do comprador.</p>

        <VoltarSumario />

        <h2 id="tu-resp">Responsabilidades de quem vende e de quem compra</h2>
        <p><strong>O vendedor:</strong></p>
        <ul>
          <li>
            responde pela origem lícita da mercadoria e pela veracidade da nota fiscal, dos IMEIs e das informações do
            lote;
          </li>
          <li>
            garante que nenhum aparelho tem restrição de IMEI e que o produto é homologado pela Anatel quando a
            homologação é exigida;
          </li>
          <li>entrega o lote na condição declarada;</li>
          <li>avisa a Repasse Tech na hora se o lote mudar ou deixar de estar disponível;</li>
          <li>emite a nota fiscal de venda para o CNPJ do comprador e cuida dos tributos da venda;</li>
          <li>
            responde ao comprador por defeito oculto (vício redibitório) e também se a mercadoria for apreendida ou
            tiver que ser devolvida por problema de origem (evicção), nos termos do Código Civil;
          </li>
          <li>
            ressarce a Repasse Tech de qualquer prejuízo que ela tiver por informação falsa ou mercadoria irregular do
            lote, incluindo custos de processo.
          </li>
        </ul>
        <p><strong>O comprador:</strong></p>
        <ul>
          <li>
            confere a nota fiscal e, quando houver, os IMEIs antes de fechar, e confere a mercadoria quando receber;
          </li>
          <li>paga o vendedor no prazo combinado;</li>
          <li>
            reclama de defeito direto com o vendedor. Pelo Código Civil, o prazo para pedir devolução ou desconto por
            defeito oculto em mercadoria é, em regra, de 30 dias da entrega, se vendedor e comprador não combinarem
            outro;
          </li>
          <li>
            avisa a Repasse Tech se o lote recebido não bater com o anunciado, para ela mediar, como diz a Política de
            repasse e intermediação.
          </li>
        </ul>
        <p><strong>Os dois:</strong></p>
        <ul>
          <li>usam os dados recebidos da outra parte só para esse negócio;</li>
          <li>não repassam a terceiros as informações da loja e dos pedidos.</li>
        </ul>

        <VoltarSumario />

        <h2 id="tu-negocio">Negociação, pagamento e entrega</h2>
        <ul>
          <li>
            Preço, prazo, frete e condições são combinados entre vendedor e comprador. A negociação passa pela Repasse
            Tech, mas ela não decide por nenhuma das partes.
          </li>
          <li>
            O repasse está <strong>concluído</strong> (fechado) quando vendedor e comprador confirmam por escrito, na
            conversa com a Repasse Tech, o lote, a quantidade, o preço, as condições e a comissão.
          </li>
          <li>
            O pagamento é feito direto do comprador para o vendedor, entre as contas das empresas (Pix, boleto ou
            transferência). A Repasse Tech não recebe nem guarda o dinheiro do lote e pode recusar repasse com pagamento
            em dinheiro vivo.
          </li>
          <li>
            A Repasse Tech nunca pede que o dinheiro do lote seja pago a ela ou a outra pessoa. Se alguém pedir isso em
            nome dela, não pague e avise a Repasse Tech pelos canais oficiais.
          </li>
          <li>
            Entrega, frete e risco do transporte são combinados entre vendedor e comprador. A Repasse Tech não recebe,
            não guarda e não transporta mercadoria.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="tu-comissao">Comissão e serviços</h2>
        <ul>
          <li>
            A comissão só é devida sobre repasse concluído. Negociação que não chega ao fechamento não paga comissão.
          </li>
          <li>
            Quando a Repasse Tech apresenta vendedor e comprador, ela informa por escrito, pelo WhatsApp, o valor ou
            percentual da comissão daquele repasse, quem paga (o vendedor, o comprador ou os dois), o prazo e a forma de
            pagamento. Essas condições são aceitas por escrito antes do fechamento. Sem esse aceite, a Repasse Tech não
            fecha o repasse.
          </li>
          <li>Para cada comissão, a Repasse Tech emite nota fiscal de serviço.</li>
          <li>Se uma das partes desistir depois do fechamento, a comissão continua devida por quem desistiu.</li>
          <li>
            Se o repasse for desfeito por culpa do vendedor (documento falso, IMEI com restrição, mercadoria diferente
            da declarada), a comissão inteira fica por conta do vendedor.
          </li>
          <li>
            Se um vendedor e um comprador que se conheceram pela Repasse Tech fecharem negócio direto entre eles, sem
            ela, em até 12 meses depois da apresentação, a comissão é devida nas condições informadas na apresentação,
            como se o repasse tivesse passado pela Repasse Tech.
          </li>
          <li>
            Serviços opcionais, como destaque de lote, alertas e conferência avançada, quando oferecidos, têm o preço
            informado por escrito antes da contratação e só são cobrados de quem contratar.
          </li>
          <li>As demais regras de cancelamento e desistência estão na Política de repasse e intermediação.</li>
        </ul>

        <VoltarSumario />

        <h2 id="tu-limites">Limites de responsabilidade da Repasse Tech</h2>
        <ul>
          <li>
            A Repasse Tech responde pelo serviço dela: conferir a documentação como descrito acima e intermediar o
            contato.
          </li>
          <li>
            Ela não responde por:
            <ul>
              <li>qualidade, funcionamento ou estado da mercadoria;</li>
              <li>atraso ou falta de entrega;</li>
              <li>falta de pagamento;</li>
              <li>tributos da compra e venda;</li>
              <li>garantia do aparelho;</li>
              <li>informação falsa dada por vendedor ou comprador;</li>
              <li>lote que não vende ou pedido que não encontra lote.</li>
            </ul>
          </li>
          <li>
            Quando a Repasse Tech tiver que indenizar algum prejuízo ligado a um repasse, a indenização fica limitada ao
            valor da comissão que ela recebeu naquele repasse. Ela não inclui o lucro que a empresa deixou de ter nem
            prejuízo indireto.
          </li>
          <li>Esses limites não valem para dano que a Repasse Tech causar de propósito ou por culpa grave.</li>
        </ul>

        <VoltarSumario />

        <h2 id="tu-saida">Recusa, suspensão e saída</h2>
        <ul>
          <li>
            A Repasse Tech pode recusar ou tirar da loja qualquer lote que não cumpra estes termos ou que tenha sinal
            de irregularidade, como preço muito abaixo do mercado, documento que não confere ou IMEI com restrição.
          </li>
          <li>
            Ela pode também advertir, suspender ou excluir o cadastro de quem descumprir estes termos ou a Política de
            repasse e intermediação, e comunicar suspeita de crime à polícia. Os motivos e o procedimento estão na
            Política de repasse e intermediação.
          </li>
          <li>
            Viu um lote com problema? Avise pelo WhatsApp da Repasse Tech. Ela analisa e, se for o caso, tira o lote da
            loja.
          </li>
          <li>
            Sua empresa pode encerrar o cadastro quando quiser, pelo WhatsApp. A comissão de repasse já concluído
            continua devida.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="tu-catalogo">O catálogo do site</h2>
        <p>
          A loja do site público é um <strong>catálogo</strong>: as categorias que aparecem nela são os tipos de lote
          que circulam na Repasse Tech, com a condição aceita e o documento que cada um exige. O catálogo não é oferta e
          não mostra lote à venda: as fotos ilustram a categoria e não são da mercadoria de nenhum lote.
        </p>
        <p>
          Quantidade, condição e preço de cada lote real são informados pela equipe da Repasse Tech no WhatsApp, e os
          lotes reais são apresentados só a empresas cadastradas. O lote real só é publicado depois da conferência.
        </p>

        <VoltarSumario />

        <h2 id="tu-site">Uso do site</h2>
        <p>
          Os formulários do site só montam uma mensagem e abrem o WhatsApp. O site não envia nada à Repasse Tech: a
          mensagem só chega a ela quando você envia no WhatsApp, e a conversa segue os termos de uso do WhatsApp. O
          tratamento de dados está descrito na <RouterLink to="/privacidade">Política de privacidade</RouterLink>.
        </p>

        <VoltarSumario />

        <h2 id="tu-marca">Propriedade intelectual</h2>
        <p>
          A marca Repasse Tech, o logotipo, os textos e o visual do site são de uso exclusivo do titular da Repasse
          Tech. Não podem ser copiados ou usados sem autorização.
        </p>

        <VoltarSumario />

        <h2 id="tu-cdc">Relação entre empresas</h2>
        <p>
          O serviço é contratado por empresas, para a atividade comercial delas: quem compra, compra para revender ou
          para usar no próprio negócio. Por isso, em regra, a relação é regida pelo Código Civil, e não pelo Código de
          Defesa do Consumidor. Se a lei do consumidor for aplicada a algum caso, ela prevalece sobre o que for
          diferente nestes termos.
        </p>

        <VoltarSumario />

        <h2 id="tu-foro">Lei e foro</h2>
        <p>
          Estes termos seguem a lei brasileira. Fica eleito o foro da comarca de {{ SITE.cidade }}/{{ SITE.uf }}, sede
          da Repasse Tech, para resolver qualquer questão sobre eles.
        </p>

        <VoltarSumario />

        <h2 id="tu-vigencia">Vigência e alterações</h2>
        <p>
          Estes termos e a Política de repasse e intermediação valem a partir da data da versão no topo da página.
          Quando mudarem, a nova versão é publicada aqui, com a nova data, e as empresas cadastradas são avisadas pelo
          WhatsApp pelo menos 15 dias antes de a mudança valer. Quem não concordar pode encerrar o cadastro sem custo.
          Repasse concluído segue a versão em vigor no dia do fechamento.
        </p>
        <VoltarSumario />
      </DocLegal>
    </SecaoBloco>
  </div>
</template>
