#!/bin/bash
set -eu

source package.config.sh

modclean --run --patterns="default:*"
rm -f ./deploy.zip
zip -r ./deploy.zip index.js node_modules/

aws s3 cp deploy.zip "s3://$BUCKET/"
echo "https://s3.amazonaws.com/$BUCKET/deploy.zip"
