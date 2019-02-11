#!/bin/bash -xe

region=us-east-2

file=function.zip
zip -r $file *.js node_modules/
aws lambda update-function-code --region $region --function-name lambda-tube-downloader --zip-file fileb://$file
rm $file