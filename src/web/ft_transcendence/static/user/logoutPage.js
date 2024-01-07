import { navigateTo, getCsrfToken } from "../helpers.js";

function initLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", async function (event) {
      event.preventDefault();

      await fetch("/user/logout/", {
        // API'nin logout endpoint'ini doğrulayın
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(), // CSRF Token'ı dahil edin
          // Gerekirse diğer başlıklar buraya eklenebilir
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Logout successful");
            localStorage.removeItem("userLoggedIn");
            navigateTo("/login"); // Kullanıcıyı giriş sayfasına yönlendir
            // Gerekirse ek temizlik işlemleri yapın (örn. localStorage temizleme)
          } else {
            alert("Logout failed: " + data.message);
            // Hatalı çıkış işlemleri
          }
        })
        .catch((error) => {
          console.log("Error during logout:", error);
        });
    });
  }
}

function logoutPage() {
  setTimeout(initLogoutButton, 0);
}

export { logoutPage, initLogoutButton };
