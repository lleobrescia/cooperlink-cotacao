<?php
require('functions.php');
require('constants.php');
require('php_crud_api_transform.php');

$data = json_decode(file_get_contents('php://input'), true);  //Recebe JSON

$retorno = httpGet($api."cliente?include=planoescolhido,cotacao&filter=idCliente,eq,".$data["id"]);
$retorno = json_decode($retorno, true);
$retorno = php_crud_api_transform($retorno);

$cliente = $retorno['cliente'][0];

$to      = $emailSuporte;
$subject = "Novo Associado [ Cooperlink Brasil ]";

$headers  = 'MIME-Version: 1.0' . "\r\n";
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
                <td>'.$cliente['cadastro'].'</td>
              </tr>
              <tr>
                <td>IP</td>
                <td>
                  '.$cliente['planoescolhido'][0]['ip'].'
                </td>
              </tr>
              <tr>
                <td>Nome</td>
                <td>'.$cliente['nome'].'</td>
              </tr>
              <tr>
                <td>CPF</td>
                <td>'.$cliente['cpf'].'</td>
              </tr>
              <tr>
                <td>E-mail</td>
                <td>'.$cliente['email'].'</td>
              </tr>
              <tr>
                <td>Telefone</td>
                <td>'.$cliente['telefone'].'</td>
              </tr>
              <tr>
                <td>Endereço</td>
                <td>'.$cliente['logradouro'].', '.$cliente['numero'].' - '.$cliente['complemento'].' - '.$cliente['bairro'].',
                  '.$cliente['cidade'].', '.$cliente['estado'].' - '.$cliente['cep'].'
                </td> 
              </tr>
              <tr>
                <td>Código FIPE</td>
                <td>'.$cliente['planoescolhido'][0]['fipe'].'</td>
              </tr>
              <tr>
                <td>Valor FIPE</td>
                <td>'.$cliente['cotacao'][0]['valor'].'</td>
              </tr>
              <tr>
                <td>Modelo</td>
                <td>'.$cliente['planoescolhido'][0]['modelo'].'</td>
              </tr>
              <tr>
                <td>Veículo</td>
                <td>'.$cliente['planoescolhido'][0]['veiculo'].'</td>
              </tr>
              <tr>
                <td>Tipo de Veículo</td>
                <td>'.$cliente['planoescolhido'][0]['tipoVeiculo'].'</td>
              </tr>
              <tr>
                <td>Plano</td>
                <td>'.$cliente['planoescolhido'][0]['plano'].'</td>
              </tr>
              <tr>
                <td>Adesão</td>
                <td>'.$cliente['planoescolhido'][0]['adesao'].'</td>
              </tr>
              <tr>
                <td>Franquia</td>
                <td>'.$cliente['planoescolhido'][0]['franquia'].'</td>
              </tr>
              <tr>
                <td>Mensalidade</td>
                <td>'.$cliente['planoescolhido'][0]['mensalidade'].'</td>
              </tr>
              <tr>
                <td>Opcionais</td>
                <td>'.$cliente['planoescolhido'][0]['opcionais'].'</td>
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
