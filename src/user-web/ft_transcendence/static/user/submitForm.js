function submitForm(formInstance) {
  const form = formInstance;
  const formData = new FormData(form);

  console.log("SubmitForm Called"); // DEBUG

  let postData = {};
  formData.forEach((value, key) => {
    postData[key] = value;
  });

  const requestUrl = form.getAttribute("action");

  console.log("Calling fetch..."); // DEBUG

  fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success && data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        // Başarılı girişten sonra sayfa içeriğini ve URL'yi yükle
        loadContent(data.redirect, true);
        checkUserSession();
      } else {
        console.error("Giriş başarısız veya yönlendirme bilgisi eksik.");
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error.message);
    });
}

function jwtRefresh() {
  const refresh_token = localStorage.getItem("refresh_token");
  fetch("user/refresh-token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refresh_token }),
  })
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("access_token", data.access);
      console.log("Token yenilendi.");
    })
    .catch((error) => console.error("Token yenileme hatası:", error));
}

function fetchOAuthUrl() {
  fetch("/user/get-oauth-url/")
    .then((response) => response.json())
    .then((data) => {
      const oauthWindow = window.open(
        data.oauth_url,
        "oauthWindow",
        "width=600,height=700"
      );

      const checkWindowClosed = setInterval(() => {
        if (oauthWindow.closed) {
          clearInterval(checkWindowClosed);
          // OAuth penceresi kapandıktan sonra oturum durumunu kontrol et ve UI'ı güncelle
          checkUserSession();
        }
      }, 1000);
    })
    .catch((error) => console.error("Error fetching OAuth URL:", error));
}

function checkUserSession() {
  fetch("/user/check-session/", {
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
