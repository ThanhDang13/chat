FROM nginx:stable-alpine

# Copy nginx config for SPA + API proxy
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Nx React app
COPY dist/apps/web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]