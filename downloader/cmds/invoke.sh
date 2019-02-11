#!/bin/bash -xe

payload=$1
aws lambda invoke --invocation-type Event --function-name lambda-tube-downloader --payload $payload results