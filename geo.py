#!/usr/bin/env python3
import cgi
import cgitb
cgitb.enable(format=None)

print('Content-Type: text/plain')
print()

import re
import glob
import gzip
import GeoIP
import itertools
from operator import itemgetter
from datetime import datetime

TEXT_NAMES = ['/var/log/nginx/access.log']
GZIP_NAMES = glob.glob('/var/log/nginx/access.log.*.gz')

FILTER = '"GET /berrytweaks/js/init.js '

IN_DATE_FORMAT = '%d/%b/%Y:%H:%M:%S %z'
OUT_DATE_FORMAT = '%d.%m.%Y %H:%M'

# ip, time, method, url, protocol, referer, useragent
PATTERN = re.compile(r'^(?:::ffff:)?(?P<ip>[^ ]+) - - \[(?P<time>[^\]]+)\] "(?P<method>[^ ]+) (?P<url>[^ ]+) (?P<protocol>[^"]+)" (?P<status>\d+) (?P<size>\d+) "(?P<referer>[^"]+)" "(?P<useragent>[^"]+)"(?:\r?\n)?$')

geoip = GeoIP.open('/usr/local/share/GeoLiteCity.dat', GeoIP.GEOIP_STANDARD)

lastTimes = {}
def handleFile(fh):
	for line in fh:
		if FILTER in line:
			m = PATTERN.match(line)
			if not m:
				continue

			geo = geoip.record_by_name(m.group('ip'))
			if geo is None:
				continue

			loc = tuple(
				geo[key] or ''
				for key in ['country_name', 'region_name', 'city']
			)

			time = datetime.strptime(m.group('time'), IN_DATE_FORMAT)

			if loc not in lastTimes or lastTimes[loc] < time:
				lastTimes[loc] = time

for fname in TEXT_NAMES:
	with open(fname, 'r') as fh:
		handleFile(fh)

for fname in GZIP_NAMES:
	with gzip.open(fname, 'rt') as fh:
		handleFile(fh)

lines = [
	[time.strftime(OUT_DATE_FORMAT)] + list(loc)
	for loc, time in sorted(lastTimes.items(), key=itemgetter(1), reverse=True)
]

columnLengths = [
	max(map(len, map(itemgetter(i), lines)))
	for i in range(len(lines[0]))
]

for line in lines:
	print(' | '.join(
		col + ' ' * (pad - len(col))
		for col, pad in zip(line, columnLengths)
	))
