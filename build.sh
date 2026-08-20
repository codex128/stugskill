#!/usr/bin/env bash

rm -rf /dist
mkdir dist
cp src/*.json dist/
cp src/*.html dist/
cp src/*.png dist/
webpack --watch & web-ext run --source-dir=dist
(cd dist && zip -r ../stugskill.zip .)
