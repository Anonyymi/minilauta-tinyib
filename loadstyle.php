<?php

header("Content-Type: text/css; charset=UTF-8");

$tinyib_style = 'minilauta.css';
if (isset($_COOKIE["tinyib_style"])) {
    $tinyib_style_cookie = $_COOKIE["tinyib_style"];

    if (in_array($tinyib_style_cookie, array('minilauta', 'futaba', 'burichan', 'tomorrow'))) {
        $tinyib_style = $tinyib_style_cookie . '.css';
    }
}

include 'css/' . $tinyib_style;
