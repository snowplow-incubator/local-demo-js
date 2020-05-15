#!/bin/bash

root_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )/..

cd $root_path/tmp

git clone https://github.com/snowplow-incubator/snowplow-up.git

cd snowplow-up && make up

pwd
