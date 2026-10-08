<script setup>
// Política de repasse e intermediação: o regulamento operacional do repasse. Faz parte dos Termos de uso (tu-oque) e diz
// o mesmo que eles, com as mesmas palavras: conferência (tu-conf), fechamento e pagamento (tu-negocio), comissão e
// desistência (tu-comissao), suspensão (tu-saida). Prazos de guarda iguais aos da Privacidade (pp-tempo).
// O método de conferência do IMEI sai de SITE.conferenciaImei (data/conferencia-imei.js), como nos Termos.
// Canais: VITE_WHATSAPP_NUMBER, VITE_EMAIL_CONTATO (SITE.email), SITE.instagram e SITE.reclameAqui (site.js).
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import DocLegal from '@/components/layout/DocLegal.vue'
import VoltarSumario from '@/components/layout/VoltarSumario.vue'
import { SITE, marcaPendente, whatsappPendente } from '@/config/site'
import { IMEI } from '@/data/conferencia-imei'
import { formatarWhatsapp } from '@/lib/whatsapp'

const whats = whatsappPendente ? marcaPendente('número de WhatsApp') : formatarWhatsapp()
const SECOES = [
  { id: 'pr-oque', titulo: 'Para que serve esta política' },
  { id: 'pr-quem', titulo: 'Quem pode participar' },
  { id: 'pr-pode', titulo: 'O que pode ser repassado' },
  { id: 'pr-nao', titulo: 'O que não pode ser repassado' },
  { id: 'pr-cadastro', titulo: 'Como o lote é cadastrado' },
  { id: 'pr-conferencia', titulo: 'O que a Repasse Tech confere' },
  { id: 'pr-limites', titulo: 'O que a conferência não garante' },
  { id: 'pr-loja', titulo: 'Loja: publicação e retirada' },
  { id: 'pr-negociacao', titulo: 'Negociação e fechamento' },
  { id: 'pr-entrega', titulo: 'Entrega e pagamento' },
  { id: 'pr-comissao', titulo: 'Comissão e serviços opcionais' },
  { id: 'pr-cancelamento', titulo: 'Cancelamento e desistência' },
  { id: 'pr-divergencia', titulo: 'Lote entregue diferente do anunciado' },
  { id: 'pr-suspensao', titulo: 'Suspensão e exclusão' },
  { id: 'pr-registros', titulo: 'Registros da conferência' },
  { id: 'pr-reclamar', titulo: 'Como reclamar' },
  { id: 'pr-mudancas', titulo: 'Mudanças nesta política' },
]
</script>

