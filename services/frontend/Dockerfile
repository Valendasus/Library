# Frontend Nginx Dockerfile
FROM nginx:alpine

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Копируем статические файлы
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Копируем кастомную конфигурацию nginx  
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
