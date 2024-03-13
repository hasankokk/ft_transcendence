document.addEventListener("DOMContentLoaded", function() {
    document.body.addEventListener("click", function(e) {
        // Linkleri kontrol et
        if(e.target.tagName === "A" && e.target.getAttribute("href")) {
            e.preventDefault(); // Varsayılan davranışı engelle

            const url = e.target.getAttribute("href");

            fetch(url)
            .then(response => response.text())
            .then(html => {
                document.body.innerHTML = html; // body içeriğini güncelle
                history.pushState({path: url}, "", url); // Tarayıcı geçmişine ekle
            });
        }
    });

    window.addEventListener('popstate', function(event) {
        if(event.state) {
            const url = event.state.path;

            fetch(url)
            .then(response => response.text())
            .then(html => {
                document.body.innerHTML = html; // İçeriği geri al
            });
        }
    });
});
