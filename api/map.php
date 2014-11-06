<?php

define('DATA_URL', 'http://map.berrytube.tv/phpsqlajax_genxml.php');
define('CACHE_FNAME', 'map_cache.xml');

function cache_callback($xml){
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
}

require_once('cache.inc.php');
