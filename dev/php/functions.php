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
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
    ));
 
    $output = curl_exec($ch);

    if ($output === false) {
        echo "false";
    }
 
    curl_close($ch);
    return $output;
}

function httpGet($url)
{
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($curl);


    if (!$output) {
        echo "false";
    }
    curl_close($curl);
    return $output;
}

function httpPut($url, $params)
{
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));

    $output = curl_exec($curl);
    if (!$output) {
        echo "false";
    }
    curl_close($curl);
    return $output;
}
