const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название книги обязательно'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Автор обязателен'],
    trim: true
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
    min: [1000, 'Год должен быть больше 1000'],
    max: [2100, 'Год должен быть меньше 2100']
  },
  isbn: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    default: 'Без категории',
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'borrowed'],
    default: 'available'
  }
}, {
  timestamps: true // Автоматически добавляет createdAt и updatedAt
});

// Индексы для быстрого поиска
bookSchema.index({ title: 'text', author: 'text', category: 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
