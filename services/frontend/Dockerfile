# Frontend Nginx Dockerfile
FROM nginx:alpine

# Копируем frontend файлы
COPY . /usr/share/nginx/html

FROM nginx:alpine

# Копируем статические файлы
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Копируем кастомную конфигурацию nginx  
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Nginx запустится автоматически

# Открываем порт
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
