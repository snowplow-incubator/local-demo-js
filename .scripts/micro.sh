#!/bin/bash

root_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )/..

cd $root_path

java -jar micro/snowplow-micro-0.1.0.jar --collector-config micro/micro.conf --iglu micro/iglu.json
