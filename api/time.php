<?php

$apikey = 'PLXFU6Y9V2J1';
$lats = $_REQUEST['lat'];
$lngs = $_REQUEST['lng'];

$is_array = is_array($lats);
if ( $is_array != is_array($lngs) ){
	http_response_code(400);
	die("arrayness doesn't match");
}

if ( !$is_array ){
	$lats = [$lats];
	$lngs = [$lngs];
}

if ( count($lats) != count($lngs) ){
	http_response_code(400);
	die("aray lengths don't match");
}

$ans = [];
function cache_callback($data){
	global $ans;
	$ans []= json_decode($data, true);
}
function cache_validate($data){
	$json = json_decode($data, true);
	return array_key_exists('status', $json) && $json['status'] === 'OK';
}

define('NO_AUTO', true);
define('SERVE_CACHED', true);
require_once('cache.inc.php');

for ( $i=0; $i<count($lats); ++$i ){
	$lat = $lats[$i];
	$lng = $lngs[$i];

	$pat = '/^-?\d+\.\d+$/';
	if ( !preg_match($pat, $lat) || !preg_match($pat, $lng) ){
		http_response_code(400);
		die('invalid lat/lng');
	}

	do_cache("http://api.timezonedb.com/?format=json&key=${apikey}&lat=${lat}&lng=${lng}", "cache/time/${lat}_${lng}.json");
}

if ( $is_array )
	echo json_encode(['results' => $ans]);
else
	echo json_encode($ans[0]);
