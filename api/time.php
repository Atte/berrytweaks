<?php

$apikey = 'PLXFU6Y9V2J1';
$lat = (float)$_REQUEST['lat'];
$lng = (float)$_REQUEST['lng'];

define('DATA_URL', "http://api.timezonedb.com/?format=json&key=$apikey&lat=$lat&lng=$lng");
define('CACHE_FNAME', "cache/time/${lat}_${lng}.json");
define('SERVE_CACHED', true);

require_once('cache.inc.php');
