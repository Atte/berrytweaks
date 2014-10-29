<?php

define('XML_URL', 'http://map.berrytube.tv/phpsqlajax_genxml.php');
define('CACHE_FNAME', 'map_cache.xml');

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$context = stream_context_create([
	'http' => ['timeout' => 10]
]);

$xml = @file_get_contents(XML_URL, false, $context);

if ( $xml ){
	file_put_contents('map_cache.xml', $xml);
}
else{
	$xml = file_get_contents(CACHE_FNAME);
	header('X-BerryTweaks-Cached: ' . filemtime(CACHE_FNAME));
}

$data = simplexml_load_string($xml);

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
