<?php

if( $_SERVER['HTTP_HOST'] == 'localhost'){
    $arr = array(
    'usuario'  => 'HomCheckauto',
    'senha'    => '12345678',
    'contrato' => '30100393',
    'pacote'   => 5,
    'url'      => 'https://www.checkauto.com.br/ws20v2/WebService1.asmx/Consultar?strXMLSolicitacao='
    );
    echo json_encode($arr);
}else{
    header($_SERVER['SERVER_PROTOCOL'].' 400 Bad Request');
    exit;
}