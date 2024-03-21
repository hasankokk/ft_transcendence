function checkUserSession() {
    fetchWithJWT("/user/check-session/", {
      method: "GET",
      credentials: "include", // Çerezleri her istekte göndermek için
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Oturum durumunu kontrol et
        updateUserNavbar(data.isLoggedIn);
      })
      .catch((error) => console.error("Error:", error));
  }

function updateUserNavbar(isLoggedIn) {
  // Kullanıcı giriş yapmışsa gösterilecek içerik ve buton
  const rankingButton = document.getElementById("navRankingButton");
  const profileButton = document.getElementById("navProfileButton");
  const logoutButton = document.getElementById("navLogoutButton");

  // Kullanıcı çıkış yapmışsa gösterilecek giriş yap butonu
  const loginButton = document.getElementById("navLoginButton");

  rankingButton.hidden = !isLoggedIn;
  profileButton.hidden = !isLoggedIn;
  logoutButton.hidden = !isLoggedIn;

  loginButton.hidden = isLoggedIn;
}