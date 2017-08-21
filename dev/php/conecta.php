<?php
require('functions.php');
require ('constants.php');
require('php_crud_api_transform.php');

$retorno = httpGet(api."transacao?filter=codigo,eq,1");
$retorno = json_decode($retorno, true);

$retorno = php_crud_api_transform($retorno);

if ($retorno['transacao'][0]['idTransacao']) {
    echo 'ok';
} else {
    date_default_timezone_set('America/Sao_Paulo');
    echo date("Y-m-d H:i:s");
}
