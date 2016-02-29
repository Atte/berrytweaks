import cgi
import cgitb
cgitb.enable(format=None)

print('Content-Type: application/json')
print('Access-Control-Allow-Origin: *')
print()

form = cgi.FieldStorage()
count = int(form.getfirst('count', 500))
assert count > 0
assert count <= 500

import sys
import json
import glob
from collections import defaultdict

LOG_PATH = '/home/berry/.weechat/logs'

events = []

fnames = sorted(glob.iglob(LOG_PATH + '/irc.berrytube.#berrytube.*.weechatlog'), reverse=True)
with open(fnames[0], 'r') as fh:
	for line in fh:
		time, nick, msg = line[:-1].split('\t', 2)
		time += ' GMT'

		if nick == '--':
			if msg.startswith('BerryTube has changed topic for #berrytube '):
				msg = msg[msg.rindex('Now Playing: ', 20)+13:-1]
				title, type, id = msg.rsplit('|', 2)

				events.append({
					'type': 'video',
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
					}
				})
		elif nick in ('-->', '<--', ):
			events.append({
				'type': 'connection',
				'data': {
					'nick': msg[:msg.index(' ')],
					'type': 'join' if nick == '-->' else 'part',
					'timestamp': time,
				}
			})
		else:
			emote = False
			if nick == ' *':
				emote = 'act'
				nick, msg = msg.split(' ', 1)
			elif nick[0] in ('@', '%', '+', ):
				nick = nick[1:]

			events.append({
				'type': 'message',
				'data': {
					'ghost': True,
					'msg': {
						'emote': emote,
						'metadata': {
							'channel': 'main',
							'flair': 0,
						},
						'msg': msg,
						'multi': 1,
						'nick': nick,
						'timestamp': time,
						'type': 0,
					},
				},
			})

json.dump({
	'events': events[-count:]
}, sys.stdout)
