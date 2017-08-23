<?php

require('functions.php');
require('constants.php');

$params = array(
   "email" => $emailVendedor,
   "token" => $tokenVendedor
);
 
echo httpPost($pagseguro ."v2/sessions", $params);

?> 