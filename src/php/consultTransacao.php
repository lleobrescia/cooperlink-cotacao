<?php
require('php_crud_api_transform.php');
require('constants.php');
require('functions.php');

if (isset($_POST['notificationType']) && $_POST['notificationType'] == 'transaction') {
  $url = $pagseguro . 'v2/transactions/notifications/' . $_POST['notificationCode'] . '?email=' . $emailVendedor . '&token=' . $tokenVendedor;

  $transaction = httpGet($url);

  if ($transaction == 'Unauthorized') {
        //Insira seu código avisando que o sistema está com problemas, sugiro enviar um e-mail avisando para alguém fazer a manutenção
    echo 'leo';
    exit;//Mantenha essa linha

  }
  $transaction = simplexml_load_string($transaction);

  $transacao = httpGet($api . "transacao?filter=codigo,eq," . $transaction->code);
  $transacao = json_decode($transacao, true);
  $transacao = php_crud_api_transform($transacao);
  $id = $transacao['transacao'][0]['idTransacao'];

  switch ($transaction->status) {
    case '1' :
      $status = 'Aguardando pagamento';
      break;
    case '2' :
      $status = 'Em análise';
      break;
    case '3' :
      $status = 'Paga';

      if ($id && $transacao['transacao'][0]['status'] != 'Paga') {

        $retorno = httpGet($api . "cliente?include=planoescolhido,cotacao&filter=idCliente,eq," . $transaction->reference);
        $retorno = json_decode($retorno, true);
        $retorno = php_crud_api_transform($retorno);

        $cliente = $retorno['cliente'][0];

        $to = $emailSuporte;
        $subject = "Novo Associado [ Cooperlink Brasil ]";
        $headers = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
        $headers .= "From: Cooperlink Brasil <contato@cooperlink.com.br>" . "\r\n";

        $corpo = '<div style="background-color: #f4f4f4; width: 100%; padding-top: 30px; padding-bottom: 30px;">
                <table cellpadding="0" cellspacing="0" style="width: 600px;padding-left: 20px;padding-right: 20px;padding-bottom: 50px;margin-left:auto;margin-right:auto;background-color: white;">
                  <tr>
                    <td>
                      <table cellpadding="0" cellspacing="0" align="center" bgcolor="#ffaa3c" style="width: 600px">
                        <tr>
                          <td style="height: 104px;" align="center">
                            <a href="http://cooperlink.com.br/" title="Cooperlink Brasil" target="_blank"> <img src="https://cooperlink.com.br/cotacao/img/cooperlink.png" alt="Cooperlink Brasil"> </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table cellpadding="0" cellspacing="0" align="center" style="width: 600px">
                        <tr>
                          <td>
                            <h2>Dados do Cliente</h2>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table align="center" style="width: 600px">
                              <tr>
                                <td>Data</td>
                                <td>' . $cliente['cadastro'] . '</td>
                              </tr>
                              <tr>
                                <td>IP</td>
                                <td>
                                  ' . $cliente['planoescolhido'][0]['ip'] . '
                                </td>
                              </tr>
                              <tr>
                                <td>Nome</td>
                                <td>' . $cliente['nome'] . '</td>
                              </tr>
                              <tr>
                                <td>CPF</td>
                                <td>' . $cliente['cpf'] . '</td>
                              </tr>
                              <tr>
                                <td>E-mail</td>
                                <td>' . $cliente['email'] . '</td>
                              </tr>
                              <tr>
                                <td>Telefone</td>
                                <td>' . $cliente['telefone'] . '</td>
                              </tr>
                              <tr>
                                <td>Endereço</td>
                                <td>' . $cliente['logradouro'] . ', ' . $cliente['numero'] . ' - ' . $cliente['complemento'] . ' - ' . $cliente['bairro'] . ',
                                  ' . $cliente['cidade'] . ', ' . $cliente['estado'] . ' - ' . $cliente['cep'] . '
                                </td>
                              </tr>
                              <tr>
                                <td>Código FIPE</td>
                                <td>' . $cliente['planoescolhido'][0]['fipe'] . '</td>
                              </tr>
                              <tr>
                                <td>Valor FIPE</td>
                                <td>' . $cliente['cotacao'][0]['valor'] . '</td>
                              </tr>
                              <tr>
                                <td>Modelo</td>
                                <td>' . $cliente['planoescolhido'][0]['modelo'] . '</td>
                              </tr>
                              <tr>
                                <td>Veículo</td>
                                <td>' . $cliente['planoescolhido'][0]['veiculo'] . '</td>
                              </tr>
                              <tr>
                                <td>Tipo de Veículo</td>
                                <td>' . $cliente['planoescolhido'][0]['tipoVeiculo'] . '</td>
                              </tr>
                              <tr>
                                <td>Plano</td>
                                <td>' . $cliente['planoescolhido'][0]['plano'] . '</td>
                              </tr>
                              <tr>
                                <td>Adesão</td>
                                <td>' . $cliente['planoescolhido'][0]['adesao'] . '</td>
                              </tr>
                              <tr>
                                <td>Franquia</td>
                                <td>' . $cliente['planoescolhido'][0]['franquia'] . '</td>
                              </tr>
                              <tr>
                                <td>Mensalidade</td>
                                <td>' . $cliente['planoescolhido'][0]['mensalidade'] . '</td>
                              </tr>
                              <tr>
                                <td>Opcionais</td>
                                <td>' . $cliente['planoescolhido'][0]['opcionais'] . '</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                </div>';

        mail($to, $subject, $corpo, $headers);
      }
      break;
    case '4' :
      $status = 'Disponível';
      break;
    case '5' :
      $status = 'Em disputa';
      break;
    case '6' :
      $status = 'Devolvida';
      break;
    case '7' :
      $status = 'Cancelada';
      break;
    case '8' :
      $status = 'Debitado';
      break;
    case '9' :
      $status = 'Retenção temporária';
      break;
    default :
      $status = '';
      break;
  }



  if ($id) {
    $params = array(
      "status" => $status
    );
    echo httpPut($api . "transacao/" . $id, $params);
  }
  else {
    switch ($transaction->paymentMethod->type) {
      case '1' :
        $pagamento = 'Cartão de crédito';
        break;
      case '2' :
        $pagamento = 'Boleto';
        break;
      default :
        $pagamento = '';
        break;
    }
    date_default_timezone_set('America/Sao_Paulo');
    $params = array(
      "cliente" => $transaction->reference,
      "codigo" => $transaction->code,
      "criacao" => date("Y-m-d H:i:s"),
      "descricao" => $transaction->items->item->description,
      "pagamento" => $pagamento,
      "status" => $status,
      "valor" => $transaction->items->item->amount
    );

    echo httpPost($api . "transacao", $params);
  }
}
