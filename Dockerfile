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

# Copy entrypoint hook into /docker-entrypoint.d/ so official nginx startup runs it automatically
COPY 40-envsubst-on-envjs.sh /docker-entrypoint.d/40-envsubst-on-envjs.sh
RUN chmod +x /docker-entrypoint.d/40-envsubst-on-envjs.sh

# Pre-generate env.js during build so the file is guaranteed to exist on disk from the very start
RUN envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Default command
CMD ["nginx", "-g", "daemon off;"]
