import cgi
import cgitb
cgitb.enable(format=None)

print('Content-Type: application/json')
print('Access-Control-Allow-Origin: *')
print()

import sys
import json
from collections import defaultdict
from pymongo import MongoClient

# Starting data
aliases = defaultdict(set, (
	(k, set(v))
	for k, v in {
		'Ajaxtitan': ['Ajaxtitan496'],
		'ayrl': ['aryl'],
		'bionictigershk': ['bionictigershrk'],
		'Chrono': ['Chrona'],
		'Cuddles_theBear': ['irCuddles_tBear'],
		'Lavender': ['LavPhone'],
		'Drywin': ['Drywinn'],
		'lovershy': ['loversh'],
		'maharito': ['mahaquesarito', 'Mahayro'],
		'Malsententia': ['Malpone', 'malpone'],
		'PonisEnvy': ['PonircEnvy'],
		'shadowthug': ['shadowphone'],
		'ShippingIsMagic': ['a_Nickname', 'FlutterNickname'],
		'WeedWuff': ['SpecialCoalWuff'],
	}.items()
))

prefixes = {
	k: v.lower()
	for k, v in {
		'Blueshift': 'Blue',
		'ChocoScoots': 'Choco',
		'discordzilla': 'disczilla',
		'IAmInASnuggie': 'Snuggie',
		'Kris321': 'kris3',
		'KKGourmet': 'KKGour',
		'SalientBlue': 'Salient',
		'shado_jaguar': 'shado_',
		'ShippingIsMagic': 'ShippingIs',
		'SomeStupidGuy': 'SomeStupid',
		'stevepoppers': 'steve',
		'Toastdeib': 'Toast',
		'Trellmor': 'Trell',
	}.items()
}

forcebases = set([
	'LavenderFox',
	'StevenAD',
	'Q0',
])

nonbases = set([
	'Discord',
	'Loversh',
	'Luna',
	'meat',
]) | set(
	val
	for vals in aliases.values()
	for val in vals
) | set(prefixes.values())

# Load all nicks
mongo = MongoClient()
nicks = set(mongo.berrylog.log.distinct('nick'))
mongo.close()

# Find prefixes/suffixes
for nick in nicks:
	nicklen = len(nick)
	if nicklen < 4 and nick not in forcebases:
		continue

	lnick = nick.lower()
	prefix = prefixes.get(nick)

	for alias in nicks:
		lalias = alias.lower()
		if alias != nick and alias not in forcebases and (
			lalias.startswith(lnick) or
			lalias.endswith(lnick) or
			alias.replace('I', 'l') == nick or
			(prefix is not None and lalias.startswith(prefix))
		):
			aliases[nick].add(alias)

# Resolve recursive aliases
for base, als in aliases.copy().items():
	if base in nonbases:
		continue

	news = set()
	for al in als:
		if al in aliases and al not in forcebases:
			news.update(aliases[al])
			del aliases[al]
	news.discard(base)
	als.update(news)

# Remove any remaining non-bases
aliases = {
	key: val
	for key, val in aliases.items()
	if key not in nonbases
}

# Output results
form = cgi.FieldStorage()
resolve = form.getfirst('resolve')

if resolve:
	resolve = resolve.lower()

	out = set([resolve])
	for base, als in aliases.items():
		if resolve == base.lower() or resolve in map(lambda s: s.lower(), als):
			out = als
			out.add(base)
			break
	aliases = {'aliases': out}

json.dump(
	aliases, sys.stdout,
	default=list,
	sort_keys=True,
	check_circular=False,
	separators=None if 'pretty' in form else (',', ':'),
	indent=4 if 'pretty' in form else None
)
