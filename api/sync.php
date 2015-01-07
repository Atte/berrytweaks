<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

function param($name){
	if ( !array_key_exists($name, $_REQUEST) )
		die("no $name");
	return $_REQUEST[$name];
}

$id = param('id');
if ( !preg_match('/^[a-z0-9]+$/', $id) )
	die('invalid id');

$fname = "sync/$id.json";

switch ( param('action') ){
case 'sync':
	$browser = json_decode(param('payload'), true);

	$server = [
		'version' => -1,
		'data' => []
	];
	if ( file_exists($fname) )
		$server = json_decode(file_get_contents($fname), true);

	ksort($browser['data']);
	ksort($server['data']);

	if ( $browser['version'] >= $server['version'] ){
		if ( $browser['version'] == 0 )
			$browser['version'] = 1;
		elseif ( $browser['version'] == $server['version'] && print_r($browser['data'], true) != print_r($server['data'], true) )
			$browser['version'] += 1;

		$server = $browser;
	}

	$data = json_encode($server, JSON_FORCE_OBJECT);
	echo $data;
	file_put_contents($fname, $data);
	break;
default:
	die('invalid action');
}
