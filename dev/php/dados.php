<?php

require('constants.php');

if ($_SERVER['HTTP_HOST'] == $host) {
    $arr = array(
    'usuario'  => 'SINAPPE',
    'senha'    => '6WHJUT',
    'contrato' => '50117666',
    'pacote'   => 260,
    'url'      => 'https://www.checkauto.com.br/ws20v2/WebService1.asmx/Consultar?strXMLSolicitacao='
    );
    echo json_encode($arr);
} else {
    header($_SERVER['SERVER_PROTOCOL'].' 400 Bad Request');
    exit;
}
