require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');
const { connectRedis, cacheMiddleware, cacheInvalidatePattern, isConnected } = require('./redis');
const Book = require('./models/Book');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB и Redis
connectDB();
connectRedis();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toLocaleString('ru-RU')}`);
  next();
});

// Инициализация тестовых данных (только если база пуста)
const initializeData = async () => {
  try {
    const count = await Book.countDocuments();
    if (count === 0) {
      console.log('📚 База данных пуста. Добавление тестовых книг...');
      await Book.insertMany([
        {
          title: 'Война и мир',
          author: 'Лев Толстой',
          year: 1869,
          isbn: '978-5-17-098271-1',
          category: 'Классическая литература',
          status: 'available'
        },
        {
          title: 'Мастер и Маргарита',
          author: 'Михаил Булгаков',
          year: 1967,
          isbn: '978-5-17-082915-5',
          category: 'Классическая литература',
          status: 'available'
        },
        {
          title: 'Преступление и наказание',
          author: 'Фёдор Достоевский',
          year: 1866,
          isbn: '978-5-17-100000-0',
          category: 'Классическая литература',
          status: 'borrowed'
        }
      ]);
      console.log('✅ Тестовые книги добавлены');
    } else {
      console.log(`📚 В базе уже есть книги: ${count} шт.`);
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации данных:', error);
  }
};

// API Routes

// Получить все книги (с кешированием)
app.get('/api/books', cacheMiddleware('books:list', 60), async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    console.log(`✅ Получено книг: ${books.length} | Redis: ${isConnected() ? 'ON' : 'OFF'}`);
    res.json(books);
  } catch (error) {
    console.error('❌ Ошибка получения книг:', error);
    res.status(500).json({ message: 'Ошибка получения книг', error: error.message });
  }
});

// Получить книгу по ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      console.log(`⚠️  Книга не найдена: ${req.params.id}`);
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    console.log(`✅ Найдена книга: ${book.title}`);
    res.json(book);
  } catch (error) {
    console.error('❌ Ошибка получения книги:', error);
    res.status(500).json({ message: 'Ошибка получения книги', error: error.message });
  }
});

// Добавить новую книгу
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, year, isbn, category } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ message: 'Название и автор обязательны' });
    }

    const newBook = new Book({
      title,
      author,
      year: year || new Date().getFullYear(),
      isbn: isbn || '',
      category: category || 'Без категории',
      status: 'available'
    });

    await newBook.save();
    console.log(`✅ Книга добавлена: ${newBook.title} (ID: ${newBook._id})`);
    
    // Инвалидация кеша
    await cacheInvalidatePattern('books:*');
    
    res.status(201).json(newBook);
  } catch (error) {
    console.error('❌ Ошибка добавления книги:', error);
    res.status(500).json({ message: 'Ошибка добавления книги', error: error.message });
  }
});

// Обновить книгу
app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, year, isbn, category, status } = req.body;
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, year, isbn, category, status },
      { new: true, runValidators: true }
    );

    if (!book) {
      console.log(`⚠️  Книга не найдена для обновления: ${req.params.id}`);
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    console.log(`✅ Книга обновлена: ${book.title} (ID: ${book._id})`);
    
    // Инвалидация кеша
    await cacheInvalidatePattern('books:*');
    
    res.json(book);
  } catch (error) {
    console.error('❌ Ошибка обновления книги:', error);
    res.status(500).json({ message: 'Ошибка обновления книги', error: error.message });
  }
});

// Удалить книгу
app.delete('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      console.log(`⚠️  Книга не найдена для удаления: ${req.params.id}`);
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    console.log(`✅ Книга удалена: ${book.title} (ID: ${book._id})`);
    
    // Инвалидация кеша
    await cacheInvalidatePattern('books:*');
    
    res.json({ message: 'Книга успешно удалена', book });
  } catch (error) {
    console.error('❌ Ошибка удаления книги:', error);
    res.status(500).json({ message: 'Ошибка удаления книги', error: error.message });
  }
});

// Изменить статус книги (выдача/возврат)
app.patch('/api/books/:id/status', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      console.log(`⚠️  Книга не найдена: ${req.params.id}`);
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    book.status = book.status === 'available' ? 'borrowed' : 'available';
    await book.save();
    
    console.log(`✅ Статус изменен: ${book.title} -> ${book.status}`);
    
    // Инвалидация кеша
    await cacheInvalidatePattern('books:*');
    
    res.json(book);
  } catch (error) {
    console.error('❌ Ошибка изменения статуса:', error);
    res.status(500).json({ message: 'Ошибка изменения статуса', error: error.message });
  }
});

// Поиск книг
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      const books = await Book.find().sort({ createdAt: -1 });
      return res.json(books);
    }

    // Текстовый поиск по названию, автору и категории
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    console.log(`🔍 Поиск "${query}": найдено ${books.length} книг`);
    res.json(books);
  } catch (error) {
    console.error('❌ Ошибка поиска:', error);
    res.status(500).json({ message: 'Ошибка поиска', error: error.message });
  }
});

// Статистика
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Book.countDocuments();
    const available = await Book.countDocuments({ status: 'available' });
    const borrowed = await Book.countDocuments({ status: 'borrowed' });
    const categories = await Book.distinct('category');

    const stats = {
      total,
      available,
      borrowed,
      categories: categories.length
    };

    console.log(`📊 Статистика: Всего ${total}, Доступно ${available}, Выдано ${borrowed}`);
    res.json(stats);
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    res.status(500).json({ message: 'Ошибка получения статистики', error: error.message });
  }
});

// Запуск сервера
app.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Сервер запущен успешно!');
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api/books`);
  console.log(`⏰ Время запуска: ${new Date().toLocaleString('ru-RU')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Инициализация тестовых данных
  await initializeData();
});
