import cgi
import cgitb
cgitb.enable(format=None)

print('Content-Type: application/json')
print('Access-Control-Allow-Origin: *')
print()

form = cgi.FieldStorage()
count = int(form.getfirst('count', 100))
assert count > 0
assert count <= 500

import sys
import json
import glob
from datetime import datetime, timezone
from collections import defaultdict

events = []
def done():
	events.reverse()
	json.dump({
		'events': events,
	}, sys.stdout)
	sys.exit(0)

for fname in sorted(glob.iglob('/home/berry/.weechat/logs/irc.berrytube.#berrytube.*.weechatlog'), reverse=True):
	with open(fname) as fh:
		for line in reversed(list(fh)):
			time, nick, msg = line[:-1].split('\t', 2)
			time = int(datetime.strptime(time, '%Y-%m-%d %H:%M:%S').replace(tzinfo=timezone.utc).timestamp() * 1000)

			if nick == '--':
				if msg.startswith('BerryTube has changed topic for #berrytube '):
					msg = msg[msg.rindex('Now Playing: ', 20)+13:-1]
					title, type, id = msg.rsplit('|', 2)

					events.append({
						'type': 'vid',
						'data': {
							'timestamp': time,
							'title': title,
							'link': {
									'yt': 'https://www.youtube.com/watch?v=' + id,
									'vimeo': 'https://vimeo.com/' + id,
									'dm': 'http://www.dailymotion.com/video/' + id,
									'osmf': id,
									'soundcloud': 'https://atte.fi/soundcloud/?' + id[2:],
							}.get(type),
						},
					})
			elif nick in ('-->', '<--', ):
				events.append({
					'type': 'conn',
					'data': {
						'nick': msg[:msg.index(' ')],
						'type': 'join' if nick == '-->' else 'part',
						'timestamp': time,
					},
				})
			else:
				emote = False
				if nick == ' *':
					emote = 'act'
					nick, msg = msg.split(' ', 1)
				elif nick[0] in ('@', '%', '+', ):
					nick = nick[1:]

				events.append({
					'type': 'msg',
					'data': {
						'emote': emote,
						'msg': msg,
						'nick': nick,
						'timestamp': time,
					},
				})

			if len(events) >= count:
				done()
done()
