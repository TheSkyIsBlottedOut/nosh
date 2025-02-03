#!/usr/bin/env zsh
if [[ -z "$Nosh_Dir" ]]; then
  source .envrc
fi
if [[ -z "$1" ]]; then
  echo "Booting default app graybin..."
  bun app/graybin/launch.js
else
  echo "Booting app $1..."
  bun app/$1/launch.js
fi
