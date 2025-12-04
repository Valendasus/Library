#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🤖 Настройка локального GitHub Actions Self-Hosted Runner
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 НАСТРОЙКА SELF-HOSTED RUNNER ДЛЯ CI/CD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop."
    exit 1
fi

echo "✅ Docker установлен"

# Создание директории для runner
RUNNER_DIR="$HOME/actions-runner"
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

echo ""
echo "📋 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Откройте ваш репозиторий на GitHub:"
echo "   https://github.com/Valendasus/Library"
echo ""
echo "2. Перейдите в Settings → Actions → Runners"
echo ""
echo "3. Нажмите 'New self-hosted runner'"
echo ""
echo "4. Выберите macOS и следуйте инструкциям для загрузки runner"
echo ""
echo "5. Выполните команды из раздела 'Download' и 'Configure'"
echo ""
echo "6. Запустите runner командой:"
echo "   ./run.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Директория runner: $RUNNER_DIR"
echo ""
echo "💡 После настройки runner, ваш workflow будет автоматически"
echo "   деплоить проект локально при push в main"
echo ""
