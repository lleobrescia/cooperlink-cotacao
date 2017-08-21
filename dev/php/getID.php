<?php

require('functions.php');
require('constants.php');

$params = array(
   "email" => $emailVendedor,
   "token" => $tokenVendedor
);
 
echo httpPost("https://ws.pagseguro.uol.com.br/v2/sessions", $params);

?> 