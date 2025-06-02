document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const sortSelect = document.getElementById("sortSelect");
  const articlesContainer = document.getElementById("articles-container");
  const mostPopularContainer = document.getElementById("most-popular");

  // Инициализация темы
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  fetch("articles.json")
    .then(response => response.json())
    .then(data => {
      let articles = data.articles;
      displayArticles(articles);
      highlightMostPopular(articles);

      sortSelect.addEventListener("change", () => {
        const sorted = [...articles];
        if (sortSelect.value === "views") {
          sorted.sort((a, b) => b.views - a.views);
        } else if (sortSelect.value === "date") {
          sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        displayArticles(sorted);
        highlightMostPopular(sorted);
      });
    });

  function displayArticles(articles) {
    articlesContainer.innerHTML = "";
    articles.forEach(article => {
      const readingTime = Math.ceil(article.wordCount / 200);
      const card = document.createElement("div");
      card.className = "col-md-6 col-lg-4 mb-4";
      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${article.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${article.category} • ${article.date}</h6>
            <p class="card-text">${article.content.slice(0, 100)}...</p>
            <p class="card-text mt-auto"><small class="text-muted">${article.views} просмотров • ~${readingTime} мин чтения</small></p>
          </div>
        </div>`;
      articlesContainer.appendChild(card);
    });
  }

  function highlightMostPopular(articles) {
    const popular = articles.reduce((max, curr) => curr.views > max.views ? curr : max, articles[0]);
    mostPopularContainer.innerHTML = `
      <div class="alert alert-info mb-0">
        📈 <strong>Популярная статья:</strong> ${popular.title} (${popular.views} просмотров)
      </div>`;
  }
});
