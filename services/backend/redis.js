const redis = require('redis');

let redisClient;
let isRedisConnected = false;

async function connectRedis() {
    try {
        const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
        
        console.log('🔄 Подключение к Redis...');
        console.log('📍 URL:', REDIS_URL);
        
        redisClient = redis.createClient({
            url: REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.log('❌ Слишком много попыток переподключения к Redis');
                        return new Error('Превышен лимит переподключений');
                    }
                    return retries * 100;
                }
            }
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis ошибка:', err.message);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('🔄 Redis подключается...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis подключен и готов к работе!');
            isRedisConnected = true;
        });

        redisClient.on('reconnecting', () => {
            console.log('🔄 Redis переподключение...');
            isRedisConnected = false;
        });

        await redisClient.connect();
        
    } catch (error) {
        console.error('❌ Ошибка подключения к Redis:', error.message);
        console.log('⚠️  Продолжаем работу без кеширования');
        isRedisConnected = false;
    }
}

// Кеширование с TTL (Time To Live)
async function cacheSet(key, value, ttl = 300) {
    if (!isRedisConnected) return false;
    
    try {
        const serialized = JSON.stringify(value);
        await redisClient.setEx(key, ttl, serialized);
        console.log(`📦 Кеш сохранен: ${key} (TTL: ${ttl}s)`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения в кеш:', error.message);
        return false;
    }
}

// Получение из кеша
async function cacheGet(key) {
    if (!isRedisConnected) return null;
    
    try {
        const cached = await redisClient.get(key);
        if (cached) {
            console.log(`✅ Кеш найден: ${key}`);
            return JSON.parse(cached);
        }
        console.log(`❌ Кеш не найден: ${key}`);
        return null;
    } catch (error) {
        console.error('❌ Ошибка чтения из кеша:', error.message);
        return null;
    }
}

// Удаление из кеша
async function cacheDelete(key) {
    if (!isRedisConnected) return false;
    
    try {
        await redisClient.del(key);
        console.log(`🗑️  Кеш удален: ${key}`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка удаления из кеша:', error.message);
        return false;
    }
}

// Инвалидация кеша по паттерну
async function cacheInvalidatePattern(pattern) {
    if (!isRedisConnected) return false;
    
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`🗑️  Инвалидирован кеш: ${pattern} (${keys.length} ключей)`);
        }
        return true;
    } catch (error) {
        console.error('❌ Ошибка инвалидации кеша:', error.message);
        return false;
    }
}

// Middleware для кеширования
function cacheMiddleware(keyPrefix, ttl = 300) {
    return async (req, res, next) => {
        if (!isRedisConnected) {
            return next();
        }

        const cacheKey = `${keyPrefix}:${req.originalUrl}`;
        
        try {
            const cached = await cacheGet(cacheKey);
            if (cached) {
                res.setHeader('X-Cache', 'HIT');
                return res.json(cached);
            }
            
            res.setHeader('X-Cache', 'MISS');
            
            // Перехватываем res.json для сохранения в кеш
            const originalJson = res.json.bind(res);
            res.json = function(data) {
                cacheSet(cacheKey, data, ttl);
                return originalJson(data);
            };
            
            next();
        } catch (error) {
            console.error('❌ Ошибка middleware кеширования:', error.message);
            next();
        }
    };
}

module.exports = {
    connectRedis,
    cacheSet,
    cacheGet,
    cacheDelete,
    cacheInvalidatePattern,
    cacheMiddleware,
    getClient: () => redisClient,
    isConnected: () => isRedisConnected
};
