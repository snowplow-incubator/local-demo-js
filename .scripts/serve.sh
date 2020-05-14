#!/bin/bash

root_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )/..

cd $root_path

npm install -g http-server

npm install -g ttab

ttab http-server $root_path/static/view/ -p 8080 -a 127.0.0.1

open http://127.0.0.1:8080
