#!/usr/bin/env zsh
ps wax | grep launch.js | grep -v grep | awk '{print $1;}' | xargs kill -9
