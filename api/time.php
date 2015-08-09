<?php

$apikey = 'PLXFU6Y9V2J1';
$lat = $_REQUEST['lat'];
$lng = $_REQUEST['lng'];

$pat = '/^-?\d+\.\d+$/';
if ( !preg_match($pat, $lat) || !preg_match($pat, $lng) ){
	http_response_code(400);
	die('invalid lat/lng');
}

define('DATA_URL', "http://api.timezonedb.com/?format=json&key=${apikey}&lat=${lat}&lng=${lng}");
define('CACHE_FNAME', "cache/time/${lat}_${lng}.json");
define('SERVE_CACHED', true);

function cache_validate($data){
	$json = json_decode($data, true);
	return array_key_exists('status', $json) && $json['status'] === 'OK';
}

require_once('cache.inc.php');
