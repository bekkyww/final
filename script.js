let articles = [];

document.addEventListener('DOMContentLoaded', () => {
    
    fetch('Articles.json')
        .then(response => {
            if (!response.ok) throw new Error('Не удалось загрузить Articles.json');
            console.log('JSON успешно загружен'); 
            return response.json();
        })
        .then(data => {
            const storedViews = JSON.parse(localStorage.getItem('articleViews') || '{}');
            articles = data.articles.map(article => ({
                ...article,
                views: storedViews[article.id] || article.views
            }));
            console.log('Инициализированные статьи:', articles); 
            initDashboard();
        })
        .catch(error => {
            console.error('Ошибка:', error);
            document.getElementById('articlesGrid').innerHTML = '<p class="text-muted">Ошибка загрузки статей.</p>';
        });

    
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    
    document.getElementById('sortSelect').addEventListener('change', updateArticles);
});


function initDashboard() {
    if (!articles.length) {
        document.getElementById('articlesGrid').innerHTML = '<p class="text-muted">Нет доступных статей.</p>';
        document.getElementById('mostPopular').innerHTML = '<p class="text-muted">Нет доступных статей.</p>';
        return;
    }
    updateArticles();
    displayMostPopular();
    populateCategories();
}


function updateArticles() {
    const activeCategory = document.querySelector('#categoryList .nav-link.active')?.dataset.category || 'all';
    const sortBy = document.getElementById('sortSelect').value;
    const articlesGrid = document.getElementById('articlesGrid');
    
    
    let filteredArticles = activeCategory === 'all' ? articles : articles.filter(a => a.category === activeCategory);
    
    
    filteredArticles = [...filteredArticles].sort((a, b) => {
        if (sortBy === 'views') {
            return b.views - a.views; 
        } else {
            return new Date(b.date) - new Date(a.date); 
        }
    });
    
    
    articlesGrid.innerHTML = filteredArticles.length ? '' : '<p class="text-muted">Статьи не найдены.</p>';
    filteredArticles.forEach(article => articlesGrid.appendChild(createArticleCard(article)));
    console.log('Обновленная сетка статей:', filteredArticles.map(a => ({ id: a.id, title: a.title, views: a.views }))); 
}


function createArticleCard(article) {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <span class="badge bg-primary mb-2">${article.category}</span>
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.content.substring(0, 100)}...</p>
            </div>
            <div class="card-footer bg-transparent">
                <small class="text-muted">Опубликовано: ${formatDate(article.date)}</small>
                <span class="float-end reading-time">${calculateReadingTime(article.wordCount)} мин чтения</span>
            </div>
        </div>
    `;
    col.addEventListener('click', () => {
        article.views++;
        console.log(`Статья ${article.id} просмотрена, просмотры: ${article.views}`);
        saveViews();
        showArticleModal(article);
        updateArticles(); 
        displayMostPopular(); 
    });
    return col;
}


function saveViews() {
    const views = articles.reduce((acc, article) => {
        acc[article.id] = article.views;
        return acc;
    }, {});
    localStorage.setItem('articleViews', JSON.stringify(views));
    console.log('Сохраненные просмотры:', views); 
}


function displayMostPopular() {
    const mostPopular = [...articles].sort((a, b) => b.views - a.views)[0];
    if (!mostPopular) return;
    console.log('Самая популярная статья:', mostPopular.title, 'с просмотрами:', mostPopular.views); 
    document.getElementById('mostPopular').innerHTML = `
        <div class="card-body">
            <span class="badge bg-primary mb-2">${mostPopular.category}</span>
            <h3 class="card-title">${mostPopular.title}</h3>
            <p class="card-text">${mostPopular.content.substring(0, 200)}...</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Опубликовано: ${formatDate(mostPopular.date)} | ${mostPopular.views} просмотров</small>
                <span class="reading-time">${calculateReadingTime(mostPopular.wordCount)} мин чтения</span>
            </div>
            <button class="btn btn-primary mt-3" onclick="showArticleModal(articles.find(a => a.id === ${mostPopular.id}))">Читать далее</button>
        </div>
    `;
}


function populateCategories() {
    const categories = [...new Set(articles.map(a => a.category))];
    const categoryList = document.getElementById('categoryList');
    
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `<a class="nav-link" href="#" data-category="${category}">${category}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#categoryList .nav-link').forEach(el => el.classList.remove('active'));
            li.querySelector('.nav-link').classList.add('active');
            updateArticles();
        });
        categoryList.appendChild(li);
    });
}


function showArticleModal(article) {
    document.getElementById('modalTitle').textContent = article.title;
    document.getElementById('modalBody').innerHTML = `
        <p><span class="badge bg-primary">${article.category}</span></p>
        <img src="https://via.placeholder.com/800x400" class="img-fluid mb-3 rounded" alt="Изображение статьи">
        <p class="lead">${article.content}</p>
    `;
    document.getElementById('modalMeta').innerHTML = `
        Опубликовано: ${formatDate(article.date)} | ${article.views} просмотров | ${calculateReadingTime(article.wordCount)} мин чтения
    `;
    new bootstrap.Modal(document.getElementById('articleModal')).show();
}


function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
}


function calculateReadingTime(wordCount) {
    return Math.ceil(wordCount / 200);
}


window.showArticleModal = showArticleModal;

