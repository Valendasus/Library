const API_URL = '/api';

// Загрузка всех книг при запуске
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    loadStats();
});

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('totalBooks').textContent = stats.total;
        document.getElementById('availableBooks').textContent = stats.available;
        document.getElementById('borrowedBooks').textContent = stats.borrowed;
        document.getElementById('categories').textContent = stats.categories;
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Загрузка всех книг
async function loadBooks() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();
        displayBooks(books);
        loadStats();
    } catch (error) {
        console.error('Ошибка загрузки книг:', error);
        showToast('Не удалось загрузить книги. Проверьте, что сервер запущен.', 'error');
    }
}

// Поиск книг
async function searchBooks() {
    const query = document.getElementById('searchInput').value;
    try {
        const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

// Отображение книг
function displayBooks(books) {
    const grid = document.getElementById('booksGrid');
    
    if (books.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>📚 Книг не найдено</h3>
                <p>Добавьте первую книгу в библиотеку</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = books.map(book => `
        <div class="book-card">
            <h3>${escapeHtml(book.title)}</h3>
            <p class="author">Автор: ${escapeHtml(book.author)}</p>
            <p>Год издания: ${book.year}</p>
            ${book.isbn ? `<p>ISBN: ${escapeHtml(book.isbn)}</p>` : ''}
            <p>Категория: ${escapeHtml(book.category)}</p>
            <span class="book-status ${book.status === 'available' ? 'status-available' : 'status-borrowed'}">
                ${book.status === 'available' ? '✓ Доступна' : '✗ Выдана'}
            </span>
            <div class="book-actions">
                <button class="btn-toggle" onclick="toggleBookStatus('${book._id}')">
                    ${book.status === 'available' ? '📤 Выдать' : '📥 Вернуть'}
                </button>
                <button class="btn-edit" onclick="editBook('${book._id}')">✏️ Изменить</button>
                <button class="btn-delete" onclick="deleteBook('${book._id}')">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}

// Показать модальное окно добавления
function showAddModal() {
    document.getElementById('modalTitle').textContent = 'Добавить книгу';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('bookModal').style.display = 'block';
}

// Закрыть модальное окно
function closeModal() {
    document.getElementById('bookModal').style.display = 'none';
}

// Сохранить книгу
async function saveBook(event) {
    event.preventDefault();
    
    const bookId = document.getElementById('bookId').value;
    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        year: parseInt(document.getElementById('year').value) || new Date().getFullYear(),
        isbn: document.getElementById('isbn').value,
        category: document.getElementById('category').value || 'Без категории'
    };

    try {
        const url = bookId ? `${API_URL}/books/${bookId}` : `${API_URL}/books`;
        const method = bookId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            closeModal();
            loadBooks();
            showSuccess(bookId ? 'Книга обновлена!' : 'Книга добавлена!');
        } else {
            showError('Ошибка при сохранении книги');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось сохранить книгу');
    }
}

// Редактировать книгу
async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/books/${id}`);
        const book = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Редактировать книгу';
        document.getElementById('bookId').value = book._id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('year').value = book.year;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('category').value = book.category;
        
        document.getElementById('bookModal').style.display = 'block';
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось загрузить данные книги');
    }
}

// Удалить книгу
async function deleteBook(id) {
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadBooks();
            showSuccess('Книга удалена!');
        } else {
            showError('Ошибка при удалении книги');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось удалить книгу');
    }
}

// Изменить статус книги
async function toggleBookStatus(id) {
    try {
        const response = await fetch(`${API_URL}/books/${id}/status`, {
            method: 'PATCH'
        });

        if (response.ok) {
            loadBooks();
            showSuccess('Статус книги обновлен!');
        } else {
            showError('Ошибка при изменении статуса');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось изменить статус книги');
    }
}

// Вспомогательные функции
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = type === 'success' ? '✓' : '✗';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('bookModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Поиск при нажатии Enter
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchBooks();
            }
        });
    }
});
