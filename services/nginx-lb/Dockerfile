FROM nginx:alpine

# Копируем конфигурацию load balancer
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Удаляем дефолтный конфиг
RUN rm -f /etc/nginx/conf.d/default.conf.default

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
