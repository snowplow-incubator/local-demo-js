#!/bin/bash

script_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

npm install -g ttab

ttab $script_path/micro.sh
