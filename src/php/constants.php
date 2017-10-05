<?php
$api           = 'https://cooperlink.com.br/desenvolvimento/api.php/';
$emailSuporte  = 'leo@basic.com.br';
$emailVendedor = 'eduardo@multiplicarbrasil.com.br';
$host          = "localhost";
$pagseguro     = 'https://ws.sandbox.pagseguro.uol.com.br/';
$tokenVendedor = 'AC10190A53CB4F5C85A3C688C022FC5D';
$seletor       = 'testeCooperlink';

if ($seletor == 'producaoCooperlink') {
  $pagseguro     = 'https://ws.pagseguro.uol.com.br/';
  $tokenVendedor = 'E20D830DE85343C48603A475B530E567';
}

//E20D830DE85343C48603A475B530E567 - producao
//AC10190A53CB4F5C85A3C688C022FC5D - teste 