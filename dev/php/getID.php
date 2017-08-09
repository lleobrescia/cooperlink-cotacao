<?php
function httpPost($url, $params)
{
    $postData = '';
   //create name value pairs seperated by &
    foreach ($params as $k => $v) {
        $postData .= $k . '='.$v.'&';
    }
    $postData = rtrim($postData, '&');
 
    $ch = curl_init();
 
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_POST, count($postData));
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
 
    $output=curl_exec($ch);

    if($output === false)
    {
        echo "false";
    }
 
    curl_close($ch);
    return $output;
}

$params = array(
   "email" => "eduardo@multiplicarbrasil.com.br",
   "token" => "AC10190A53CB4F5C85A3C688C022FC5D"
);
 
echo httpPost("https://ws.sandbox.pagseguro.uol.com.br/v2/sessions", $params);

?> 