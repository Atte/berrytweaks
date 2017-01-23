import cgi
import cgitb
cgitb.enable(format=None)

print('Content-Type: application/json')
print('Access-Control-Allow-Origin: *')
print()

import sys
import time
import glob
from collections import defaultdict
try:
	import simplejson as json
except ImportError:
	import json

INCLUDE_DEBUG = False
LOG_PATH = '/var/bt_logs/'  # NOTE: Must include trailing slash!
CACHE_FNAME = './cache/nicks.json'

# Starting data
debug = []

aliases = defaultdict(set, (
	(k, set(v))
	for k, v in {
		'Ajaxtitan': ['Ajaxtitan496'],
		'ayrl': ['aryl'],
		'Bassau': ['bassphone', 'BassPhone'],
		'bionictigershk': ['bionictigershrk'],
		'Chrono': ['Chrona'],
		'Chryleza': ['Velvetremedy'],
		'Cuddles_theBear': ['irCuddles_tBear'],
		'DigitalVagrant': ['Digi', 'digiphone'],
		'Drywin': ['Drywinn'],
		'GentlemanGin': ['elbows', 'butts', 'EezMaiMynd', 'Spike', 'clouds', 'Water', 'geigerrulesbig', 'DolphinButt', 'ThornInYouSide', 'AssholeGin', 'Cat', 'VodkaIsGross'],
		'heart04winds': ['hart04winds'],
		'Kimmychan': ['Kimkam'],
		'Lavender': ['LavPhone'],
		'lovershy': ['loversh'],
		'maadneet': ['maadn'],
		'maharito': ['mahaquesarito', 'Mahayro'],
		'Matthies7': ['Matthies'],
		'Malsententia': ['Malpone', 'malpone', 'Molestentia'],
		'meat_popsiclez': ['Meat_', 'meat_'],
		'PonisEnvy': ['PonircEnvy'],
		'Cocoa': ['SomeStupidGuy', 'NotSSG'],
		'shadowthug': ['shadowphone'],
		'ShippingIsMagic': ['a_Nickname', 'FlutterNickname'],
		'Smidqe': ['SmidqePi'],
		'WeedWuff': ['SpecialCoalWuff'],
		'Yakoshi': ['Yagoshi'],
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
		'WeedWuff': 'Weed',
	}.items()
}

forcebases = set([
	'LavenderFox',
	'SnowBolt',
	'StevenAD',
	'Q0',
])

nonbases = set([
	'DEAD',
	'Discord',
	'Loversh',
	'Luna',
	'matt',
	'meat',
	'pony',
]) | set(
	val
	for vals in aliases.values()
	for val in vals
) | set(prefixes.values())

# Load latest cache
start_time = time.time()
with open(CACHE_FNAME, encoding='utf-8') as fh:
	try:
		cache = json.load(fh)
	except:
		cache = {}
last_file = cache.get('last_file')
nicks = set(cache.get('nicks', set()))

# Load nicks from new files
fnames = sorted(glob.iglob(LOG_PATH + 'irc.berrytube.#berrytube.*.weechatlog'))
cached = last_file is not None
for fname in fnames:
	if cached:
		if fname != last_file:
			continue
		cached = False

	with open(fname, encoding='utf-8') as fh:
		for line in fh:
			try:
				nick = line[20:line.index('\t', 22)]
			except ValueError:
				pass
			else:
				nicks.add(nick[1:] if nick[0] in ('@', '%', '+', ) else nick)

# Save cache
with open(CACHE_FNAME, 'w', encoding='utf-8') as fh:
	json.dump({
		'last_file': fnames[-1],
		'nicks': list(nicks),
	}, fh)
debug.append('file load: {}'.format(time.time() - start_time))

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
elif INCLUDE_DEBUG and debug:
	debug.append('total: {}'.format(time.time() - start_time))
	aliases['_debug'] = debug

json.dump(
	aliases, sys.stdout,
	default=list,
	sort_keys=True,
	check_circular=False,
	separators=None if 'pretty' in form else (',', ':'),
	indent=4 if 'pretty' in form else None
)
