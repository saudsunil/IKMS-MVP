
/* =========================
   Modal open/close & form reset
========================= */
const modal = document.getElementById('writeArticleModal');
const openBtn = document.getElementById('WriteArticleBtn');
const closeBtn = document.getElementById('modalCloseBtn');
const articleForm = document.getElementById('articleForm');

const titleInput = document.getElementById('titleInput');
const categorySelect = document.getElementById('categorySelect');
const contentInput = document.getElementById('contentInput');
const addPhotoArea = document.getElementById("addPhotoArea");
const photoInput = document.getElementById("coverImageInput");
const imageContainer = document.getElementById("selectedImageContainer");
const draftIdInput = document.getElementById('draftIdInput');
const alertBox = document.getElementById('alertBox');

openBtn.addEventListener('click', () => {
    modal.classList.add('show');

    // populate draft from localStorage if exists
    const saved = localStorage.getItem('article_draft');
    if (saved) {
        try {
            const draft = JSON.parse(saved);
            if (draft.title) titleInput.value = draft.title;
            if (draft.content) contentInput.value = draft.content;
            if (draft.category) categorySelect.value = draft.category;
            if (draft.draft_id) draftIdInput.value = draft.draft_id;
            if (draft.imageDataUrls) populateImagesFromDraft(draft);
        } catch(e) {
            console.warn('Error parsing draft', e);
            resetFormFields();
        }
    } else {
        resetFormFields();
    }
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    resetFormFields();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        modal.classList.remove('show');
        resetFormFields();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
        resetFormFields();
    }
});

/* =========================
   Auto-resize textarea
========================= */
contentInput.addEventListener('input', () => {
    contentInput.style.height = 'auto';
    contentInput.style.height = contentInput.scrollHeight + 'px';
});

/* =========================
   Multiple image previews
========================= */
function showSelectedImages(files) {
    imageContainer.innerHTML = "";
    if (files.length === 0) {
        imageContainer.style.display = 'none';
        return;
    }

    imageContainer.style.display = 'flex';
    imageContainer.style.flexWrap = 'wrap';
    imageContainer.style.gap = '10px';

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.style.position = 'relative';
            div.style.display = 'inline-block';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';

            const removeBtn = document.createElement('div');
            removeBtn.innerHTML = '&times;';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '-8px';
            removeBtn.style.right = '-8px';
            removeBtn.style.background = 'red';
            removeBtn.style.color = 'white';
            removeBtn.style.width = '20px';
            removeBtn.style.height = '20px';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.textAlign = 'center';
            removeBtn.style.lineHeight = '18px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.title = "Remove image";

            removeBtn.addEventListener('click', () => {
                const dt = new DataTransfer();
                Array.from(photoInput.files)
                    .filter((_, i) => i !== index)
                    .forEach(f => dt.items.add(f));
                photoInput.files = dt.files;
                showSelectedImages(photoInput.files);

                // update draft in localStorage
                const saved = localStorage.getItem('article_draft');
                if (saved) {
                    const d = JSON.parse(saved);
                    d.imageDataUrls = Array.from(photoInput.files).map(f => URL.createObjectURL(f));
                    localStorage.setItem('article_draft', JSON.stringify(d));
                }
            });

            div.appendChild(img);
            div.appendChild(removeBtn);
            imageContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });

    // save image previews in localStorage
    const saved = localStorage.getItem('article_draft');
    const d = saved ? JSON.parse(saved) : {};
    d.imageDataUrls = Array.from(files).map(f => URL.createObjectURL(f));
    localStorage.setItem('article_draft', JSON.stringify(d));
}

/* =========================
   File input handling
========================= */
addPhotoArea.addEventListener('click', () => photoInput.click());

photoInput.setAttribute('multiple', ''); // allow multiple files

photoInput.addEventListener('change', () => {
    if (photoInput.files.length > 0) {
        showSelectedImages(photoInput.files);
    }
});

