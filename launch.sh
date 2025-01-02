#!/usr/bin/env zsh
if [[ -z "$Nosh_Dir" ]]; then
  source .envrc
fi
bun app/graybin/launch.js