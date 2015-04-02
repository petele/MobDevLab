#!/bin/sh

cd scratch

npm install

forever start serviceManager.js -m 1 -l ./logs/serviceManager.log

node client.js
