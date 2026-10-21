# ═══════════════════════════════════════════════════════
#  JournalismLab — Dockerfile
#  Nginx static server + envsubst for Firebase env vars
#  Dokploy sets env vars → entrypoint bakes them into env.js
# ═══════════════════════════════════════════════════════
FROM nginx:1.25-alpine

# Copy site files
COPY index.html       /usr/share/nginx/html/
COPY pathfinder.html  /usr/share/nginx/html/
COPY register.html    /usr/share/nginx/html/
COPY admin.html       /usr/share/nginx/html/
COPY style.css        /usr/share/nginx/html/
COPY script.js        /usr/share/nginx/html/
COPY assets/          /usr/share/nginx/html/assets/
COPY robots.txt       /usr/share/nginx/html/
COPY sitemap.xml      /usr/share/nginx/html/
COPY site.webmanifest /usr/share/nginx/html/
COPY env.template.js  /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Entrypoint: substitute env vars into env.template.js → env.js, then start nginx
CMD ["/bin/sh", "-c", \
  "envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"]
