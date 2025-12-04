#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📊 Мониторинг облачной платформы
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Мониторинг системы"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Статус контейнеров
echo "🐳 Статус контейнеров:"
docker-compose ps
echo ""

# Использование ресурсов
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💻 Использование ресурсов:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    library-mongo library-redis library-backend library-frontend library-nginx-lb
echo ""

# Health checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 Health статус:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
services=("library-mongo" "library-redis" "library-backend" "library-frontend" "library-nginx-lb")

for service in "${services[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
        status=$(docker inspect --format='{{.State.Health.Status}}' $service 2>/dev/null || echo "no healthcheck")
        if [ "$status" = "healthy" ]; then
            echo "✅ $service: Healthy"
        elif [ "$status" = "no healthcheck" ]; then
            echo "ℹ️  $service: Running"
        else
            echo "⚠️  $service: $status"
        fi
    else
        echo "❌ $service: Not running"
    fi
done
echo ""

# Сетевая информация
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Сети:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker network ls | grep library
echo ""

# Volumes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Постоянные тома:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker volume ls | grep library
echo ""

# API проверка
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 API проверка:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if curl -s http://localhost/health > /dev/null; then
    echo "✅ Load Balancer: OK"
else
    echo "❌ Load Balancer: Failed"
fi

if curl -s http://localhost/api/stats > /dev/null; then
    stats=$(curl -s http://localhost/api/stats)
    echo "✅ Backend API: OK"
    echo "   $stats"
else
    echo "❌ Backend API: Failed"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Для просмотра логов:"
echo "  docker-compose logs -f [service]"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
