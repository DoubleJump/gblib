#!/bin/bash
#build.sh

clear

INPUT="src/main.cpp"
OUTPUT="-obuild/msdf.a"
INCLUDES="-Ifreetype/include"
LIB_FOLDERS="-Lfreetype/win32"
LIBS="-lfreetype"
FLAGS="-O2 --std=c++11"

if g++ $FLAGS $INPUT $INCLUDES $LIB_FOLDERS $LIBS $OUTPUT; then
./build/msdf.a

echo "AWWW YEAH!";
else
echo "OH NO!";
fi