const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Подключение к MongoDB...');
    console.log(`📍 URI: ${process.env.MONGODB_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB подключена успешно!');
    console.log(`📊 База данных: ${conn.connection.name}`);
    console.log(`🖥️  Хост: ${conn.connection.host}`);
    console.log(`🔌 Порт: ${conn.connection.port}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Обработка событий подключения
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose подключен к MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Ошибка подключения Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose отключен от MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 MongoDB соединение закрыто через app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    console.error('💡 Убедитесь, что MongoDB запущена: mongod');
    process.exit(1);
  }
};

module.exports = connectDB;
