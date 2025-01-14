#!/bin/sh

nginx -g "daemon on;"

cd /app/flowise-embed
yarn dev
