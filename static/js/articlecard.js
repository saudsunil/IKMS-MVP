

document.addEventListener('DOMContentLoaded', () => {
    const csrftoken = getCookie('csrftoken');

    function getCookie(name){
        let cookieValue=null;
        if(document.cookie && document.cookie!==''){
            document.cookie.split(';').forEach(cookie=>{
                cookie=cookie.trim();
                if(cookie.startsWith(name+'=')){
                    cookieValue=decodeURIComponent(cookie.substring(name.length+1));
                }
            });
        }
        return cookieValue;
    }
    function timeAgo(isoDate) {
    const now = new Date();
    const past = new Date(isoDate);
    const diff = Math.floor((now - past) / 1000); // difference in seconds

    if (diff < 5) return 'just now';
    if (diff< 60) return Math.floor(diff/5) + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    if (diff < 31536000) return Math.floor(diff / 2592000) + 'mo ago';
    return Math.floor(diff / 31536000) + 'y ago';
}

function updateTimes() {
    document.querySelectorAll('.article-time').forEach(el => {
        const iso = el.dataset.iso;
        if (iso) el.innerText = timeAgo(iso);
    });
}

// Initial call
updateTimes();

// Update every 60 seconds
setInterval(updateTimes, 1000);



    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('.article-card');
    let noArticlesMsg = document.createElement('div');
    noArticlesMsg.id = 'no-articles-msg';
    noArticlesMsg.style.textAlign = 'center';
    noArticlesMsg.style.fontSize = '16px';
    noArticlesMsg.style.color = '#6c757d';
    noArticlesMsg.style.margin = '20px 0';
    noArticlesMsg.textContent = 'No articles published yet.';
    document.querySelector('.articles-container').appendChild(noArticlesMsg);
    updateNoArticlesMessage(); 

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            let visibleCount = 0;
            articles.forEach(article => {
                if (type === 'All' || article.dataset.type === type) {
                    article.style.display = 'block';
                    visibleCount++;
                } else {
                    article.style.display = 'none';
                }
            });
            noArticlesMsg.style.display = visibleCount ? 'none' : 'block';
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
  
    function updateNoArticlesMessage() {
    const visibleArticles = document.querySelectorAll('.article-card');
    noArticlesMsg.style.display = visibleArticles.length === 0 ? 'block' : 'none';
}

window.updateArticleCount = function (change = 0) {
    const countElem = document.getElementById('article-count');
    if (!countElem) return;

    let count = parseInt(countElem.textContent) || 0;
    count += change;

    if (count <= 0) {
        countElem.style.display = 'none';
        countElem.textContent = '';
    } else {
        countElem.textContent = count;
        countElem.style.display = 'inline';
    }
};


    // See more logic
    document.querySelectorAll('.article-preview').forEach(preview => {
        const textDiv = preview.querySelector('.article-text');
        const btn = preview.querySelector('.see-more');
        textDiv.classList.add("measure");
        const fullHeight = textDiv.scrollHeight;
        const lineHeight = parseInt(window.getComputedStyle(textDiv).lineHeight);
        textDiv.classList.remove("measure");
        if (fullHeight > lineHeight + 2) btn.style.display = "block";
    });
    
let selectedArticleId = null;

document.querySelectorAll('.delete-article-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedArticleId = btn.dataset.articleId;
        document.getElementById('deleteConfirmOverlay').classList.remove('hidden');
    });
});

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    document.getElementById('deleteConfirmOverlay').classList.add('hidden');
    selectedArticleId = null;
});

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (!selectedArticleId) return;

    fetch(`/articles/delete/${selectedArticleId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.querySelector(
                `.article-card[data-article-id="${selectedArticleId}"]`
            ).remove();
            updateNoArticlesMessage(); 
            updateArticleCount(-1);
        }
        document.getElementById('deleteConfirmOverlay').classList.add('hidden');
    });
});



});

function toggleSeeMore(id) {
    const text = document.getElementById(`text-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    if (text.classList.contains('expanded')) {
        text.classList.remove('expanded');
        btn.innerText = "See more";
    } else {
        text.classList.add('expanded');
        btn.innerText = "See less";
    }
}
