

(function() {
     if (window.__commentsClickBound) return;
     window.__commentsClickBound = true;
     let deleteTargetRow = null;
     let deleteTargetId = null;


    // ---------- Helper functions ----------
    function getCookie(name) {
        const cookies = document.cookie ? document.cookie.split(';').map(c => c.trim()) : [];
        for (const c of cookies) if (c.startsWith(name + '=')) return decodeURIComponent(c.split('=')[1]);
        return null;
    }
    


  const csrftoken = getCookie('csrftoken');


    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function timeAgo(date) {
        const d = new Date(date);
        if (isNaN(d)) return '';
        const sec = Math.floor((new Date() - d)/1000);
        if (sec < 5) return 'Just now';
        if (sec < 60) return sec+'s';
        const min = Math.floor(sec/60);
        if (min < 60) return min+'m';
        const hrs = Math.floor(min/60);
        if (hrs < 24) return hrs+'h';
        const days = Math.floor(hrs/24);
        if (days < 30) return days+'d';
        const months = Math.floor(days/30);
        if (months < 12) return months+'mo';
        return Math.floor(months/12)+'y';
    }

    function updateTimes() {
        document.querySelectorAll('.comment-time, .reply-time').forEach(el => {
            const t = el.dataset.time;
            if (t) el.textContent = timeAgo(t);
        });
    }
function getTotalComments(articleId) {
    const section = document.getElementById(`comments-${articleId}`);
    if (!section) return 0;

    const main = section.querySelectorAll('.comment-row').length;
    const replies = section.querySelectorAll('.reply-row').length;

    return main + replies;
}


//add reply dynamically
function addReply(parentId, data) {
    // ✅ ensure topParentId exists
    console.log('addReply called',parentId, data);
    const topParentId = data.top_parent_id;
    if (!topParentId) {
        console.error('topParentId is missing in reply data:', data);
        return;
    }

    const replyList = document.getElementById(`replies-${topParentId}`);
    console.log(' replyList element', replyList);
    if (!replyList) {
        console.warn('Reply list not found for topParentId:', topParentId);
        return;
    }

    replyList.style.display = 'block'; // show replies immediately

  

    // 3️⃣ Build reply row (no nested reply-list)
    const div = document.createElement('div');
    div.className = 'reply-row';
    div.dataset.replyId = data.id;
    div.dataset.parentId = data.top_parent_id;


    div.innerHTML = `
      ${data.profile_image 
        ? `<img class="reply-avatar" src="${data.profile_image}" alt="${escapeHtml(data.author)}">`
        : `<div class="reply-avatar placeholder"><i class="fa-solid fa-user"></i></div>`
      }

      <div class="reply-container">
        <div class="reply-card">
          <div class="reply-meta">
            <strong>${escapeHtml(data.author)}</strong>
            <span class="reply-time" data-time="${data.created_at}">${timeAgo(data.created_at)}</span>
          </div>

         ${data.reply_to_author 
  ? `<div class="reply-body">
        <span class="reply-parent-author">${escapeHtml(data.reply_to_author)}</span>${escapeHtml(data.body)}
     </div>`
  : `<div class="reply-body">${escapeHtml(data.body)}</div>`
}

        </div>

        <div class="reply-actions">
          <button type="button" class="reply-link" 
                  data-parent-id="${data.id}" 
                  data-comment-author="${escapeHtml(data.author)}">
            Reply
          </button>

          <div class="reply-ellipsis">
            <i class="fa-solid fa-ellipsis"></i>
            <div class="reply-actions-menu">
              <button class="edit-reply-btn" data-reply-id="${data.id}">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
              ${data.is_owner ? `
              <button class="delete-reply-btn" data-reply-id="${data.id}">
                <i class="fa-solid fa-trash"></i> Delete
              </button> ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // 4️⃣ Append to top-level reply list (not nested)
  replyList.appendChild(div);
console.log('🟢 reply appended, total replies:', replyList.querySelectorAll('.reply-row').length);

    // 🔥 ENSURE REPLY LIST IS VISIBLE
replyList.style.display = 'block';


    // 5️⃣ Update toggle button count
 let toggleBtn = document.querySelector(`.toggle-replies-btn[data-parent-id="${topParentId}"]`);
if (!toggleBtn) {
    const parentRow = document.querySelector(`[data-comment-id="${topParentId}"]`);
    if (!parentRow) return; // safety check
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'toggle-replies-btn';
    toggleBtn.dataset.parentId = topParentId;
    parentRow.querySelector('.comment-container').appendChild(toggleBtn);
}
toggleBtn.style.display = 'inline-block';
toggleBtn.textContent = `Hide Replies (${replyList.querySelectorAll('.reply-row').length})`;

    // 6️⃣ Update total comment count
    const section = replyList.closest('.comments-section');
const articleId = section.id.replace('comments-', '');
const countEl = document.getElementById(`comment-count-${articleId}`);

    if (countEl) countEl.textContent = getTotalComments(articleId) + " comments";

    updateTimes();
}



    // ---------- Add a top-level comment dynamically ----------
  function addComment(articleId, data) {
        const commentList = document.getElementById(`comment-list-${articleId}`);

        if(!commentList) return;

        const div = document.createElement('div');
        div.className = 'comment-row';
        div.dataset.commentId = data.id;

        div.innerHTML = `
            ${data.profile_image 
                ? `<img class="comment-avatar" src="${data.profile_image}" alt="">`
                : `<div class="comment-avatar placeholder"><i class="fa-solid fa-user"></i></div>`}
            <div class="comment-container">
                <div class="comment-card">
                    <div class="comment-meta">
                        <span class="comment-user">${escapeHtml(data.username)}</span>
                        <span class="comment-time" data-time="${data.created_at}">${timeAgo(data.created_at)}</span>
                    </div>
                    <div class="comment-body">${escapeHtml(data.body)}</div>
                </div>
                <div class="comment-actions">
                    <button type="button" class="reply-link" data-comment-id="${data.id}" data-comment-author="${escapeHtml(data.username)}">Reply</button>
                    <div class="comment-ellipsis">
            <i class="fa-solid fa-ellipsis"></i>
            <div class="actions-menu">
              <button class="edit-btn" data-comment-id="${data.id}">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
              ${data.is_author ? `<button class="delete-btn" data-comment-id="${data.id}">
                <i class="fa-solid fa-trash"></i> Delete
              </button>` : ''}

            </div>
          </div>
          </div>
        
              
               
               
            </div>
        `;
        commentList.appendChild(div);
// 🔹 AFTER commentList.appendChild(div);
const container = div.querySelector('.comment-container');

// CREATE REPLY LIST
const replyList = document.createElement('div');
replyList.className = 'reply-list';
replyList.id = `replies-${data.id}`;
replyList.style.display = 'none';

// CREATE TOGGLE BUTTON
const toggleBtn = document.createElement('button');
toggleBtn.type = 'button';
toggleBtn.className = 'toggle-replies-btn';
toggleBtn.dataset.parentId = data.id;
toggleBtn.style.display = 'none';
toggleBtn.textContent = 'Show Replies (0)';

// APPEND in correct order: reply list first, then toggle button
container.appendChild(replyList);
container.appendChild(toggleBtn);



        const noComments = document.querySelector(`#comments-${articleId} .no-comment`);
        if (noComments) noComments.remove();


        // Update comment count
const countEl = document.getElementById(`comment-count-${articleId}`);
if (countEl) {
    const total = getTotalComments(articleId);
    countEl.textContent = total + (total === 1 ? ' comment' : ' comments');
}


        updateTimes();
    }


    // ---------- Initialize comment system ---------- only for  comment form , cancel-reply, submit logic
   function initComments() {
        
        if(window.kbmsCommentsInit) return;
        window.kbmsCommentsInit = true;

    

    document.querySelectorAll('.comment-form').forEach(form => {
        if (form.dataset.bound) return;
        form.dataset.bound = '1';

        const input = form.querySelector('input[name="comment"]');
        const sendBtn = form.querySelector('.comment-btn');
        const replyingIndicator = form.querySelector('.replying-indicator');

       input.addEventListener('input', () => {
    const hasText = input.value.trim().length > 0;

    // Toggle your visible class if you want any visual effect
    sendBtn.classList.toggle('visible', hasText);

    // Enable/disable the button
    sendBtn.disabled = !hasText;
});


        // ❌ cancel
        form.addEventListener('click', e => {
            if (e.target.closest('.cancel-reply')) {
                delete form.dataset.replyTo;
                delete form.dataset.editingId;

                input.value = '';
                input.placeholder = 'Write a comment';
                replyingIndicator.style.display = 'none';
                input.focus();
            }
        });

     



       
        // Handle comment submit forms
        
form.addEventListener('submit', async e => {
    e.preventDefault();
    const body = input.value.trim();
    if (!body) return;
    sendBtn.disabled = true;

    try {
        let url = '';
        let isReply = false;

        // ✅ Get articleId at the top
        const articleId = form.dataset.articleId;
        if (!articleId) {
            console.error("Article ID is missing!");
            return;
        }

        if (form.dataset.editingId) {
            const id = form.dataset.editingId;
            const row = document.querySelector(`[data-comment-id="${id}"], [data-reply-id="${id}"]`);
            isReply = row && row.classList.contains('reply-row');
            url = isReply 
                ? `/comments/edit-reply/${id}/` 
                : `/comments/edit/${id}/`;
        } else {
            isReply = !!form.dataset.replyTo;
            url = isReply 
                ? `/comments/reply/${form.dataset.replyTo}/` 
                : `/comments/add/${articleId}/`;
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken, 'Content-Type': 'application/json' },
            body: JSON.stringify({ body })
        });

        const data = await res.json().catch(() => ({}));
        if (!data || !data.success) return;

        if (form.dataset.editingId) {
            // Update existing comment/reply dynamically
            const editRow = document.querySelector(`[data-comment-id="${data.id}"], [data-reply-id="${data.id}"]`);
            if (editRow) {
    const bodyEl = editRow.querySelector(isReply ? '.reply-body' : '.comment-body');
    const timeEl = editRow.querySelector(isReply ? '.reply-time' : '.comment-time');

    if (bodyEl) {
        if (isReply) {
            const authorSpan = bodyEl.querySelector('.reply-parent-author');

            if (authorSpan) {
                // ✅ preserve author name
                authorSpan.nextSibling?.remove();
                bodyEl.append(document.createTextNode(data.body));
            } else {
                bodyEl.textContent = data.body;
            }
        } else {
            bodyEl.textContent = data.body;
        }
    }

    if (timeEl) timeEl.dataset.time = data.updated_at;
    updateTimes();
}

            delete form.dataset.editingId;
            if (replyingIndicator) replyingIndicator.style.display = 'none';
            input.value = '';
        } else {
            // Add new comment/reply dynamically
   if (isReply) {
    const parentId = form.dataset.replyTo;
    addReply(parentId, data);
   
}



 else {
                addComment(articleId, data); // ✅ articleId is now defined
            }
            input.value = '';
            input.placeholder = 'Write a comment';  
            delete form.dataset.replyTo;
            if (replyingIndicator) replyingIndicator.style.display = 'none';
        }
    } catch (err) { 
        console.error(err); 
    } finally { 
        sendBtn.disabled = false; 
        updateTimes(); 
    }
});
    });}

   function updateToggleBtn(commentId) {
    const list = document.getElementById(`replies-${commentId}`);
    const btn = document.querySelector(`.toggle-replies-btn[data-parent-id="${commentId}"]`);
    if (!list || !btn) return;

    const count = list.querySelectorAll('.reply-row').length;

    if (count === 0) {
        btn.style.display = 'none';
        list.style.display = 'none';
    } else {
        btn.style.display = 'inline-block';
        btn.textContent = list.style.display === 'block'
            ? `Hide Replies (${count})`
            : `Show Replies (${count})`;
    }
}



    // Delegated click for reply, toggle, edit, delete
