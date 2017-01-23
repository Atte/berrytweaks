.PHONY: all clean min/js min/css

all: min/js min/css

min/js: js
	mkdir -p min/js/
	find js/ -type f -print0 | sed -z 's|^../||' | xargs -0 -n1 -P4 -i -t \
		closure --js 'js/{}' --js_output_file 'min/js/{}' --create_source_map 'min/js/{}.map'
	find min/js/ -type f -name '*.js' -print0 | xargs -0 -t \
		sed -r --in-place 's#atte.fi/berrytweaks/(css|js)/#atte.fi/berrytweaks/min/\1/#'

min/css: css
	mkdir -p min/css/
	cp css/* min/css/

clean:
	rm -rf min

