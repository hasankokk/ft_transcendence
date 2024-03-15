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