document.addEventListener('click', async e => {
   




    /* ===============================
       TOGGLE COMMENTS SECTION ✅ FIXED
    ================================ */
    const toggleCommentsBtn = e.target.closest('.toggle-comments-btn');
if (toggleCommentsBtn) {
    e.preventDefault();
    e.stopPropagation(); // 🔥 THIS IS IMPORTANT

    const id = toggleCommentsBtn.dataset.articleId;
    const section = document.getElementById(`comments-${id}`);
    if (!section) return;

    const isOpen = section.style.display === 'block';
    document.activeElement?.blur();

    section.style.display = isOpen ? 'none' : 'block';

    updateTimes();
    return;
}


        // Close all menus when clicking outside
if (!e.target.closest('.comment-ellipsis') && !e.target.closest('.reply-ellipsis')) {
    document.querySelectorAll('.actions-menu, .reply-actions-menu')
        .forEach(m => m.style.display = 'none');
}
 




    /* ===============================
       ELLIPSIS TOGGLE (FIXED)
    ================================ */
// COMMENT MENU TOGGLE
const commentEllipsis = e.target.closest('.comment-ellipsis');
if (commentEllipsis && e.target.closest('.fa-ellipsis')) {
    const menu = commentEllipsis.querySelector('.actions-menu');

    document.querySelectorAll('.actions-menu').forEach(m => {
        if (m !== menu) m.style.display = 'none';
    });

    if (menu) {
        const isOpen = menu.style.display === 'block';
        menu.style.display = isOpen ? 'none' : 'block';
 
    }
    return;
}

/* ===============================
   EDIT REPLY (MUST BE FIRST)
================================ */
const editReplyBtn = e.target.closest('.edit-reply-btn');
if (editReplyBtn) {
    e.stopPropagation();

    const row = editReplyBtn.closest('.reply-row');
    if (!row) return;

    const section = row.closest('.comments-section');
    const form = section.querySelector('.comment-form');
    const input = form.querySelector('input[name="comment"]');

    const indicator = form.querySelector('.replying-indicator');
    const bodyEl = row.querySelector('.reply-body');
const authorEl = bodyEl.querySelector('.reply-parent-author');

if (authorEl) {
    // remove author name from editable text
    input.value = bodyEl.textContent.replace(authorEl.textContent, '').trim();
} else {
    input.value = bodyEl.textContent.trim();
}

   
    input.placeholder = 'Write a Comment';
    input.focus();

    form.dataset.editingId = row.dataset.replyId;

    // ✅ show ONLY ❌ icon
    if (indicator) indicator.style.display = 'block';
    

    // close ellipsis menu
  let menu = row.querySelector('.reply-actions-menu');
if (menu) menu.style.display = 'none';




    console.log('✅ EDIT REPLY CLICKED');
    return;
}



// REPLY MENU TOGGLE
// REPLY MENU TOGGLE
const replyEllipsis = e.target.closest('.reply-ellipsis');

if (replyEllipsis && e.target.classList.contains('fa-ellipsis')) {
  e.stopPropagation();
    const menu = replyEllipsis.querySelector('.reply-actions-menu');

    document.querySelectorAll('.reply-actions-menu').forEach(m => {
        if (m !== menu) m.style.display = 'none';
    });

    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    return;
}


    /* ===============================
       TOGGLE REPLIES
    ================================ */

const toggleBtn = e.target.closest('.toggle-replies-btn');
if (toggleBtn) {
    const parentId = toggleBtn.dataset.parentId;
    const list = document.getElementById(`replies-${parentId}`);
    if (!list) return;

    const open = list.style.display === 'block';
    list.style.display = open ? 'none' : 'block';

    toggleBtn.textContent =
      `${open ? 'Show' : 'Hide'} Replies (${list.querySelectorAll('.reply-row').length})`;
    return;
}

    /* ===============================
       REPLY BUTTON
    ================================ */


const replyBtn = e.target.closest('.reply-link');
if (replyBtn) {
    const row = replyBtn.closest('.comment-row, .reply-row');
    const form = row.closest('.comments-section').querySelector('.comment-form');

    // If replying to a reply → use reply id
if (row.classList.contains('reply-row')) {
    form.dataset.replyTo = row.dataset.replyId;
} else {
    // replying to main comment
    form.dataset.replyTo = row.dataset.commentId;
}



    const input = form.querySelector('input[name="comment"]');
    input.focus();

    // Update replying indicator
    const indicator = form.querySelector('.replying-indicator');
    if (indicator) {
        indicator.innerHTML = `<span class="cancel-reply" style="cursor:pointer;">&times;</span>`;
        indicator.style.display = 'block';
    }
    input.placeholder = `Replying to ${row.dataset.authorName || replyBtn.dataset.commentAuthor}`;
    return;
}


    /* ===============================
       EDIT COMMENT
    ================================ */
const editCommentBtn = e.target.closest('.edit-btn');
if (editCommentBtn) {
  e.stopPropagation();
    const row = editCommentBtn.closest('.comment-row');
    if (!row) return;

    const section = row.closest('.comments-section');
    const form = section.querySelector('.comment-form');
    const input = form.querySelector('input[name="comment"]');
    const bodyEl = row.querySelector('.comment-body');
    const indicator = form.querySelector('.replying-indicator');

  

    // populate input with current comment
    input.value = bodyEl.textContent.trim();
    input.focus();

    // mark as editing
    form.dataset.editingId = row.dataset.commentId;

    // show editing indicator
    
    if (indicator) 
        indicator.style.display = 'block';
         // close ellipsis menu
       let menu = row.querySelector('.actions-menu');
if (menu) menu.style.display = 'none';


       
    return;
    
}


    /* ===============================
       DELETE COMMENT / REPLY click logic
    ================================ */
const deleteBtn = e.target.closest('.delete-btn, .delete-reply-btn');
if (deleteBtn) {
    e.preventDefault();
    e.stopPropagation();

    deleteTargetRow = deleteBtn.closest('.comment-row, .reply-row');
    deleteTargetId =
        deleteBtn.dataset.commentId || deleteBtn.dataset.replyId;

    // Close all ellipsis menus
    document
      .querySelectorAll('.actions-menu, .reply-actions-menu')
      .forEach(m => m.style.display = 'none');

    // Open modal
    deleteModal.classList.remove('hidden');
    return;
}


   

});
//for delete modal logic 

