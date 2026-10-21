#!/bin/sh
set -e

ME=$(basename "$0")

if [ -f /usr/share/nginx/html/env.template.js ]; then
  echo "$ME: info: Generating /usr/share/nginx/html/env.js from /usr/share/nginx/html/env.template.js"
  envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
fi

exit 0
