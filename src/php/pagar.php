<?php
require('functions.php');
require('constants.php');

$data = json_decode(file_get_contents('php://input'), true); //Recebe JSON

$data['email'] = $emailVendedor;
$data['token'] = $tokenVendedor;


echo httpPost($pagseguro . "v2/transactions", $data);
 