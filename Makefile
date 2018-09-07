.PHONY: all clean min/css min/js

all: min/css min/js

rev := $(shell git rev-parse --short --verify HEAD)
deploydir := /mnt/bulk/www/cdn.atte.fi/berrytweaks/$(rev)

min/js: js
	mkdir -p min/js/
	babel-minify --mangle false --out-dir min/js/lib js/lib
	babel-minify --mangle false --out-dir min/js js
	mkdir -p $(deploydir)
	cp -r min/* $(deploydir)/
	sed --in-place "s|'RELEASE'|'$(rev)'|" min/js/init.js $(deploydir)/js/init.js

min/css: css
	mkdir -p min/css/
	cp css/* min/css/
	mkdir -p $(deploydir)
	cp -r min/* $(deploydir)/

clean:
	rm -rf min
