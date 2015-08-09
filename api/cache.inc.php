<?php

if ( !defined('DATA_URL') || !defined('CACHE_FNAME') )
	die('params missing');

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$context = stream_context_create([
	'http' => [
		'timeout' => 5
	]
]);

if ( defined('SERVE_CACHED') && SERVE_CACHED && is_readable(CACHE_FNAME) )
	$data = null;
else
	$data = @file_get_contents(DATA_URL, false, $context);

if ( $data ){
	if ( function_Exists('cache_validate') && !cache_validate($data) ){
		http_response_code(500);
		die('invalid data');
	}

	file_put_contents(CACHE_FNAME, $data);
}
else{
	$data = file_get_contents(CACHE_FNAME);
	header('X-BerryTweaks-Cached: ' . filemtime(CACHE_FNAME));
}

if ( function_exists('cache_callback') )
	cache_callback($data);
else
	echo $data;
