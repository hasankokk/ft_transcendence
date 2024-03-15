document.addEventListener("DOMContentLoaded", function() {
    initSPA();
});

function submitForm(formInstance) {
    const formData = new FormData(formInstance);
    const requestUrl = formInstance.getAttribute("action");

    let postData = {};
    formData.forEach((value, key) => {
        postData[key] = value;
    });

    fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.redirect) {
            // Yönlendirme URL'sini history API ile işle
            history.pushState(null, '', data.redirect);
			alert(data.message);
            // İçeriği yüklemek için SPA'nızın içerik yükleme fonksiyonunu çağırın
            loadContent(data.redirect);
        } else {
            // Giriş başarısızsa veya hata mesajı varsa bunu kullanıcıya göster
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });

    // Form gönderiminin sayfa yenilenmesine neden olmaması için false dön
    return false;
}

function initSPA() {
    document.body.addEventListener("click", function(e) {
        // Link tıklamalarını dinle
        if(e.target.tagName === "A" && e.target.getAttribute("href")) {
            e.preventDefault();
            const url = e.target.getAttribute("href");
            loadContent(url);
        }
        // OAuth logo tıklamasını dinle
        else if (e.target.classList.contains('oauth-logo')) {
            e.preventDefault(); // Tıklama olayının varsayılan işlevini engeller
            fetchOAuthUrl(); // OAuth URL'sini alıp yeni sekmede aç
        }
    });

    window.addEventListener('popstate', function(event) {
        if(event.state && event.state.path) {
            loadContent(event.state.path, false);
        }
    });

    reinitialize();
}

function loadContent(url, updateHistory = true) {
    fetch(url).then(response => response.text()).then(html => {
        document.body.innerHTML = html;
        if(updateHistory) {
            history.pushState({path: url}, "", url);
        }
        reinitialize();
    });
}

function reinitialize() {
    document.querySelectorAll('form').forEach(form => {
        form.onsubmit = function(e) {
            e.preventDefault();
            submitForm(this); // Burada submitForm çağrısı yapılıyor
        };
    });
}

function fetchOAuthUrl() {
    fetch('/user/get-oauth-url/')
    .then(response => response.json())
    .then(data => {
        const oauthWindow = window.open(data.oauth_url, 'oauthWindow', 'width=600,height=700');

        const checkWindowClosed = setInterval(() => {
            if (oauthWindow.closed) {
                clearInterval(checkWindowClosed);
                // OAuth penceresi kapandıktan sonra oturum durumunu kontrol et
                checkUserSession();
            }
        }, 1000);
    })
    .catch(error => console.error('Error fetching OAuth URL:', error));
}

function checkUserSession() {
    // Bu endpoint, kullanıcının oturum açıp açmadığını kontrol eder (backend'de tanımlanmalı)
    fetch('/user/check-session/')
    .then(response => {
        if (response.ok) {
            window.location.href = '/'; // Oturum açıldıysa ana sayfaya yönlendir
        }
    });
}

