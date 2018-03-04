.PHONY: all clean min/js min/css

all: min/js min/css

rev := $(shell git rev-parse --short --verify HEAD)
deploydir := /mnt/bulk/www/cdn.atte.fi/berrytweaks/$(rev)

min/js: js
	mkdir -p min/js/
	babel-minify --mangle false --out-dir min/js/lib js/lib
	babel-minify --mangle false --out-dir min/js js
	sed --in-place "s|'RELEASE'|'$(rev)'|" min/js/init.js
	mkdir -p $(deploydir)
	cp -r min/* $(deploydir)/

min/css: css
	mkdir -p min/css/
	cp css/* min/css/
	mkdir -p $(deploydir)
	cp -r min/* $(deploydir)/

clean:
	rm -rf min
