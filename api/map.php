<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$data = simplexml_load_file('http://map.berrytube.tv/phpsqlajax_genxml.php');

$out = [];
foreach ( $data->marker as $el ){
	$obj = [];
	foreach ( $el->attributes() as $key => $val ){
		$str = (string)$val;
		$obj[$key] = is_numeric($str) ? (float)$str : $str;
	}
	$out[strtolower($el['name'])] = $obj;
}

echo json_encode($out);
