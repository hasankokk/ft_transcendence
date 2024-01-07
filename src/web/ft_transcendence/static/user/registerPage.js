import { getCsrfToken, navigateTo } from "../helpers.js";

function registerPage() {
  const htmlContent = `<div class="wrapper32 mt-10" id="registerCard">
    <form method="POST" id="register-form">
      <h2>Register</h2>
      <div class="input-group31">
        <span class="icon">
          <ion-icon name="person"></ion-icon>
        </span>
        <input type="text" placeholder="Username" required name="username" id="Username" />
      </div>
      <div class="input-group31">
        <span class="icon">
          <ion-icon name="mail"></ion-icon>
        </span>
        <input type="email" placeholder="Email" required name="email" id="Email" />
      </div>
      <div class="input-group31">
        <span class="icon">
          <ion-icon name="lock-closed"></ion-icon>
        </span>
        <input type="password" placeholder="Password" required name="password1" id="Password1" />
      </div>
      <div class="input-group31">
        <span class="icon">
          <ion-icon name="lock-closed"></ion-icon>
        </span>
        <input
          type="password"
          placeholder="Re-Password"
          required
          name="password2"
		  id="Password2"
        />
      </div>
      <button type="submit" class="btn31" id="registerButton">Register</button>
      <div class="sign-link31">
        <p>
          You have already an account?
          <a href="/login" class="register-link31" id="loginLink">Sign in</a>
        </p>
      </div>
      </div>
    </form>
  </div>
   `;
  setTimeout(initRegisterPage, 0);
  return htmlContent;
}

function initRegisterPage() {
  document
    .getElementById("register-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const username = document.getElementById("Username").value;
      const email = document.getElementById("Email").value;
      const password1 = document.getElementById("Password1").value;
      const password2 = document.getElementById("Password2").value;

      if (password1 != password2) {
        alert("Passwords do not match");
        return;
      }
      await fetch("/user/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({
          username,
          email,
          password1,
          password2,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Registration successful");
            navigateTo("/login");
            // Başarılı kayıt sonrası işlemler
          } else {
            alert("Registration failed: " + data.message);
            navigateTo("/register");
            // Hatalı kayıt işlemleri
          }
        })
        .catch((error) => {
          console.error("Error during registration:", error);
        });
    });
}

export { registerPage, initRegisterPage };
