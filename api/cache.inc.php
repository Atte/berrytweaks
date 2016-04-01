<?php

if ( !defined('NO_AUTO') && (!defined('DATA_URL') || !defined('CACHE_FNAME')) )
	die('params missing');

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$context = stream_context_create([
	'http' => [
		'timeout' => 5
	]
]);

function do_cache($data_url, $cache_fname){
	if ( defined('SERVE_CACHED') && SERVE_CACHED && is_readable($cache_fname) )
		$data = null;
	else
		$data = @file_get_contents($data_url, false, $context);

	if ( $data ){
		if ( function_exists('cache_validate') && !cache_validate($data) ){
			if ( function_exists('cache_calback') ){
				cache_calback(null);
				return;
			}
			else{
				http_response_code(500);
				die('invalid data');
			}
		}

		file_put_contents($cache_fname, $data);
	}
	else{
		$data = file_get_contents($cache_fname);
		header('X-BerryTweaks-Cached: ' . filemtime($cache_fname));
	}

	if ( function_exists('cache_callback') )
		cache_callback($data);
	else
		echo $data;
}

if ( !defined('NO_AUTO') )
	do_cache(DATA_URL, CACHE_FNAME);
