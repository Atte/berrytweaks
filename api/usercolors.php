<?php

define('DATA_URL', 'http://btc.berrytube.tv/wut/wutColors/usercolors.js');
define('CACHE_FNAME', 'usercolors_cache.json');

function cache_callback($code){
	echo preg_replace('/(var\\s+)?wutUserColors\\s*=/', '', $code);
}

require_once('cache.inc.php');
