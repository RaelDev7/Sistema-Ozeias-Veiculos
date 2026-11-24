import type { Veiculo, Cliente, Venda, DadosContrato } from "@/types";
import { formatMoeda } from "@/lib/format";
import { EMPRESA } from "@/config/empresa";
import { dataPorExtenso, check, simNao, linhaVazia } from "@/lib/contrato-format";

function formatDataCurta(iso: string) {
  if (!iso) return "____/____/________";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function ContratoGarantia({
  veiculo,
  cliente,
  venda,
  dados,
}: {
  veiculo: Veiculo;
  cliente: Cliente;
  venda: Venda;
  dados: DadosContrato;
}) {
  const it = dados.itensEntregues;
  const v = dados.vistoria;
  const g = dados.garantia;
  const financiado = dados.formaPagamento === "financiamento";

  return (
    <div className="contrato-doc">
      <h1>CONTRATO PARTICULAR DE COMPRA E VENDA DE VEÍCULO AUTOMOTOR</h1>
      <p className="text-center" style={{ fontStyle: "italic" }}>
        Instrumento padrão para operações de compra e venda de veículos usados/seminovos
      </p>

      <h2>1. IDENTIFICAÇÃO DAS PARTES</h2>
      <p>
        VENDEDORA: {EMPRESA.nome}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº{" "}
        {EMPRESA.cnpj || linhaVazia("curta")}, com sede na {EMPRESA.endereco},{" "}
        {EMPRESA.cidade}, neste ato representada por seu único proprietário,{" "}
        {dados.representanteVendedor || EMPRESA.proprietario}, CPF nº{" "}
        {dados.cpfRepresentante || EMPRESA.cpfProprietario || linhaVazia("curta")}.
      </p>
      <p>
        COMPRADOR(A): {cliente.nome}, nacionalidade {cliente.nacionalidade || "BRASILEIRO(A)"},
        estado civil {cliente.estadoCivil}, CPF nº {cliente.cpf}, RG: {cliente.rg} residente à{" "}
        {cliente.endereco}, Bairro {cliente.bairro}, Município/UF {cliente.cidade}/{cliente.uf}, CEP{" "}
        {cliente.cep}, telefone {cliente.telefone}, e-mail {cliente.email || "SEM"}.
      </p>

      <h2>2. OBJETO DA VENDA</h2>
      <p>
        A VENDEDORA vende ao(à) COMPRADOR(A), que compra, o veículo abaixo identificado,
        pelo preço e nas condições deste instrumento.
      </p>
      <table>
        <tbody>
          <tr>
            <td>MARCA/MODELO: {veiculo.marca}/{veiculo.modelo}</td>
            <td>ANO FAB./MOD.: {veiculo.anoFab}/{veiculo.anoMod}</td>
            <td>COR: {veiculo.cor}</td>
          </tr>
          <tr>
            <td>PLACA: {veiculo.placa}</td>
            <td>RENAVAM: {veiculo.renavam}</td>
            <td>CHASSI: {veiculo.chassi}</td>
          </tr>
          <tr>
            <td>COMBUSTÍVEL: {veiculo.combustivel}</td>
            <td>KM DECLARADA: {veiculo.km.toLocaleString("pt-BR")} km</td>
            <td>MOTOR: {veiculo.motor}</td>
          </tr>
          <tr>
            <td colSpan={3}>ACESSÓRIOS/OPCIONAIS: {veiculo.acessorios}</td>
          </tr>
        </tbody>
      </table>

      <h2>3. PREÇO E PAGAMENTO</h2>
      <p>Preço total: {formatMoeda(venda.valorVenda)}</p>
      <p>Entrada: {dados.entradaDescricao}</p>
      <p>
        Forma: {check(dados.formaPagamento === "pix")} PIX {check(dados.formaPagamento === "dinheiro")} dinheiro{" "}
        {check(dados.formaPagamento === "cartao")} cartão {check(financiado)} financiamento{" "}
        {check(dados.formaPagamento === "transferencia")} transferência {check(dados.formaPagamento === "outra")} outra:{" "}
        {dados.formaPagamento === "outra" ? dados.formaPagamentoOutra : linhaVazia("curta")}.
      </p>
      {financiado && <p>FINANCIADO: {formatMoeda(dados.valorFinanciado)}</p>}
      <p>
        Se houver financiamento, a entrega fica condicionada à aprovação e efetiva
        liberação dos recursos, salvo ajuste escrito. Juros, tarifas e demais encargos do
        financiamento serão os previstos no contrato da instituição financeira.
      </p>
      <p>Pagamentos somente serão considerados quitados após efetiva compensação/liquidação.</p>

      <h2>4. VISTORIA E ESTADO DO VEÍCULO</h2>
      <p>
        O(A) COMPRADOR(A) declara ter examinado o veículo e tido oportunidade de realizar
        teste de funcionamento e vistoria, inclusive por profissional de sua confiança.
      </p>
      <p>
        As condições, avarias, acessórios, itens ausentes e observações específicas devem
        constar do ANEXO I — TERMO DE VISTORIA E CIÊNCIA DO ESTADO DO VEÍCULO.
      </p>
      <p>
        A ciência do estado aparente do veículo não representa renúncia a direitos
        assegurados pela legislação, inclusive quanto a vícios ocultos e garantia legal.
      </p>
      <p>
        Qualquer promessa de reparo, acessório ou condição especial deverá constar por
        escrito neste contrato ou em anexo assinado.
      </p>

      <h2>5. GARANTIA LEGAL E ATENDIMENTO</h2>
      <p>
        Em relação de consumo, serão respeitados o Código de Defesa do Consumidor e demais
        normas aplicáveis. A condição de veículo usado não elimina direitos legais.
      </p>
      <p>
        O CDC prevê, para produtos duráveis, prazo de 90 (noventa) dias para reclamação de
        vícios aparentes ou de fácil constatação, observadas as regras legais de contagem e
        demais disposições aplicáveis.
      </p>
      <p>
        Se houver garantia contratual adicional, seus componentes, prazo, limites e
        procedimento deverão constar do ANEXO II — TERMO DE GARANTIA, sem prejuízo da
        garantia legal.
      </p>
      <p>
        Solicitações de garantia deverão ser encaminhadas à VENDEDORA pelos canais
        informados, com descrição do problema e apresentação do veículo para diagnóstico
        quando necessário.
      </p>

      <h2>6. DOCUMENTAÇÃO, TRANSFERÊNCIA E ENTREGA</h2>
      <p>
        A VENDEDORA fornecerá os documentos que lhe competirem para a transferência,
        conforme a situação do veículo e as regras do órgão de trânsito.
      </p>
      <p>
        O(A) COMPRADOR(A) fornecerá dados e documentos verdadeiros e praticará os atos
        necessários à transferência dentro dos prazos legais.
      </p>
      <p>
        Entrega: {formatDataCurta(dados.dataEntrega)} às {dados.horaEntrega || "________"},
        condicionada a: {check(dados.entregaCondicao === "integral")} pagamento integral{" "}
        {check(dados.entregaCondicao === "financiamento_liberado")} financiamento liberado{" "}
        {check(dados.entregaCondicao === "outra")} outra:{" "}
        {dados.entregaCondicao === "outra" ? dados.entregaCondicaoOutra : linhaVazia("longa")}.
      </p>
      <p>
        Itens entregues: chaves {simNao(it.chaves)}; manual {simNao(it.manual)}; CRLV-e/documentação{" "}
        {simNao(it.crlv)}; estepe {simNao(it.estepe)}; macaco {simNao(it.macaco)}; chave de roda{" "}
        {simNao(it.chaveRoda)}; triângulo {simNao(it.triangulo)}; outros: {it.outros}
      </p>
      <p>
        Após a entrega, o(a) COMPRADOR(A) assume a guarda e utilização do veículo,
        ressalvadas obrigações legais da VENDEDORA.
      </p>

      <h2>7. DÉBITOS, MULTAS E RESPONSABILIDADES</h2>
      <p>
        Débitos, multas, tributos e encargos anteriores à entrega serão de responsabilidade
        de quem legalmente os tiver causado ou a quem a lei atribuir.
      </p>
      <p>
        A partir da entrega, o(a) COMPRADOR(A) responde pelas obrigações decorrentes da
        posse e utilização do veículo que lhe sejam legalmente atribuíveis.
      </p>
      <p>
        Se uma parte pagar obrigação de responsabilidade da outra, poderá exigir
        ressarcimento mediante comprovação, ressalvados os direitos legais.
      </p>

      <h2>8. RESCISÃO</h2>
      <p>
        Em compras de veículos feitas presencialmente em loja física, o consumidor não tem
        direito de arrependimento em até 7 dias, pois essa regra do Código de Defesa do
        Consumidor vale apenas para compras fora do estabelecimento comercial (como pela
        internet).
      </p>
      <p>
        Multa Rescisória: De acordo com o Código de Defesa do Consumidor (CDC) em caso de
        desistência da compra após a assinatura do contrato em loja ou em local definido
        pelo cliente será aplicada uma multa equivalente a 5% do valor do bem adquirido.
      </p>

      <h2>9. DADOS E COMUNICAÇÕES</h2>
      <p>
        As partes declaram que os dados fornecidos são verdadeiros e autorizam seu uso para
        execução da compra e venda, emissão de documentos, transferência, cumprimento de
        obrigações legais e atendimento pós-venda, observada a legislação de proteção de
        dados.
      </p>
      <p>
        Comunicações relevantes poderão ser realizadas pelos contatos informados neste
        contrato, sem prejuízo de meios formais exigidos por lei.
      </p>

      <h2>10. FORO</h2>
      <p>
        Fica eleito o foro competente segundo a legislação aplicável, especialmente as
        regras de proteção do consumidor quando incidentes.
      </p>

      <h2 style={{ pageBreakBefore: "avoid" }}>ANEXO I — TERMO DE VISTORIA E CIÊNCIA DO ESTADO DO VEÍCULO</h2>
      <p>Quilometragem: {veiculo.km.toLocaleString("pt-BR")} km.</p>
      <p>Motor: {check(v.motorNormal)} normal ( ) observação: {v.motorNormal ? linhaVazia("longa") : ""}</p>
      <p>Câmbio/embreagem: {check(v.cambioNormal)} normal ( ) observação: {v.cambioNormal ? linhaVazia("longa") : ""}</p>
      <p>Suspensão/direção/freios: {check(v.suspensaoNormal)} normal ( ) observação: {v.suspensaoNormal ? linhaVazia("longa") : ""}</p>
      <p>Ar-condicionado: {check(v.arCondicionadoFunciona)} funcionando ( ) não testado ( ) observação:</p>
      <p>Elétrica/iluminação: {check(v.eletricaNormal)} normal ( ) observação: {v.eletricaNormal ? linhaVazia("longa") : ""}</p>
      <p>Lataria/pintura: {v.lataria}</p>
      <p>Pneus: {v.pneus}</p>
      <p>Vidros/retrovisores: {v.vidros}</p>
      <p>Interior/bancos/tapetes: {v.interior}</p>
      <p>Outros apontamentos/avarias previamente informadas: {v.outrosApontamentos || "NADA."}</p>
      <p>
        DECLARAÇÃO: O(A) COMPRADOR(A) declara ter recebido oportunidade para examinar o
        veículo e ciência das condições acima, sem prejuízo dos direitos que a legislação
        não permita renunciar.
      </p>

      <h2>ANEXO II — TERMO DE GARANTIA CONTRATUAL (PREENCHER SE HOUVER)</h2>
      <p>
        Prazo adicional: <strong>{g.prazoDias} dias, contados de {formatDataCurta(dados.dataEntrega)} ou{" "}
        {g.kmLimite.toLocaleString("pt-BR")} km rodados após a compra!</strong>
      </p>
      <p>Componentes abrangidos: {g.componentes}</p>
      <p>Observações e condições: {g.observacoes}</p>
      <p>Local/canal para atendimento: LOJA {EMPRESA.nome} — WhatsApp {EMPRESA.whatsapp}</p>
      <p>
        A garantia contratual adicional complementa e não substitui a garantia legal
        aplicável.
      </p>
      <p>
        <strong>Prazo de conserto de 30 dias:</strong> Se o carro apresentar um defeito
        dentro da garantia, a loja tem o direito de realizar o reparo em até 30 dias
        corridos.
      </p>
      <p>
        <strong>Direito à rescisão por defeito:</strong> Se a loja não consertar o problema
        em 30 dias, o comprador pode exigir a rescisão do contrato com a devolução total do
        dinheiro pago, a troca por outro veículo igual ou um abatimento proporcional no
        preço.
      </p>
      <p>
        <strong>Direito de arrependimento (7 dias):</strong> O cancelamento da compra em até
        7 dias por simples desistência (arrependimento) só vale para compras feitas fora da
        loja física (como pela internet ou telefone).
      </p>
      <p>
        <strong>Compra presencial:</strong> Se você foi até a loja física, fez o test drive e
        assinou o contrato, não existe o direito legal de devolver o carro apenas porque
        mudou de ideia, a menos que o veículo apresente um vício oculto grave que a loja se
        recuse a resolver.
      </p>

      <h2>ANEXO III — CHECKLIST DE ENTREGA</h2>
      <p>Pagamento/financiamento conferido: {check(true)} sim ( ) não</p>
      <p>Documentação conferida: {check(true)} sim ( ) não</p>
      <p>Transferência/ATPV-e/ato equivalente: ( ) realizado {check(true)} pendente</p>
      <p>Chaves entregues: {simNao(it.chaves)}</p>
      <p>Manual: {check(it.manual)} sim ( ) não</p>
      <p>Estepe/macaco/chave de roda/triângulo: {check(true)} conferidos ( ) não disponíveis</p>
      <p>Fotos/vistoria anexadas: ( ) sim ( ) não</p>
      <p>Observações finais: {dados.ressalvas || "SEM OBSERVAÇÕES!"}</p>

      <h2>ASSINATURAS</h2>
      <p>Local da contratação: {dados.localAssinatura || EMPRESA.cidade.toUpperCase()}, {dataPorExtenso(venda.data)}.</p>

      <table style={{ marginTop: 40, border: "none" }}>
        <tbody>
          <tr style={{ border: "none" }}>
            <td className="assinatura" style={{ border: "none", width: "50%" }}>
              VENDEDORA — {EMPRESA.nome}
              <br />
              Proprietário: {dados.representanteVendedor || EMPRESA.proprietario}
              <br />
              CPF: {dados.cpfRepresentante || EMPRESA.cpfProprietario}
            </td>
            <td className="assinatura" style={{ border: "none", width: "50%" }}>
              COMPRADOR(A)
              <br />
              Nome: {cliente.nome}
              <br />
              CPF: {cliente.cpf}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ marginTop: 36, border: "none" }}>
        <tbody>
          <tr style={{ border: "none" }}>
            <td className="assinatura" style={{ border: "none", width: "50%" }}>
              TESTEMUNHA 1
              <br />
              Nome: {linhaVazia("longa")}
              <br />
              CPF: {linhaVazia("longa")}
            </td>
            <td className="assinatura" style={{ border: "none", width: "50%" }}>
              TESTEMUNHA 2
              <br />
              Nome: {linhaVazia("longa")}
              <br />
              CPF: {linhaVazia("longa")}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 30 }}>
        CIÊNCIA DA ENTREGA DO VEÍCULO / DOCUMENTOS
        <br />
        Data e hora: ____/____/________ às ________:________
      </p>
    </div>
  );
}
