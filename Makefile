.PHONY: all clean min/css min/js

all: min min/css min/js

# min/functions: functions
# 	mkdir -p min/functions/
# 	cp -r functions/* min/functions/

min: static
	mkdir -p min/
	cp -r static/* min/

min/js: js
	mkdir -p min/js/
	babel-minify --mangle false --out-dir min/js/lib js/lib
	babel-minify --mangle false --out-dir min/js js
	sed --in-place -e 's|RELEASE_BASE|${CF_PAGES_URL}|' -e 's|GAPI_KEY|${GAPI_KEY}|' min/js/init.js min/js/init.js

min/css: css
	mkdir -p min/css/
	cp css/* min/css/

clean:
	rm -rf min
