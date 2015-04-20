#!/bin/bash

rm -rf css
cp -r ../css/ .

rm -rf js
mkdir js js/lib

find ../js/ -type f -print0 | sed -z 's|^../||' | xargs -0 -n1 -P4 -i -t \
	closure --js '../{}' --js_output_file '{}' --create_source_map '{}.map'

find js -type f -name '*.js' -print0 | xargs -0 -t \
	sed -r --in-place 's#atte.fi/berrytweaks/(css|js)/#atte.fi/berrytweaks/min/\1/#'
