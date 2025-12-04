# 🏛️ Облачная платформа электронной библиотеки

> **Микросервисная архитектура с 5 Docker контейнерами**

[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen.svg)](https://www.mongodb.com/)

## 🚀 Быстрый старт

### Обычный режим (Docker Compose)
```bash
# Запуск
./deployment/start.sh

# Остановка
./deployment/stop.sh

# Мониторинг
./deployment/monitor.sh
```

### 🔥 Кластеризованный режим (Docker Swarm)
```bash
# Развёртывание кластера (3 backend + 2 frontend реплики)
./deployment/deploy-swarm.sh

# Масштабирование backend до 5 реплик
docker service scale library_backend=5

# Просмотр статуса кластера
docker stack services library

# Удаление кластера
docker stack rm library
```

**Приложение:** http://localhost

---

## 🏗️ Архитектура

### Обычный режим (5 контейнеров)
```
    Client → [Nginx LB] → Backend → Mongo
                  ↓         ↓
              Frontend    Redis
```

### 🔥 Кластеризованный режим (7 реплик)
```
              Client
                ↓
        Frontend x2 (Nginx)
            ↓    ↓ 
         Backend x3 (API)
            ↓    ↓
        [Mongo] [Redis]
```

| # | Сервис | Compose | Swarm | Технология |
|---|--------|---------|-------|-----------|
| 1 | MongoDB | 1x | 1x | mongo:7 |
| 2 | Redis | 1x | 1x | redis:7-alpine |
| 3 | Backend | 1x | **3x** | Node.js 18 |
| 4 | Frontend | 1x | **2x** | Nginx + HTML/CSS/JS |

**Всего в кластере:** 7 реплик с автоматическим failover  
**Load Balancing:** Docker Swarm routing mesh

---

## 📁 Структура

```
library/
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # 🤖 CI/CD Pipeline
├── services/
│   ├── backend/              # Node.js API
│   ├── frontend/             # Web UI
│   └── nginx-lb/             # Load Balancer
├── deployment/
│   ├── start.sh              # Запуск (Compose)
│   ├── stop.sh               # Остановка
│   ├── monitor.sh            # Мониторинг
│   ├── deploy-swarm.sh       # 🔥 Кластер (Swarm)
│   └── setup-runner.sh       # 🤖 Настройка CI/CD runner
├── docker-compose.yml        # Обычный режим
├── docker-compose.swarm.yml  # 🔥 Кластеризация
├── ARCHITECTURE.md           # Документация архитектуры
├── CI-CD.md                  # 🤖 Документация CI/CD
└── README.md                 # Этот файл
```

---

## 🔌 API Endpoints

**Base URL:** `http://localhost/api`

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/books` | Все книги |
| POST | `/books` | Создать книгу |
| PUT | `/books/:id` | Обновить книгу |
| DELETE | `/books/:id` | Удалить книгу |
| GET | `/search?q=` | Поиск |
| GET | `/stats` | Статистика |

---

## 🤖 CI/CD

Автоматический деплой при push в `main`:

```bash
# Настройка локального runner
./deployment/setup-runner.sh

# Подробнее в CI-CD.md
```

**Pipeline этапы:**
1. ✅ Тесты backend
2. 🔨 Сборка Docker образов
3. 🧪 Интеграционное тестирование
4. 🚀 Автоматический деплой на локальную машину

---

## 🔧 Управление

```bash
# Масштабирование backend
docker-compose up -d --scale backend=5

# Логи всех сервисов
docker-compose logs -f

# Логи backend
docker-compose logs -f backend

# Перезапуск сервиса
docker-compose restart backend

# Полная очистка (удаляет данные!)
docker-compose down -v
```

---

## 📊 Мониторинг

- **Health Check:** http://localhost/health
- **API Stats:** http://localhost/api/stats
- **Logs:** `docker-compose logs -f`
- **Resources:** `docker stats`

---

## ✨ Возможности

- ✅ Микросервисная архитектура (5 контейнеров)
- ✅ Redis кеширование (TTL 60s)
- ✅ Nginx Load Balancing
- ✅ Health Checks для всех сервисов
- ✅ Изолированные Docker сети
- ✅ Persistent Volumes

---

## 📚 Документация

- [ARCHITECTURE.md](ARCHITECTURE.md) - Полная архитектура системы
- [services/backend/](services/backend/) - Backend документация
- [services/frontend/](services/frontend/) - Frontend документация

---

**🎓 Курсовая работа: "Настройка и администрирование облачной платформы для управления электронной библиотекой"**
