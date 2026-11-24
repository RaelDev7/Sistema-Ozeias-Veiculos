import type { Veiculo, Cliente, Venda, DadosContrato } from "@/types";
import { formatMoeda } from "@/lib/format";
import { EMPRESA } from "@/config/empresa";
import { dataPorExtenso, check, simNao, linhaVazia } from "@/lib/contrato-format";

export function ContratoRepasse({
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

  return (
    <div className="contrato-doc">
      <h1>CONTRATO DE COMPRA E VENDA DE VEÍCULO — REPASSE</h1>
      <p className="text-center font-bold">VENDA DE VEÍCULO USADO EM CONDIÇÃO DE REPASSE</p>

      <p>
        <strong>VENDEDORA:</strong> {EMPRESA.nome}, CNPJ nº {EMPRESA.cnpj || linhaVazia("curta")},{" "}
        {EMPRESA.endereco}, {EMPRESA.cidade}, neste ato representada por seu único
        proprietário, {dados.representanteVendedor || EMPRESA.proprietario}, CPF nº{" "}
        {dados.cpfRepresentante || EMPRESA.cpfProprietario || linhaVazia("curta")}.
      </p>

      <h2>1. COMPRADOR(A)</h2>
      <table>
        <tbody>
          <tr>
            <td colSpan={2}>Nome: {cliente.nome}</td>
          </tr>
          <tr>
            <td>CPF: {cliente.cpf}</td>
            <td>RG: {cliente.rg}</td>
          </tr>
          <tr>
            <td colSpan={2}>Endereço: {cliente.endereco}</td>
          </tr>
          <tr>
            <td colSpan={2}>Bairro: {cliente.bairro}</td>
          </tr>
          <tr>
            <td>Cidade/UF: {cliente.cidade}-{cliente.uf}</td>
            <td>Telefone: {cliente.telefone}</td>
          </tr>
        </tbody>
      </table>

      <h2>2. VEÍCULO</h2>
      <table>
        <tbody>
          <tr>
            <td colSpan={2}>Marca/Modelo: {veiculo.marca}/ {veiculo.modelo}</td>
          </tr>
          <tr>
            <td>Ano Fab./Mod.: {veiculo.anoFab}/{veiculo.anoMod}</td>
            <td>Cor: {veiculo.cor}</td>
            <td>Placa: {veiculo.placa}</td>
          </tr>
          <tr>
            <td>RENAVAM: {veiculo.renavam}</td>
            <td>Chassi: {veiculo.chassi}</td>
          </tr>
          <tr>
            <td colSpan={2}>Quilometragem indicada: {veiculo.km.toLocaleString("pt-BR")} km.</td>
          </tr>
        </tbody>
      </table>

      <h2>3. VALOR E PAGAMENTO</h2>
      <p>Valor total: {formatMoeda(venda.valorVenda)}.</p>
      <p>
        Forma: {check(dados.formaPagamento === "pix")} PIX {check(dados.formaPagamento === "dinheiro")} dinheiro{" "}
        {check(dados.formaPagamento === "cartao")} cartão {check(dados.formaPagamento === "financiamento")} financiamento{" "}
        {check(dados.formaPagamento === "transferencia")} transferência {check(dados.formaPagamento === "outra")} outra:{" "}
        {dados.formaPagamento === "outra" ? dados.formaPagamentoOutra : linhaVazia("curta")}.
      </p>
      <p>Entrada: {dados.entradaDescricao}.</p>

      <h2>4. CONDIÇÃO DE REPASSE</h2>
      <p>
        O(A) COMPRADOR(A) declara estar adquirindo o veículo na condição de "REPASSE", por
        preço ajustado considerando seu estado geral, idade, quilometragem, conservação e
        eventuais necessidades de manutenção ou reparos.
      </p>
      <p>
        O(A) COMPRADOR(A) declara que teve oportunidade de examinar e testar o veículo e, se
        desejasse, submetê-lo à avaliação de mecânico ou profissional de sua confiança antes
        da compra.
      </p>
      <p>
        Eventuais defeitos, avarias, desgastes e necessidades de manutenção conhecidas no
        momento da venda devem ser registrados no campo de ressalvas deste contrato.
      </p>

      <h2>5. CIÊNCIA SOBRE A GARANTIA</h2>
      <p>
        O(A) COMPRADOR(A) declara estar ciente de que a VENDEDORA não está oferecendo
        garantia contratual adicional de funcionamento para motor, câmbio, suspensão,
        elétrica, ar-condicionado ou demais componentes.
      </p>
      <p>
        A expressão "REPASSE" e a ausência de garantia contratual adicional não significam
        renúncia a direitos que sejam obrigatórios por lei. Em relação de consumo,
        permanecem aplicáveis as normas de proteção do consumidor.
      </p>
      <p>
        O(A) COMPRADOR(A) declara ter recebido essa informação antes da conclusão da compra
        e compreender que a condição de repasse foi considerada na negociação do preço.
      </p>

      <h2>6. VISTORIA E RESSALVAS</h2>
      <p>Defeitos/avarias/itens informados ao comprador: {dados.ressalvas || "CARRO ENTREGUE"}</p>

      <h2>7. ENTREGA E RESPONSABILIDADES</h2>
      <p>
        Entrega prevista para {dados.dataEntrega ? new Date(dados.dataEntrega + "T00:00:00").toLocaleDateString("pt-BR") : "____/____/________"}, às{" "}
        {dados.horaEntrega || "________"}, após o cumprimento das condições de pagamento.
      </p>
      <p>
        Itens/documentos entregues: chaves {simNao(it.chaves)}; CRLV-e {simNao(it.crlv)}; manual{" "}
        {simNao(it.manual)}; estepe {simNao(it.estepe)}; macaco {simNao(it.macaco)}; chave de roda{" "}
        {simNao(it.chaveRoda)}; triângulo {simNao(it.triangulo)}.
      </p>
      <p>
        Débitos, multas e encargos serão atribuídos conforme a legislação aplicável e o
        respectivo fato gerador.
      </p>
      <p>
        O(A) COMPRADOR(A) compromete-se a fornecer dados verdadeiros e praticar os atos
        necessários à transferência do veículo dentro dos prazos legais.
      </p>

      <h2>8. DECLARAÇÃO FINAL</h2>
      <p>
        O(A) COMPRADOR(A) declara que leu este contrato, compreendeu especialmente a
        condição de REPASSE e a inexistência de garantia contratual adicional, teve
        oportunidade de esclarecer dúvidas e recebe uma via deste documento.
      </p>

      <table style={{ marginTop: 10 }}>
        <tbody>
          <tr>
            <td style={{ textAlign: "center", fontWeight: 700 }}>
              DECLARAÇÃO DE CIÊNCIA DO REPASSE
              <br />
              <br />
              DECLARO QUE O VEÍCULO FOI ADQUIRIDO NA CONDIÇÃO DE REPASSE, QUE FUI
              INFORMADO(A) SOBRE A AUSÊNCIA DE GARANTIA CONTRATUAL ADICIONAL E QUE TIVE
              OPORTUNIDADE DE VISTORIAR E TESTAR O VEÍCULO ANTES DA COMPRA, SEM PREJUÍZO DOS
              DIREITOS QUE A LEI EVENTUALMENTE ME ASSEGURE.
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 16 }}>
        Local: {dados.localAssinatura || EMPRESA.cidade}, {dataPorExtenso(venda.data)}.
      </p>

      <table style={{ marginTop: 40, border: "none" }}>
        <tbody>
          <tr style={{ border: "none" }}>
            <td className="assinatura" style={{ border: "none", width: "50%" }}>
              {dados.representanteVendedor || EMPRESA.proprietario}
              <br />
              VENDEDORA — {EMPRESA.nome}
              <br />
              Proprietário — CPF: {dados.cpfRepresentante || EMPRESA.cpfProprietario}
            </td>
            <td className="assinatura" style={{ border: "none", width: "50%" }}>
              {cliente.nome}
              <br />
              COMPRADOR(A)
              <br />
              CPF: {cliente.cpf}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ marginTop: 40, border: "none" }}>
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
    </div>
  );
}
