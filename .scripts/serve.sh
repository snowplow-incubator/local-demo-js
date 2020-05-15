#!/bin/bash

root_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )/..

cd $root_path

npx ttab npx http-server $root_path/static/view/ -p 8080 -a 127.0.0.1 -S -K ./micro/key.pem -C ./micro/cert.pem

npx ttab npx http-server $root_path/static/view/ -p 8081 -a 127.0.0.1 --proxy http://127.0.0.1:9090 --cors

open https://127.0.0.1:8080
