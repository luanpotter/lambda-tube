#!/bin/bash -xe

region=us-east-2
role=$1

file=function.zip
zip -r $file *.js node_modules/

aws lambda create-function --region $region --role $role --function-name lambda-tube-downloader --runtime nodejs8.10 --zip-file fileb://$file --handler main.handler --timeout 900
rm $file
