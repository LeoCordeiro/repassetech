<script setup>
// Política de privacidade: descreve o que o site e o atendimento fazem de fato. O site só monta a mensagem e abre o
// WhatsApp (lib/whatsapp.js), guarda 2 chaves no sessionStorage (lib/visita.js), não grava cookie, não carrega nada de
// terceiros e é hospedado no Netlify. Mudou o site (chave guardada nova, script de terceiro, outro host), muda o texto.
// Mudou uma palavra: versão nova (SITE.vigenciaDocs + SITE.versoesDocs). Prazos iguais aos da Política de repasse.
import SecaoBloco from '@/components/blocos/SecaoBloco.vue'
import DocLegal from '@/components/layout/DocLegal.vue'
import VoltarSumario from '@/components/layout/VoltarSumario.vue'
import { SITE, marcaPendente, whatsappPendente } from '@/config/site'
import { formatarWhatsapp } from '@/lib/whatsapp'

const whats = whatsappPendente ? marcaPendente('número de WhatsApp') : formatarWhatsapp()
const SECOES = [
  { id: 'pp-quem', titulo: 'Quem cuida dos seus dados' },
  { id: 'pp-site', titulo: 'O que o site coleta sozinho' },
  { id: 'pp-hospedagem', titulo: 'Hospedagem do site' },
  { id: 'pp-whats', titulo: 'O que você envia pelo WhatsApp e pelos outros canais' },
  { id: 'pp-uso', titulo: 'Para que os dados são usados' },
  { id: 'pp-compart', titulo: 'Com quem os dados são compartilhados' },
  { id: 'pp-fora', titulo: 'Dados fora do Brasil' },
  { id: 'pp-tempo', titulo: 'Por quanto tempo' },
  { id: 'pp-terceiros', titulo: 'Dados de outras pessoas' },
  { id: 'pp-direitos', titulo: 'Seus direitos' },
  { id: 'pp-seguranca', titulo: 'Segurança' },
  { id: 'pp-cookies', titulo: 'Cookies e armazenamento no navegador' },
  { id: 'pp-publico', titulo: 'Para quem é o serviço' },
  { id: 'pp-mudancas', titulo: 'Mudanças nesta política' },
]
</script>

