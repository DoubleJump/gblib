@echo off

set JS_SRC=src\js\main.js
set JS_DEST=build\main.js

set ASSET_SRC=assets\
set ASSET_DEST=build\assets.gl
set ASSET_TARGET=desktop

call cls
python src\py\compile_js.py --debug --src %JS_SRC% --dest %JS_DEST%
python src\py\compile_assets.py --src %ASSET_SRC% --dest %ASSET_DEST% --target %ASSET_TARGET%