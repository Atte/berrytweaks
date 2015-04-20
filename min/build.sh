#!/bin/bash

rm -rf tmp
mkdir tmp tmp/js tmp/js/lib

cp -r ../css/ tmp/

find '../js/' -type f -print0 | sed -z 's|^../||' | xargs -0 -n1 -P4 -i -t \
	closure --js '../{}' --js_output_file 'tmp/{}' --create_source_map 'tmp/{}.map'

find 'tmp/js' -type f -name '*.js' -print0 | xargs -0 -t \
	sed -r --in-place 's#atte.fi/berrytweaks/(css|js)/#atte.fi/berrytweaks/min/\1/#'

rm -rf css js
mv tmp/{css,js} .
rm -rf tmp
