<?php
require('php_crud_api_transform.php');
require('constants.php');
require('functions.php');
 
if (isset($_POST['notificationType']) && $_POST['notificationType'] == 'transaction') {
    $url = 'https://ws.sandbox.pagseguro.uol.com.br/v2/transactions/notifications/' . $_POST['notificationCode'] . '?email=' . $emailVendedor . '&token=' . $tokenVendedor;

    $transaction = httpGet($url);

    if ($transaction == 'Unauthorized') {
        //Insira seu código avisando que o sistema está com problemas, sugiro enviar um e-mail avisando para alguém fazer a manutenção

        exit;//Mantenha essa linha
    }
    $transaction = simplexml_load_string($transaction);

    switch ($transaction->status) {
        case '1' || 1:
            $status = 'Aguardando pagamento';
            break;
        case '2' || 2:
              $status = 'Em análise';
            break;
        case '3' || 3:
              $status = 'Paga';
            break;
        case '4' || 4:
              $status = 'Disponível';
            break;
        case '5' || 5:
              $status = 'Em disputa';
            break;
        case '6' || 6:
              $status = 'Devolvida';
            break;
        case '7' || 7:
              $status = 'Cancelada';
            break;
        case '8' || 8:
              $status = 'Debitado';
            break;
        case '9' || 9:
              $status = 'Retenção temporária';
            break;
        default:
            $status = '';
            break;
    }

    $transacao = httpGet("https://multiplicarbrasil.com.br/sistemanovo/api.php/transacao?filter=codigo,eq,".$transaction->code);
    $transacao = json_decode($transacao, true);
    $transacao = php_crud_api_transform($transacao);
    $id = $transacao['transacao'][0]['idTransacao'];

    if ($id) {
        $params = array(
        "status" => $status
        );
        echo httpPut("https://multiplicarbrasil.com.br/sistemanovo/api.php/transacao/" . $id, $params);
    } else {
        switch ($transaction->paymentMethod->type) {
            case '1':
                $pagamento = 'Cartão de crédito';
                break;
            case '2':
                $pagamento = 'Boleto';
                break;
            default:
                $pagamento = '';
                break;
        }
        date_default_timezone_set('America/Sao_Paulo');
        $params = array(
          "cliente"   => $transaction->reference,
          "codigo"    => $transaction->code,
          "criacao"   => date("Y-m-d H:i:s"),
          "descricao" => $transaction->items->item->description,
          "pagamento" => $pagamento,
          "status"    => $status,
          "valor"     => $transaction->items->item->amount
        );

        echo httpPost("https://multiplicarbrasil.com.br/sistemanovo/api.php/transacao", $params);
    }
}