<template>
  <div class="pagina">
    <SecaoBloco tom="claro">
      <DocLegal titulo="Política de repasse e intermediação" :vigencia="SITE.vigenciaDocs" :secoes="SECOES">
        <h2 id="pr-oque">Para que serve esta política</h2>
        <p>
          Esta política é o regulamento do repasse na Repasse Tech: quem pode participar, o que pode ser repassado, como
          o lote é conferido e publicado, como o negócio é fechado e o que acontece quando algo dá errado. Ela faz parte
          dos <RouterLink to="/termos">Termos de uso</RouterLink> e vale para toda empresa cadastrada, como vendedora,
          compradora ou as duas coisas. Se algum ponto parecer diferente dos Termos de uso, valem os Termos de uso.
        </p>
        <p>
          A Repasse Tech é intermediária: apresenta quem vende a quem compra e confere a documentação do lote. Ela
          <strong>não compra, não revende, não estoca e não é dona</strong> da mercadoria, não recebe a mercadoria e não
          recebe o dinheiro do lote. A compra e venda é feita direto entre o vendedor e o comprador.
        </p>

        <VoltarSumario />

        <h2 id="pr-quem">Quem pode participar</h2>
        <ul>
          <li>Empresa com CNPJ ativo na Receita Federal. Pessoa física sem CNPJ e consumidor final não participam.</li>
          <li>A empresa pode se cadastrar para vender, para comprar ou para as duas coisas.</li>
          <li>
            O cadastro é feito pelo WhatsApp da Repasse Tech e só vale depois do aceite por escrito dos Termos de uso,
            que incluem esta política (veja "Quem pode usar e como entra", nos Termos de uso).
          </li>
          <li>
            Quem faz o cadastro precisa poder representar a empresa. A Repasse Tech pode confirmar os dados por outro
            canal, como o telefone que aparece no cadastro do CNPJ, e pode recusar o cadastro quando o CNPJ não está
            ativo ou os dados não conferem.
          </li>
          <li>Se o CNPJ deixar de estar ativo, o cadastro fica suspenso até a situação ser regularizada.</li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-pode">O que pode ser repassado</h2>
        <p>
          Lotes de celulares e eletrônicos que a empresa tem e pode vender com nota fiscal, como estoque que não gira,
          open box, devolução revisada, excesso de estoque e linha descontinuada. Cada lote precisa ter:
        </p>
        <ul>
          <li>
            <strong>nota fiscal de origem</strong>, que mostra como a mercadoria chegou ao vendedor: a nota de compra
            emitida para o CNPJ do vendedor ou, em aparelho comprado de consumidor, a nota de entrada emitida pelo
            próprio vendedor;
          </li>
          <li><strong>IMEI de cada aparelho</strong>, em celular e tablet com chip;</li>
          <li>
            <strong>código de homologação da Anatel</strong>, em produto que precisa de homologação. O código aparece no
            anúncio do lote;
          </li>
          <li>
            <strong>condição declarada pelo vendedor</strong>: novo lacrado, open box ou seminovo revisado. Em seminovo,
            o vendedor informa também o que pesa no preço, como a saúde da bateria.
          </li>
        </ul>
        <p>
          Tablet só Wi-Fi, acessórios e aparelhos de áudio e vídeo não têm IMEI: entram com a nota fiscal e, quando a
          Anatel exige, com a homologação.
        </p>

        <VoltarSumario />

        <h2 id="pr-nao">O que não pode ser repassado</h2>
        <ul>
          <li>mercadoria sem nota fiscal de origem, ou com nota que não confere com o lote;</li>
          <li>aparelho com IMEI irregular, bloqueado ou com restrição por roubo, furto, perda ou extravio;</li>
          <li>aparelho com IMEI adulterado, repetido, ilegível ou diferente do que está na nota;</li>
          <li>produto sem homologação da Anatel, quando ela é exigida;</li>
          <li>réplica, falsificação ou produto que imita a marca de outro fabricante;</li>
          <li>aparelho com bloqueio de conta (iCloud ou conta Google) ainda ativo;</li>
          <li>
            mercadoria de origem duvidosa, por exemplo: preço muito abaixo do mercado sem explicação, CNPJ aberto há pouco
            tempo com muita mercadoria, ou vendedor que não mostra os documentos pedidos.
          </li>
        </ul>
        <p>Na dúvida, a Repasse Tech recusa o lote. Suspeita de crime pode ser comunicada à polícia.</p>

        <VoltarSumario />

        <h2 id="pr-cadastro">Como o lote é cadastrado</h2>
        <ul>
          <li>
            O vendedor manda o lote pelo WhatsApp da Repasse Tech. O formulário Quero vender do site monta essa mensagem
            pronta.
          </li>
          <li>
            Na conversa, o vendedor manda a nota fiscal de origem (arquivo ou foto legível, com a chave de acesso), a
            lista de IMEIs, com um IMEI por aparelho com chip, o código de homologação, quando exigido, e, se quiser,
            fotos do lote.
          </li>
          <li>
            Nome e CPF de pessoa física que aparecem na nota, como na nota de entrada de aparelho comprado de consumidor,
            devem vir cobertos. Se a conferência precisar deles, a Repasse Tech pede, usa só para conferir e não repassa
            ao comprador.
          </li>
          <li>O vendedor responde pelo que declara: modelos, quantidades, condição e preço.</li>
          <li>
            Lote com documento faltando fica parado até o documento chegar. Quando o lote é recusado, a Repasse Tech
            avisa o vendedor pelo WhatsApp.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-conferencia">O que a Repasse Tech confere</h2>
        <p>Antes de publicar, a Repasse Tech confere:</p>
        <ul>
          <li>o CNPJ do vendedor: se está ativo na Receita Federal;</li>
          <li>
            a nota fiscal de origem: se existe e é válida, pela chave de acesso, e se confere com o lote (modelos,
            quantidades e, quando houver, IMEIs);
          </li>
          <li>
            os IMEIs dos aparelhos com chip, {{ IMEI.termos }}, na consulta pública de aparelho impedido por roubo,
            furto ou perda e na consulta de aparelho irregular da Anatel;
          </li>
          <li>a homologação da Anatel, quando o produto precisa dela.</li>
        </ul>
        <p>
          Em tablet só Wi-Fi, acessório e aparelho de áudio e vídeo, que não têm IMEI, a conferência é da nota fiscal e,
          quando exigida, da homologação. Cada conferência fica registrada com a data e o resultado (veja "Registros da
          conferência").
        </p>

        <VoltarSumario />

        <h2 id="pr-limites">O que a conferência não garante</h2>
        <p>
          A conferência é feita nos documentos e nas bases públicas disponíveis no dia. A Repasse Tech não vê, não recebe
          e não testa a mercadoria. Por isso a conferência <strong>não garante</strong>:
        </p>
        <ul>
          <li>que os aparelhos funcionam, nem a qualidade, a bateria ou o estado deles além do que o vendedor declarou;</li>
          <li>
            a procedência da mercadoria além do que os documentos conferidos mostram. Um documento falso bem feito, ou
            uma restrição registrada depois da conferência, pode não aparecer;
          </li>
          <li>
            que o lote entregue seja igual ao anunciado, nem a entrega, o pagamento ou o cumprimento do que vendedor e
            comprador combinarem.
          </li>
        </ul>
        <p>
          A conferência da Repasse Tech não substitui a do comprador: ele confere a nota, os IMEIs e a mercadoria ao
          receber.
        </p>

        <VoltarSumario />

        <h2 id="pr-loja">Loja: publicação e retirada</h2>
        <ul>
          <li>
            O lote só entra na loja depois da conferência. A loja com os lotes reais é só para empresa
            cadastrada; o site público mostra só o catálogo dos tipos de lote que circulam (veja "O catálogo do site", nos
            Termos de uso).
          </li>
          <li>
            O anúncio mostra marca, modelo, quantidade, condição declarada pelo vendedor, preço e, quando exigido, o
            código de homologação da Anatel. O selo do anúncio diz o que foi conferido naquele lote.
          </li>
          <li>
            Lote destacado, quando esse serviço for oferecido, passa pela mesma conferência e segue as mesmas regras de
            qualquer lote. O destaque não muda o que a conferência faz nem garante venda.
          </li>
          <li>
            O vendedor pode tirar o lote da loja quando quiser, antes do fechamento. Se o lote mudar ou deixar de
            estar disponível, ele avisa na hora.
          </li>
          <li>
            A Repasse Tech tira o lote da loja quando ele é vendido, quando o vendedor pede ou quando o lote deixa de
            cumprir esta política. Se ela receber aviso com indício de irregularidade, o lote sai da loja em até 1 dia
            útil, enquanto ela confere.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-negociacao">Negociação e fechamento</h2>
        <ul>
          <li>
            O comprador mostra interesse num lote ou pede uma reposição pelo WhatsApp da Repasse Tech. O formulário
            Quero comprar do site monta essa mensagem pronta.
          </li>
          <li>
            A Repasse Tech apresenta vendedor e comprador e acompanha a negociação na conversa dela no WhatsApp. Essa
            conversa é a ponte do repasse: o que for combinado fica registrado ali.
          </li>
          <li>
            Ao apresentar as partes, a Repasse Tech informa por escrito a comissão daquele repasse (veja "Comissão e
            serviços opcionais").
          </li>
          <li>
            Antes de fechar, o comprador pode ver a nota fiscal de origem e a lista de IMEIs do lote, com os dados de
            pessoa física cobertos. Ao cadastrar o lote, o vendedor autoriza a Repasse Tech a mostrar esses documentos ao
            comprador interessado.
          </li>
          <li>
            Preço, quantidade, prazo, frete e condições são combinados entre vendedor e comprador. A Repasse Tech não
            decide por nenhuma das partes.
          </li>
          <li>
            O repasse está <strong>concluído</strong> (fechado) quando vendedor e comprador confirmam por escrito, na
            conversa com a Repasse Tech, o lote, a quantidade, o preço, as condições e a comissão.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-entrega">Entrega e pagamento</h2>
        <ul>
          <li>
            Depois do fechamento, entrega e pagamento são feitos direto entre vendedor e comprador, do jeito que os dois
            combinaram.
          </li>
          <li>
            O pagamento vai da conta da empresa compradora para a conta da empresa vendedora, por Pix, boleto ou
            transferência. A Repasse Tech pode recusar repasse com pagamento em dinheiro vivo.
          </li>
          <li>
            A Repasse Tech não recebe, não guarda e não transporta a mercadoria, nem para conferir. Também não recebe,
            não guarda e não repassa o dinheiro do lote.
          </li>
          <li>
            A Repasse Tech nunca pede que o dinheiro do lote seja pago a ela ou a outra pessoa. Se alguém pedir isso em
            nome dela, é golpe: não pague e avise pelos canais de "Como reclamar".
          </li>
          <li>O vendedor emite a nota fiscal de venda para o CNPJ do comprador e cuida dos tributos da venda.</li>
          <li>Frete, seguro e risco do transporte são combinados entre as partes.</li>
          <li>O comprador confere o lote ao receber: quantidade, modelos, condição e IMEIs.</li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-comissao">Comissão e serviços opcionais</h2>
        <ul>
          <li>
            A comissão é o que a Repasse Tech cobra pela intermediação. Ela só é devida sobre repasse concluído:
            negociação que não chega ao fechamento não paga comissão.
          </li>
          <li>
            Em cada repasse, o valor ou percentual da comissão, quem paga (o vendedor, o comprador ou os dois), o prazo e
            a forma de pagamento são informados por escrito pelo WhatsApp da Repasse Tech, quando ela apresenta as
            partes, e aceitos por escrito antes do fechamento. Sem esse aceite, a Repasse Tech não fecha o repasse.
          </li>
          <li>A comissão é paga à Repasse Tech, que emite nota fiscal de serviço de cada comissão.</li>
          <li>
            Se um vendedor e um comprador que se conheceram pela Repasse Tech fecharem negócio direto entre eles, sem
            ela, em até 12 meses depois da apresentação, a comissão é devida nas condições informadas na apresentação,
            como se o repasse tivesse passado pela Repasse Tech.
          </li>
          <li>
            Serviços opcionais, como destaque de lote, alertas e conferência avançada: quando oferecidos, têm o preço
            informado por escrito antes da contratação e só são cobrados de quem contratar.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-cancelamento">Cancelamento e desistência</h2>
        <ul>
          <li>
            Antes do fechamento, qualquer parte pode desistir sem custo: o vendedor tira o lote da loja e o comprador
            desiste do pedido.
          </li>
          <li>Se uma das partes desistir depois do fechamento, a comissão continua devida por quem desistiu.</li>
          <li>
            Se o repasse for desfeito por culpa do vendedor (documento falso, IMEI com restrição, mercadoria diferente da
            declarada), a comissão inteira fica por conta do vendedor.
          </li>
          <li>
            Se vendedor e comprador combinarem desfazer o repasse depois do fechamento, sem culpa de nenhum dos dois, a
            comissão continua devida por quem ficou de pagar. A Repasse Tech pode dispensar essa comissão, por escrito.
          </li>
          <li>Quem desiste avisa a outra parte e a Repasse Tech por escrito, na mesma conversa.</li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-divergencia">Lote entregue diferente do anunciado</h2>
        <p>
          Se o lote que chegou não bate com o anunciado (quantidade, modelo, condição, IMEI ou nota), o comprador avisa a
          Repasse Tech assim que notar, de preferência no dia do recebimento, com fotos, a nota fiscal e a lista do que
          não confere.
        </p>
        <p><strong>O que a Repasse Tech faz:</strong></p>
        <ul>
          <li>ouve o comprador e o vendedor e pede as provas de cada lado;</li>
          <li>media uma solução entre os dois, como completar o lote, trocar aparelhos, dar desconto ou desfazer o negócio;</li>
          <li>registra o caso no histórico dos dois participantes;</li>
          <li>
            pode tirar da loja os outros lotes do vendedor enquanto analisa e, conforme o caso, advertir, suspender ou
            excluir o participante (veja "Suspensão e exclusão");
          </li>
          <li>comunica à polícia quando houver suspeita de crime.</li>
        </ul>
        <p><strong>O que a Repasse Tech não faz:</strong></p>
        <ul>
          <li>não devolve nem garante o dinheiro do lote, porque não recebe esse dinheiro;</li>
          <li>não troca nem conserta mercadoria, porque não recebe a mercadoria;</li>
          <li>não decide no lugar das partes nem garante o resultado da mediação.</li>
        </ul>
        <p>
          Quem responde ao comprador pela mercadoria é o vendedor: por defeito oculto (vício redibitório) e pela perda da
          mercadoria por problema de origem (evicção), nos termos do Código Civil. A mediação não muda os prazos nem os
          direitos que a lei dá ao comprador. Se o repasse for desfeito por culpa do vendedor, a comissão inteira fica por
          conta dele.
        </p>

        <VoltarSumario />

        <h2 id="pr-suspensao">Suspensão e exclusão</h2>
        <p>A Repasse Tech pode advertir, suspender ou excluir o participante que:</p>
        <ul>
          <li>mandar documento falso ou informação falsa sobre o lote ou sobre a empresa;</li>
          <li>anunciar mercadoria que não pode ser repassada;</li>
          <li>entregar lote diferente do anunciado de forma repetida ou de má-fé;</li>
          <li>não pagar a comissão no prazo combinado;</li>
          <li>fechar negócio por fora com quem conheceu pela Repasse Tech, para não pagar a comissão;</li>
          <li>passar a terceiros informações da loja ou dos pedidos;</li>
          <li>tentar enganar outro participante ou a Repasse Tech;</li>
          <li>ficar com o CNPJ inativo.</li>
        </ul>
        <p><strong>Como funciona:</strong></p>
        <ul>
          <li>
            A Repasse Tech avisa o motivo pelo WhatsApp e ouve a empresa antes de decidir. Com suspeita de crime ou risco
            para outros participantes, a suspensão pode ser imediata.
          </li>
          <li>Durante a suspensão, os lotes da empresa saem da loja e ela não fecha novos repasses.</li>
          <li>
            A exclusão encerra o cadastro. A Repasse Tech pode recusar novo cadastro da mesma empresa ou de quem a
            representa.
          </li>
          <li>Comissão de repasse já concluído continua devida.</li>
        </ul>

        <VoltarSumario />

        <h2 id="pr-registros">Registros da conferência</h2>
        <p>A Repasse Tech guarda, de cada lote e de cada repasse:</p>
        <ul>
          <li>a consulta do CNPJ, a nota fiscal de origem e a lista de IMEIs, com a data e o resultado de cada conferência;</li>
          <li>o código de homologação da Anatel, quando houver;</li>
          <li>a conversa do fechamento, com a comissão aceita, e o aceite dos Termos de uso de cada empresa;</li>
          <li>os casos de recusa por suspeita, divergência, suspensão e exclusão.</li>
        </ul>
        <p><strong>Por quanto tempo:</strong></p>
        <ul>
          <li>repasse concluído: 5 anos, contados do fim do ano em que o repasse foi concluído;</li>
          <li>lote recusado: 6 meses; se a recusa foi por suspeita de irregularidade, 5 anos;</li>
          <li>divergência, suspensão e exclusão: 5 anos, contados do encerramento do caso.</li>
        </ul>
        <p>
          Esses registros provam o que foi conferido e combinado. Eles podem ser mostrados à outra parte do repasse, no
          que for necessário, e a autoridades, quando houver ordem ou requisição legal ou para comunicar suspeita de
          crime. O tratamento desses dados segue a <RouterLink to="/privacidade">Política de privacidade</RouterLink>.
        </p>

        <VoltarSumario />

        <h2 id="pr-reclamar">Como reclamar</h2>
        <p>
          Para reclamar de um lote, de um participante ou da própria Repasse Tech, ou para avisar de um lote suspeito,
          use um destes canais:
        </p>
        <ul>
          <li><strong>WhatsApp:</strong> {{ whats }}</li>
          <li v-if="SITE.email"><strong>E-mail:</strong> <a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></li>
          <li v-if="SITE.instagram">
            <strong>Instagram:</strong>
            <a :href="`https://www.instagram.com/${SITE.instagram}/`" target="_blank" rel="noopener">@{{ SITE.instagram }}<span class="vh"> (abre em outra aba)</span></a>,
            por mensagem direta
          </li>
          <li v-if="SITE.reclameAqui">
            <strong>Reclame Aqui:</strong>
            <a :href="`https://www.reclameaqui.com.br/empresa/${SITE.reclameAqui}/`" target="_blank" rel="noopener">página da Repasse Tech<span class="vh"> (abre em outra aba)</span></a>
          </li>
        </ul>
        <p>
          Conte o que aconteceu, o lote (código ou modelo) e a data, e mande o que tiver de prova, como fotos, nota e
          conversa. A Repasse Tech responde pelo mesmo canal.
        </p>
        <p>
          Pedido sobre dados pessoais (acesso, correção, eliminação) segue a Política de privacidade, com resposta em até
          15 dias.
        </p>
        <p>
          Estes são os canais oficiais da Repasse Tech. Ela nunca pede senha, código de verificação do WhatsApp nem o
          dinheiro do lote, por nenhum canal.
        </p>

        <VoltarSumario />

        <h2 id="pr-mudancas">Mudanças nesta política</h2>
        <p>
          Esta política muda pelas mesmas regras dos Termos de uso: a nova versão é publicada aqui, com a nova data, e as
          empresas cadastradas são avisadas pelo WhatsApp pelo menos 15 dias antes de a mudança valer. Quem não concordar
          pode encerrar o cadastro sem custo. Repasse concluído segue a versão em vigor no dia do fechamento.
        </p>
        <VoltarSumario />
      </DocLegal>
    </SecaoBloco>
  </div>
</template>
