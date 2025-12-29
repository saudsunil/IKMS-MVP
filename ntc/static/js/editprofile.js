function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrfToken = getCookie('csrftoken');  // read CSRF token from cookie

const profileInput = document.getElementById('profile_image_input');
const profilePreview = document.getElementById('profile_image_preview');

document.getElementById('upload_new').addEventListener('click', function(e){
    e.preventDefault();
    profileInput.click();
});

document.getElementById('delete_image').addEventListener('click', function(e){
    e.preventDefault();
    fetch("{% url 'delete_profile_image' %}", {
        method: 'POST',
       headers: {
    'X-CSRFToken': csrfToken,
    'Accept': 'application/json',
},

    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success'){
            // Reset preview to placeholder
            profilePreview.style.backgroundImage = 'none';
            profilePreview.style.backgroundColor = '#6c757d';
            profilePreview.innerHTML = '👤';
        }
    });
});

profileInput.addEventListener('change', function(e){
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            profilePreview.style.backgroundImage = `url(${e.target.result})`;
            profilePreview.style.backgroundSize = 'cover';
            profilePreview.style.backgroundPosition = 'center';
            profilePreview.innerHTML = '';
        }
        reader.readAsDataURL(file);
    }
});
