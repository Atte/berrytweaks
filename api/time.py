import cgi
import cgitb
cgitb.enable(format=None)

print('Content-Type: application/json')
print('Access-Control-Allow-Origin: *')
print()

import sys
import json
from datetime import datetime
from pytz import timezone, utc, country_timezones, country_names
from pytz.exceptions import AmbiguousTimeError
from timezonefinder import TimezoneFinder

form = cgi.FieldStorage()
lats = map(float, form.getlist('lat[]'))
lngs = map(float, form.getlist('lng[]'))

now = datetime.utcnow().replace(microsecond=0)
utc_now = now.replace(tzinfo=utc)

tz_finder = TimezoneFinder()

out = []
for lat, lng in zip(lats, lngs):
    tz_name = tz_finder.timezone_at(lat=lat, lng=lng)
    if tz_name is None:
        out.append({
            'status': 'FAILED',
            'message': 'Unknown zone',
        })
        continue

    country_code = None
    country_name = None
    for code, zones in country_timezones.items():
        if tz_name in zones:
            country_code = code.upper()
            country_name = country_names[code]
            break

    tz = timezone(tz_name)
    try:
        tz_now = tz.normalize(utc_now.astimezone(tz))
        out.append({
            'status': 'OK',
            'zoneName': tz_name,
            'countryCode': country_code,
            'countryName': country_name,
            'abbreviation': tz.tzname(now),
            'gmtOffset': int(tz.utcoffset(now).total_seconds()),
            'timestamp': int(tz_now.timestamp()),
            'formatted': str(tz_now.replace(tzinfo=None)),
        })
    except AmbiguousTimeError:
        out.append({
            'status': 'FAILED',
            'message': 'ambiguous',
            'zoneName': tz_name,
            'countryCode': country_code,
            'countryName': country_name,
        })

json.dump(
    {
        'results': out,
    },
    sys.stdout,
    sort_keys=True,
    check_circular=False,
)
