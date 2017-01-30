import cgi
import cgitb
cgitb.enable(format=None)

print('Content-Type: application/json')
print('Access-Control-Allow-Origin: *')
print()

import sys
import time
import glob
import json

INCLUDE_DEBUG = False
LOG_PATH = '/var/bt_logs/'  # NOTE: Must include trailing slash!
CACHE_FNAME = './cache/nicks.json'

# Starting data
debug = []

aliases = {
	'Ajaxtitan': {'Ajaxtitan496'},
	'ayrl': {'aryl'},
	'Bassau': {'bassphone', 'BassPhone'},
	'bionictigershk': {'bionictigershrk'},
	'Chrono': {'Chrona'},
	'Chryleza': {'Velvetremedy'},
	'Cuddles_theBear': {'irCuddles_tBear'},
	'DigitalVagrant': {'Digi', 'digiphone'},
	'Drywin': {'Drywinn'},
	'GentlemanGin': {'elbows', 'butts', 'EezMaiMynd', 'Spike', 'clouds', 'Water', 'geigerrulesbig', 'DolphinButt', 'ThornInYouSide', 'AssholeGin', 'Cat', 'VodkaIsGross'},
	'heart04winds': {'hart04winds'},
	'Kimmychan': {'Kimkam'},
	'Lavender': {'LavPhone'},
	'lovershy': {'loversh'},
	'maadneet': {'maadn'},
	'maharito': {'mahaquesarito', 'Mahayro'},
	'Matthies7': {'Matthies'},
	'Malsententia': {'Malpone', 'malpone', 'Molestentia'},
	'meat_popsiclez': {'Meat_', 'meat_'},
	'PonisEnvy': {'PonircEnvy'},
	'Cocoa': {'SomeStupidGuy', 'NotSSG'},
	'shadowthug': {'shadowphone'},
	'ShippingIsMagic': {'a_Nickname', 'FlutterNickname'},
	'Smidqe': {'SmidqePi'},
	'WeedWuff': {'SpecialCoalWuff'},
	'Yakoshi': {'Yagoshi'},
}

# right side in lowercase!
prefixes = {
	'Blueshift': 'blue',
	'ChocoScoots': 'choco',
	'discordzilla': 'disczilla',
	'IAmInASnuggie': 'snuggie',
	'Kris321': 'kris3',
	'KKGourmet': 'kkgour',
	'SalientBlue': 'salient',
	'shado_jaguar': 'shado_',
	'ShippingIsMagic': 'shippingis',
	'SomeStupidGuy': 'somestupid',
	'stevepoppers': 'steve',
	'Toastdeib': 'toast',
	'Trellmor': 'trell',
	'WeedWuff': 'weed',
}

forcebases = {
	'LavenderFox',
	'SnowBolt',
	'StevenAD',
	'Q0',
}

nonbases = {
	'DEAD',
	'Discord',
	'Loversh',
	'Luna',
	'matt',
	'meat',
	'pony',
} | set(prefixes.values())
for als in aliases.values():
	nonbases.union(als)

start_time = time.time()

# Load latest cache
with open(CACHE_FNAME, encoding='utf-8') as fh:
	try:
		cache = json.load(fh)
	except:
		cache = {}
last_file = cache.get('last_file')
nicks = cache.get('nicks', {})

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
				first = nick[0]
				if first == '@' or first == '%' or first == '+':
					nick = nick[1:]
				if len(nick) >= 4 or nick in forcebases:
					nicks[nick] = (nick.lower(), len(nick))

# Save cache
with open(CACHE_FNAME, 'w', encoding='utf-8') as fh:
	json.dump({
		'last_file': fnames[-1],
		'nicks': nicks,
	}, fh)
debug.append('file load time: {}'.format(time.time() - start_time))

# Find prefixes/suffixes
EMPTY_SET = set()
for nick, (lnick, nick_len) in nicks.items():
	als = set(
		alias
		for alias, (lalias, alias_len) in nicks.items()
		if alias_len >= nick_len and (
			lalias.startswith(lnick) or
			lalias.endswith(lnick) or
			(nick in prefixes and lalias.startswith(prefixes[nick]))
		) and alias != nick and alias not in forcebases
	)
	if als:
		aliases[nick] = aliases.get(nick, EMPTY_SET) | als
debug.append('prefix find time: {}'.format(time.time() - start_time))

# Resolve recursive aliases
for base, als in aliases.copy().items():
	if base in nonbases:
		continue

	news = set()
	for al in als:
		if al in aliases and al not in forcebases:
			news.update(aliases.pop(al))
	news.discard(base)
	als.update(news)

# Remove any remaining non-bases
for key in nonbases:
	try:
		del aliases[key]
	except KeyError:
		pass

# Output results
form = cgi.FieldStorage()
resolve = form.getfirst('resolve')

if resolve:
	resolve = resolve.lower()

	out = set([resolve])
	for base, als in aliases.items():
		if resolve == base.lower() or resolve in map(str.lower, als):
			out = als
			out.add(base)
			break
	aliases = {'aliases': out}
elif INCLUDE_DEBUG and debug:
	debug.append('total time: {}'.format(time.time() - start_time))
	aliases['_debug'] = debug

json.dump(
	aliases, sys.stdout,
	default=list,
	sort_keys=True,
	check_circular=False,
	separators=None if 'pretty' in form else (',', ':'),
	indent=4 if 'pretty' in form else None
)
