import { getCsrfToken, navigateTo } from "../helpers.js";

function loginPage() {
  const Logincontent = `<div class="wrapper31" id="loginCard">
    <form method="POST" id="login-form">
      <h2>Login</h2>
      <div class="input-group31">
        <span class="icon">
          <ion-icon name="person"></ion-icon>
        </span>
        <input
          type="text"
          placeholder="Username"
          name="username"
          required
          name="username"
          id="username"
        />
      </div>
      <div class="input-group31">
        <span class="icon">
          <ion-icon name="lock-closed"></ion-icon>
        </span>
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
          name="password"
          id="password"
        />
      </div>
      <button type="submit" class="btn31" id="loginButton">Login</button>
      <div class="sign-link31">
        <p>
          Don't have an account?
          <a href="/register" class="register-link31" id="registerLink"
            >Register</a
          >
        </p>
      </div>
<div class="text-center">
    <a href="user/oauth-callback/" class="oauth-button">
    <img src="/media/42_Logo.svg.png" class="rounded" alt="OAuth Login"/>
</a>
</div>
    </form>
  </div>`;
  setTimeout(initLoginPage, 0);
  return Logincontent;
}

function initLoginPage() {
  document
    .getElementById("login-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      await fetch("/user/login/", {
        // URL'i kontrol edin, doğru endpoint olmalı
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
          // Gerekirse diğer başlıklar buraya eklenebilir
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Login successful");
            localStorage.setItem("userLoggedIn", "true");
            navigateTo("/index");
            // Başarılı giriş sonrası yönlendirme veya işlemler
          } else {
            alert("Login failed: " + data.message);
            navigateTo("/login");
            // Hatalı giriş işlemleri
          }
        })
        .catch((error) => {
          console.log("Error during login:", error);
        });
    });
  const oauthButton = document.querySelector(".oauth-button"); // Buton için sınıf veya ID ekleyin
  if (oauthButton) {
    oauthButton.addEventListener("click", oauthRedirect);
  }
}

async function oauthRedirect() {
  const response = await fetch("/user/get-oauth-url/");
  if (response.ok) {
    const data = await response.json();
    window.open(data.oauth_url, "OAuthWindow", "width=800,height=600");
	checkOAuthSuccess();
  } else {
    console.error("Error fetching OAuth URL");
  }
}

function checkOAuthSuccess() {
  const check = setInterval(() => {
    const oauthSuccess = localStorage.getItem("oauthSuccess");
    if (oauthSuccess) {
      clearInterval(check);
      localStorage.removeItem("oauthSuccess"); // İşaretçiyi temizle
      if (oauthSuccess === "true") {
		localStorage.setItem("userLoggedIn", "true");
        navigateTo("/index");
      } else {
		localStorage.setItem("userLoggedIn", "false");
        navigateTo("/login");
      }
    }
  }, 1); // Her 1 saniyede bir kontrol eder
}

window.addEventListener(
  "message",
  (event) => {
    if (event.data === "oauthComplete") {
      checkOAuthSuccess();
    }
  },
  false
);

export { loginPage, initLoginPage, oauthRedirect, checkOAuthSuccess };
