<?php
$api           = 'https://cooperlink.com.br/desenvolvimento/api.php/';
$emailSuporte  = 'eduardo@cooperlink.com.br';
$emailVendedor = 'financeiro@cooperlink.com.br';
$host          = "localhost";
$pagseguro     = 'https://ws.sandbox.pagseguro.uol.com.br/';
$tokenVendedor = '511F036A91AC4E679CA65B32D399DDBB';
$seletor       = 'testeCooperlink';

if ($seletor == 'producaoCooperlink') {
  $pagseguro     = 'https://ws.pagseguro.uol.com.br/';
  $tokenVendedor = '1410642B185F4DA38DEEFC7ED5C7D2EE';
}

//1410642B185F4DA38DEEFC7ED5C7D2EE - producao
//511F036A91AC4E679CA65B32D399DDBB - teste