<template>
  <div class="pagina">
    <SecaoBloco tom="claro">
      <DocLegal titulo="Política de privacidade" :vigencia="SITE.vigenciaDocs" :secoes="SECOES">
        <h2 id="pp-quem">Quem cuida dos seus dados</h2>
        <p>
          O responsável pelos seus dados (o controlador, na Lei Geral de Proteção de Dados, LGPD) é {{ SITE.titular }},
          empresário individual, CNPJ {{ SITE.cnpj }}, com sede em {{ SITE.cidade }}/{{ SITE.uf }}, que atua com o nome
          fantasia Repasse Tech.
        </p>
        <p>
          Para falar sobre os seus dados, use o WhatsApp {{ whats }}<template v-if="SITE.email"> ou o e-mail
          <a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a></template>.
        </p>
        <p>
          A Repasse Tech é agente de tratamento de pequeno porte e, como permite a Resolução CD/ANPD nº 2/2022, não
          indicou encarregado (DPO). O canal acima faz esse papel: recebe pedidos, dúvidas e reclamações sobre dados
          pessoais.
        </p>
        <p>
          Esta política vale para o site e para o atendimento da Repasse Tech pelo WhatsApp, pelo e-mail, pelo Instagram
          e pelo Reclame Aqui. O cadastro e o repasse seguem também os
          <RouterLink to="/termos">Termos de uso</RouterLink> e a
          <RouterLink to="/politica-de-repasse">Política de repasse e intermediação</RouterLink>.
        </p>

        <VoltarSumario />

        <h2 id="pp-site">O que o site coleta sozinho</h2>
        <p>
          O site não tem cadastro nem login, e não existe servidor da Repasse Tech recebendo formulário. Ele não coleta
          dado pessoal por conta própria.
        </p>
        <p>
          Os formulários Quero vender e Quero comprar montam o texto da mensagem no seu navegador e abrem o WhatsApp com
          essa mensagem pronta. O site não guarda o que você digita.
        </p>
        <p>
          Para abrir a conversa, o texto vai dentro do endereço do WhatsApp (wa.me). Ao abrir esse endereço, o texto
          pode passar pelos servidores do WhatsApp (Meta) antes mesmo de você enviar a mensagem, e o endereço com o
          texto fica no histórico do seu navegador. Nada chega à Repasse Tech até você enviar a mensagem no WhatsApp. Em
          computador usado por mais de uma pessoa, como o do balcão da loja, apague esse histórico se não quiser que
          outra pessoa veja o texto.
        </p>
        <p>
          O CNPJ digitado é conferido só pelo dígito verificador, no próprio navegador. O site não consulta a Receita
          Federal nem outro serviço.
        </p>
        <p>
          As fontes e as animações são servidas pelo próprio site. Ao carregar, a página não faz requisição a Google
          Fonts, a redes de anúncio, a ferramentas de estatística ou a outros serviços de terceiros. O que o provedor de
          hospedagem registra a cada acesso está na seção seguinte.
        </p>

        <VoltarSumario />

        <h2 id="pp-hospedagem">Hospedagem do site</h2>
        <p>
          O site é hospedado pelo Netlify, Inc., empresa dos Estados Unidos. Para entregar cada página, os servidores do
          Netlify recebem do seu navegador dados técnicos do acesso: o endereço IP, a data e a hora, a página pedida e a
          identificação do navegador e do sistema (user-agent). Esses registros servem para entregar o site, mantê-lo no
          ar e protegê-lo contra ataque e uso indevido. Base legal: legítimo interesse da Repasse Tech em manter o site
          funcionando e seguro (LGPD, art. 7º, IX).
        </p>
        <p><strong>O que a Repasse Tech controla:</strong></p>
        <ul>
          <li>o que o site pede ao seu navegador e o que guarda nele: só o que esta política descreve;</li>
          <li>não pôr no site estatística de visitas, cookie, pixel de anúncio nem programa de outra empresa;</li>
          <li>
            o uso dos registros de acesso: a Repasse Tech não os usa para identificar visitante, fazer estatística ou
            anúncio. Se precisar consultá-los, é só para investigar ataque ou uso indevido do site.
          </li>
        </ul>
        <p><strong>O que a Repasse Tech não controla:</strong></p>
        <ul>
          <li>
            por quanto tempo o Netlify guarda esses registros, em que país eles ficam e as medidas de segurança dele.
            Isso segue os termos e a
            <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener">política de privacidade do Netlify<span class="vh"> (abre em outra aba)</span></a>.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="pp-whats">O que você envia pelo WhatsApp e pelos outros canais</h2>
        <p>Quando você envia a mensagem montada pelo site, a Repasse Tech recebe:</p>
        <ul>
          <li>
            <strong>Quero vender:</strong> CNPJ, nome da loja (se você informar) e os dados do lote: tipo de mercadoria,
            marca, modelo, quantidade, condição, preço pretendido por unidade, a sua resposta sobre nota fiscal e sobre
            o IMEI de cada aparelho (quando o tipo de mercadoria tem IMEI), observações e, se você veio de uma categoria do
            catálogo, o nome dela.
          </li>
          <li>
            <strong>Quero comprar:</strong> CNPJ, nome da loja (se você informar) e os dados do pedido: marcas, modelos,
            quantidade, condições aceitas, valor máximo por unidade, prazo, categoria do catálogo usada como referência
            e observações.
          </li>
          <li><strong>Nos dois formulários:</strong> a frase de aceite dos Termos de uso, com a data da versão aceita.</li>
          <li>
            <strong>Dúvida sobre a documentação</strong> (no aviso do Quero vender): os dados do lote que você já
            preencheu.
          </li>
          <li><strong>Botão de WhatsApp do site:</strong> a página de onde você chamou, como "Loja".</li>
          <li>
            <strong>Sempre:</strong> o número de WhatsApp e o nome de perfil de quem envia, que o próprio aplicativo
            mostra.
          </li>
        </ul>
        <p>
          Depois, na conversa, você pode mandar mais dados, como foto da nota fiscal, lista de IMEIs e código de
          homologação. Esses dados seguem esta mesma política.
        </p>
        <p>Pelos outros canais, a Repasse Tech recebe o que você mandar e o que o próprio canal mostra:</p>
        <ul>
          <li><strong>E-mail:</strong> o endereço de e-mail, o nome que aparece nele, a mensagem e os anexos.</li>
          <li><strong>Instagram:</strong> o nome de usuário, o nome do perfil e a mensagem.</li>
          <li>
            <strong>Reclame Aqui:</strong> a reclamação e os dados que o Reclame Aqui informa à empresa para resolver o
            caso, como o nome e o contato de quem reclamou.
          </li>
        </ul>
        <p>
          O CNPJ de empresário individual e de MEI identifica uma pessoa. Por isso a Repasse Tech trata esses dados como
          dados pessoais.
        </p>

        <VoltarSumario />

        <h2 id="pp-uso">Para que os dados são usados</h2>
        <ul>
          <li>
            <strong>Responder ao seu contato e ao seu pedido.</strong> Base legal: procedimentos preliminares a um
            contrato, a seu pedido (LGPD, art. 7º, V).
          </li>
          <li>
            <strong>Fazer e manter o seu cadastro</strong> como vendedor, comprador ou os dois, e
            <strong>intermediar o repasse.</strong> Base legal: execução de contrato (art. 7º, V).
          </li>
          <li>
            <strong>Conferir</strong> CNPJ, nota fiscal, IMEI e homologação do lote antes de publicar, para evitar
            fraude e mercadoria de origem irregular. Base legal: legítimo interesse da Repasse Tech e das empresas que
            usam o serviço (art. 7º, IX).
          </li>
          <li>
            <strong>Mediar divergência entre vendedor e comprador</strong>, registrar o caso e, quando as regras forem
            descumpridas, suspender ou excluir o participante. Base legal: execução de contrato e legítimo interesse
            (art. 7º, V e IX).
          </li>
          <li>
            <strong>Responder a reclamação</strong>, inclusive no Reclame Aqui. Base legal: legítimo interesse e
            exercício regular de direitos (art. 7º, IX e VI).
          </li>
          <li>
            <strong>Cobrar a comissão e emitir a nota fiscal de serviço.</strong> Base legal: execução de contrato e
            cumprimento de obrigação legal (art. 7º, V e II).
          </li>
          <li>
            <strong>Guardar registros</strong> para atender autoridades e para se defender em processo. Base legal:
            obrigação legal e exercício regular de direitos (art. 7º, II e VI).
          </li>
          <li>
            <strong>Manter o site no ar e seguro</strong>, com os registros de acesso da hospedagem. Base legal:
            legítimo interesse (art. 7º, IX).
          </li>
        </ul>
        <p>
          Quando quem fala com a Repasse Tech é funcionário ou representante de uma empresa, os dados dele (como número,
          nome de perfil e e-mail) são usados com base no legítimo interesse (art. 7º, IX), só para tratar do negócio da
          empresa.
        </p>
        <p>
          A Repasse Tech não vende dados e não usa os seus dados para anúncio. Nenhuma decisão sobre cadastro, lote ou
          suspensão é tomada só por sistema automático.
        </p>

        <VoltarSumario />

        <h2 id="pp-compart">Com quem os dados são compartilhados</h2>
        <ul>
          <li>
            <strong>WhatsApp e Instagram (Meta):</strong> são canais da conversa. A Meta trata os dados conforme os
            termos e a política de privacidade dela.
          </li>
          <li>
            <strong>Reclame Aqui:</strong> se você reclamar por lá. A reclamação e a resposta ficam públicas no site do
            Reclame Aqui, pelas regras dele. Na resposta pública, a Repasse Tech não expõe dado pessoal nem detalhe de
            negócio de ninguém.
          </li>
          <li><strong>Netlify:</strong> os registros técnicos de acesso ao site (veja "Hospedagem do site").</li>
          <li><strong>Provedor do e-mail da Repasse Tech:</strong> guarda as mensagens enviadas ao e-mail de contato.</li>
          <li>
            <strong>Serviço de nuvem do aparelho de atendimento (Google Drive ou iCloud):</strong> só se a cópia de
            segurança das conversas do WhatsApp estiver ligada, e sempre com a criptografia de ponta a ponta do
            WhatsApp, que impede o serviço de nuvem de ler as conversas.
          </li>
          <li>
            <strong>A outra parte do negócio</strong> (vendedor ou comprador): só o necessário para fechar o repasse,
            como CNPJ, nome da loja, nota fiscal do lote e IMEIs.
          </li>
          <li><strong>Contador da Repasse Tech:</strong> os dados das notas fiscais de comissão.</li>
          <li>
            <strong>Autoridades</strong> (polícia, Justiça, Receita, Anatel): quando houver ordem ou requisição legal,
            ou quando a Repasse Tech comunicar suspeita de crime envolvendo um lote.
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="pp-fora">Dados fora do Brasil</h2>
        <p>Alguns desses serviços guardam ou processam dados em servidores fora do Brasil:</p>
        <ul>
          <li>
            <strong>Netlify, nos Estados Unidos:</strong> os registros técnicos de acesso. A transferência é necessária
            para entregar a página que o seu navegador pediu (LGPD, art. 33, IX, com o art. 7º, V).
          </li>
          <li>
            <strong>WhatsApp e Instagram (Meta) e o provedor do e-mail:</strong> as conversas e as mensagens que você
            escolhe mandar por esses canais. A transferência é necessária para atender o contato que você mesmo iniciou
            (art. 33, IX, com o art. 7º, V).
          </li>
          <li>
            <strong>Cópia de segurança das conversas, quando ligada:</strong> fica no serviço de nuvem do aparelho de
            atendimento, com criptografia de ponta a ponta, para não perder o registro do que foi combinado (art. 33,
            IX, com o art. 7º, V e VI).
          </li>
        </ul>

        <VoltarSumario />

        <h2 id="pp-tempo">Por quanto tempo</h2>
        <ul>
          <li><strong>Contato que não virou cadastro:</strong> até 6 meses depois da última mensagem.</li>
          <li>
            <strong>Cadastro:</strong> enquanto ele estiver ativo. Se você pedir para sair, os dados de contato são
            apagados em até 30 dias, menos o que precisa ser guardado pelos itens abaixo.
          </li>
          <li>
            <strong>Lote recusado:</strong> 6 meses. Se a recusa foi por suspeita de irregularidade (IMEI com restrição,
            nota que não confere, produto sem homologação), o registro da recusa fica guardado por 5 anos, para evitar
            nova tentativa e para defesa da Repasse Tech.
          </li>
          <li>
            <strong>Repasse concluído, conferência e nota fiscal da comissão:</strong> 5 anos, contados do fim do ano em
            que o repasse foi concluído. São o prazo fiscal e o prazo para defesa em processo.
          </li>
          <li>
            <strong>Reclamação, divergência entre lote anunciado e entregue, suspensão ou exclusão:</strong> 5 anos,
            contados do encerramento do caso.
          </li>
          <li><strong>Registros técnicos de acesso ao site:</strong> pelo prazo do Netlify (veja "Hospedagem do site").</li>
        </ul>
        <p>
          Os prazos valem para todos os canais. Depois deles, a Repasse Tech apaga os dados que guarda. O que foi
          publicado no Reclame Aqui segue as regras do Reclame Aqui.
        </p>

        <VoltarSumario />

        <h2 id="pp-terceiros">Dados de outras pessoas</h2>
        <p>
          Não mande dado pessoal de consumidor final, como nome, CPF ou telefone de cliente da sua loja, na mensagem ou
          nas fotos.
        </p>
        <p>
          Se a nota fiscal ou outro documento do lote tiver nome ou CPF de pessoa física (por exemplo, a nota de entrada
          de um aparelho comprado de um consumidor), cubra esses dados antes de enviar. Se a conferência precisar deles,
          a Repasse Tech pede, usa só para conferir e não repassa ao comprador.
        </p>

        <VoltarSumario />

        <h2 id="pp-direitos">Seus direitos</h2>
        <p>Pela LGPD (art. 18), você pode pedir:</p>
        <ul>
          <li>a confirmação de que a Repasse Tech trata seus dados;</li>
          <li>o acesso a eles e a correção;</li>
          <li>
            a anonimização, o bloqueio ou a eliminação do que for desnecessário ou tratado em desacordo com a lei;
          </li>
          <li>a portabilidade;</li>
          <li>a informação sobre com quem os dados foram compartilhados.</li>
        </ul>
        <p>Você também pode se opor a um tratamento quando ele não cumprir a lei.</p>
        <p>
          Faça o pedido pelo canal da seção "Quem cuida dos seus dados". A resposta sai em até 15 dias. Para proteger
          você e a sua empresa, a Repasse Tech pode pedir que você confirme que é o titular do dado ou que representa a
          empresa.
        </p>
        <p>
          Alguns dados podem continuar guardados depois de um pedido de eliminação, quando a lei exigir ou para defesa
          em processo (veja "Por quanto tempo"). Você também pode reclamar à Autoridade Nacional de Proteção de Dados
          (ANPD).
        </p>

        <VoltarSumario />

        <h2 id="pp-seguranca">Segurança</h2>
        <p>A Repasse Tech usa medidas de segurança proporcionais ao porte dela:</p>
        <ul>
          <li>
            o WhatsApp de atendimento fica num aparelho só da empresa, protegido por senha e com verificação em duas
            etapas;
          </li>
          <li>as contas de atendimento (WhatsApp, e-mail e Instagram) só são usadas por quem atende;</li>
          <li>a cópia de segurança das conversas, quando ligada, usa a criptografia de ponta a ponta do WhatsApp;</li>
          <li>o site só abre por conexão segura (HTTPS) e não guarda o que você digita.</li>
        </ul>
        <p>
          A Repasse Tech nunca pede senha nem o código de verificação do WhatsApp. Mensagem assim em nome dela é golpe:
          não responda e avise pelo canal da seção "Quem cuida dos seus dados".
        </p>
        <p>
          Se acontecer um incidente de segurança que possa causar risco ou dano relevante a você, a Repasse Tech avisa
          você e a ANPD, como a lei manda.
        </p>

        <VoltarSumario />

        <h2 id="pp-cookies">Cookies e armazenamento no navegador</h2>
        <p>
          Este site não usa cookies. Também não usa ferramenta de estatística, pixel de anúncio nem outra forma de
          rastreamento. Por isso não há aviso de cookies: não existe nada para aceitar ou recusar.
        </p>
        <p>
          O site guarda só duas informações no armazenamento da sessão do navegador (sessionStorage), para a página
          funcionar como esperado:
        </p>
        <ul>
          <li>
            se a abertura animada da página inicial já apareceu nesta visita (chave <code>rt-hero-visto</code>), para
            não repetir a animação;
          </li>
          <li>
            quantas vezes o aviso animado do botão de WhatsApp já apareceu nesta visita e em qual página ele apareceu
            por último, como /loja (chave <code>rt-nudge</code>), para não passar de duas vezes nem repetir na mesma
            página.
          </li>
        </ul>
        <p>
          As duas não identificam você, não são enviadas a ninguém e são apagadas quando a aba é fechada. Outras marcas
          de "já mostrado", como o selo animado das categorias do catálogo, ficam só na memória da página e somem ao
          recarregar.
        </p>

        <VoltarSumario />

        <h2 id="pp-publico">Para quem é o serviço</h2>
        <p>
          A Repasse Tech atende só empresas com CNPJ. O serviço não é dirigido a consumidor final nem a menor de idade.
        </p>

        <VoltarSumario />

        <h2 id="pp-mudancas">Mudanças nesta política</h2>
        <p>
          Quando o site ou o atendimento mudar o que faz com dados, esta política muda junto, e a data da versão no topo
          da página é atualizada. Mudança relevante é avisada às empresas cadastradas pelo WhatsApp.
        </p>
        <VoltarSumario />
      </DocLegal>
    </SecaoBloco>
  </div>
</template>