const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

if (deleteModal && confirmDeleteBtn && cancelDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    if (!deleteTargetId || !deleteTargetRow) return;

    try {
       const url = deleteTargetRow.classList.contains('reply-row')
    ? `/comments/delete/reply/${deleteTargetId}/`
    : `/comments/delete/${deleteTargetId}/`;

const res = await fetch(url, {
    method: 'POST',
    headers: {
        'X-CSRFToken': csrftoken,
        'Accept': 'application/json'
    }
});
 if (!res.ok) {
    console.error('Delete failed', res.status);
    return;
}


        const data = await res.json();
        if (!data.success) return;

        const section = deleteTargetRow.closest('.comments-section');
        const articleId = section.id.replace('comments-', '');
       // ✅ STORE INFO FIRST
const rowToDelete = deleteTargetRow;
const isReply = deleteTargetRow && deleteTargetRow.classList.contains('reply-row');

const parentId = isReply ? rowToDelete.dataset.parentId : rowToDelete.dataset.commentId;


// ✅ CLOSE MODAL + RESET STATE FIRST (🔥 FIX)
document.activeElement?.blur();
deleteModal.classList.add('hidden');
deleteTargetId = null;
deleteTargetRow = null;

// ✅ NOW REMOVE FROM DOM (SAFE)
rowToDelete.remove();
//update total comment count
requestAnimationFrame(() => {
    const countEl = document.getElementById(`comment-count-${articleId}`);
    if (countEl) {
        const total = getTotalComments(articleId);
        countEl.textContent = total + (total === 1 ? ' comment' : ' comments');
    }
});

// ✅ UPDATE REPLIES TOGGLE
if (isReply) {
    updateToggleBtn(parentId);
}

// 🔻 REMOVE REPLIES WHEN MAIN COMMENT IS DELETED
if (!isReply) {
    const replies = section.querySelector(`#replies-${rowToDelete.dataset.commentId}`);
    if (replies) replies.remove();
}




        // 🔻 NO COMMENTS MESSAGE
        const list = section.querySelector('.comment-list');
        if (list && list.children.length === 0) {
            list.innerHTML = `<div class="no-comment text-center">No comments yet</div>`;
        }

    } catch (err) {
    console.error(err);
} finally {
    document.activeElement?.blur();
    deleteModal.classList.add('hidden');
    deleteTargetId = null;
    deleteTargetRow = null;
}

});

  cancelDeleteBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      // ✅ Close delete modal
      document.activeElement?.blur(); // Remove focus from button
      deleteModal.classList.add('hidden');

      // ✅ Close any open ellipsis menus
      document
        .querySelectorAll('.actions-menu, .reply-actions-menu')
        .forEach(menu => menu.style.display = 'none');

      // ✅ Reset delete state
      deleteTargetId = null;
      deleteTargetRow = null;
  });



}




    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { initComments(); updateTimes(); });
    } else { initComments(); updateTimes(); }

    setInterval(updateTimes, 30000);

  })();