/* =========================
   Populate images from draft
========================= */
function populateImagesFromDraft(draft) {
    if (draft.imageDataUrls && draft.imageDataUrls.length > 0) {
        imageContainer.innerHTML = "";
        draft.imageDataUrls.forEach((dataUrl, index) => {
            const div = document.createElement('div');
            div.style.position = 'relative';
            div.style.display = 'inline-block';

            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';

            const removeBtn = document.createElement('div');
            removeBtn.innerHTML = '&times;';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '-8px';
            removeBtn.style.right = '-8px';
            removeBtn.style.background = 'red';
            removeBtn.style.color = 'white';
            removeBtn.style.width = '20px';
            removeBtn.style.height = '20px';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.textAlign = 'center';
            removeBtn.style.lineHeight = '18px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.title = "Remove image";

            removeBtn.addEventListener('click', () => {
                const dt = new DataTransfer();
                Array.from(photoInput.files)
                    .filter((_, i) => i !== index)
                    .forEach(f => dt.items.add(f));
                photoInput.files = dt.files;
                showSelectedImages(photoInput.files);

                const saved = localStorage.getItem('article_draft');
                if (saved) {
                    const d = JSON.parse(saved);
                    d.imageDataUrls = Array.from(photoInput.files).map(f => URL.createObjectURL(f));
                    localStorage.setItem('article_draft', JSON.stringify(d));
                }
            });

            div.appendChild(img);
            div.appendChild(removeBtn);
            imageContainer.appendChild(div);
        });
        imageContainer.style.display = 'flex';
        imageContainer.style.flexWrap = 'wrap';
        imageContainer.style.gap = '10px';
    }
}

/* =========================
   Reset form fields
========================= */
function resetFormFields() {
    titleInput.value = "";
    categorySelect.value = "";
    contentInput.value = "";
    photoInput.value = "";
    imageContainer.innerHTML = "";
    imageContainer.style.display = 'none';
    draftIdInput.value = "";
}

/* =========================
   Show alert messages
========================= */
function showAlert(message, type='success', timeout=2200) {
    alertBox.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}</div>`;
    alertBox.style.display = 'block';
    if (timeout) {
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.innerHTML = '';
        }, timeout);
    }
}

/* =========================
   Save draft via AJAX
========================= */
document.getElementById('saveDraftBtn').addEventListener('click', () => {
    const formData = new FormData(articleForm);
    formData.append('action', 'draft');

    fetch(articleForm.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken,
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data && data.success) {
            const localDraft = {
                draft_id: data.draft_id || draftIdInput.value || '',
                title: titleInput.value,
                content: contentInput.value,
                category: categorySelect.value,
                imageDataUrls: Array.from(photoInput.files).map(f => URL.createObjectURL(f))
            };
            localStorage.setItem('article_draft', JSON.stringify(localDraft));
            draftIdInput.value = localDraft.draft_id || '';
            showAlert('Draft saved', 'success', 1500);
            setTimeout(() => modal.classList.remove('show'), 500);
        } else {
            showAlert('Error saving draft', 'danger', 2400);
        }
    })
    .catch(err => showAlert('Error saving draft', 'danger', 2400));
});

/* =========================
   Publish via AJAX
========================= */
articleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(articleForm);
    formData.append('action', 'publish');

    fetch(articleForm.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken,
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data && data.success) {
            localStorage.removeItem('article_draft');
            draftIdInput.value = '';
            showAlert(data.message || 'Published successfully', 'success', 1400);
            setTimeout(() => {
                modal.classList.remove('show');
                window.location.reload(); // refresh articles
            }, 700);
        } else {
            let errText = 'Error publishing';
            if (data && data.errors) {
                if (typeof data.errors === 'string') errText = data.errors;
                else try { errText = JSON.stringify(data.errors); } catch(e) {}
            }
            showAlert(errText, 'danger', 3000);
        }
    })
    .catch(err => showAlert('Error publishing article', 'danger', 3000));
});
