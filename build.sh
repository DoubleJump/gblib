#!/bin/sh

JS_SRC="src/js/main.js"
JS_DEST="build/main.js"

ASSET_SRC="assets/"
ASSET_DEST="build/assets.gl"
ASSET_TARGET="desktop"

clear
python src/py/compile_js.py --debug --src $JS_SRC --dest $JS_DEST
python src/py/compile_assets.py --src $ASSET_SRC --dest $ASSET_DEST --target $ASSET_TARGET