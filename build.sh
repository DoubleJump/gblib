#!/bin/sh

JS_SRC="src/js/main.js"
JS_DEST="build/main.js"

ASSET_SRC="src/"
ASSET_DEST="build/assets.gl"
ASSET_TARGET="desktop"

python build.py --debug --src $JS_SRC --dest $JS_DEST
python src/py/resource_compiler.py --src $ASSET_SRC --dest $ASSET_DEST --target $ASSET_TARGET