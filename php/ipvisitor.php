<?php

//reference: https://stackoverflow.com/questions/13646690/how-to-get-real-ip-from-visitor

if ($_SERVER['HTTP_HOST'] == 'localhost') {
    function getUserIP()
    {
        $client  = @$_SERVER['HTTP_CLIENT_IP'];
        $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
        $remote  = $_SERVER['REMOTE_ADDR'];

        if (filter_var($client, FILTER_VALIDATE_IP)) {
            $ip = $client;
        } elseif (filter_var($forward, FILTER_VALIDATE_IP)) {
            $ip = $forward;
        } else {
            $ip = $remote;
        }

            return $ip;
    }


    $user_ip = getUserIP();

    echo $user_ip;
} else {
    header($_SERVER['SERVER_PROTOCOL'].' 400 Bad Request');
    exit;
}
