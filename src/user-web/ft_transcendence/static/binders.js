function bindLogin() {
  //addEventListener on #loginButton for submitForm()
  //addEventListener on .oauth-button for 42Login

  document
    .getElementById("loginSubmitButton")
    .addEventListener("click", (e) => {
      e.preventDefault();
      submitForm(e.currentTarget.form);
    });

  console.log("called bindLogin()"); // DEBUG, Should be called when login page appears

  const a_register = document.getElementById("registerLink");
  bindAnchor(a_register, bindRegister);
}

function bindRegister() {
  console.log("called bindRegister()"); // DEBUG, Should be called when register page appears
  const a_login = document.getElementById("loginLink");

  bindAnchor(a_login, bindLogin);
}

function bindHome() {}

function bindGame() {}

function bindRanking() {}

function bindProfile() {}

function bindAnchor(anchorInstance, func) {
  anchorInstance.removeEventListener("click", loadContentEvent);

  anchorInstance.addEventListener("click", (e) => {
    e.preventDefault();
    bindFunc = func;
    loadContent(e.currentTarget);
  });
  document.body.addEventListener("click", function (e) {
    // OAuth logo tıklamasını dinle
    if (e.target.classList.contains("oauth-logo")) {
      e.preventDefault(); // Tıklama olayının varsayılan işlevini engeller
      fetchOAuthUrl(); // OAuth URL'sini alıp yeni sekmede aç
    }
  });
}

function updateContentAnchors() {
  /*
    Set SPA switch for all anchors in element (#main-content)
    */

  const element = document.getElementById("main-content");
  const anchors = element.querySelectorAll("a");

  for (let i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener("click", loadContentEvent);
  }
}

function loadContent(anchorInstanceOrPath, pushHistory = true) {
  let requestUrl;

  if (typeof anchorInstanceOrPath === "string") {
    requestUrl = anchorInstanceOrPath;
  } else {
    requestUrl = anchorInstanceOrPath.getAttribute("href");
  }

  fetch(requestUrl)
    .then((response) => response.text())
    .then((text) => {
      const element = document.getElementById("main-content");

      if (pushHistory) {
        const state = getState(requestUrl, bindFunc);
        history.pushState(state, "", "");
      }

      element.innerHTML = text;
    });
  checkUserSession();
  return false;
}

function loadContentEvent(event) {
  event.preventDefault();
  loadContent(event.currentTarget);
}

function loadHistoryEvent(event) {
  const path = event.state.path;
  const binder_name = event.state.binder_name;
  const binder = binder_name !== null ? window[binder_name] : null;

  //console.log(path); // DEBUG
  //console.log(binder_name); // DEBUG
  //console.log(binder) // DEBUG

  bindFunc = binder;
  loadContent(path, false);
}

function getState(path, binder) {
  return {
    path: path,
    binder_name:
      binder !== null && typeof binder !== "undefined" ? binder.name : null,
  };
}

function updateUserNavbar(isLoggedIn) {
  // Kullanıcı giriş yapmışsa gösterilecek içerik ve buton
  const userLoggedInContent = document.getElementById("userLoggedIn");
  const userLoggedInButton = document.getElementById("userLoggedInButton");

  // Kullanıcı çıkış yapmışsa gösterilecek giriş yap butonu
  const userLoggedOutButton = document.getElementById("userLoggedOutButton");

  if (isLoggedIn) {
    // Kullanıcı giriş yapmışsa, giriş yapan kullanıcıya özel içeriği ve çıkış yap butonunu göster
    if (userLoggedInContent) userLoggedInContent.style.display = "block";
    if (userLoggedInButton) userLoggedInButton.style.display = "block";

    // Giriş yapmamış kullanıcılara gösterilen giriş yap butonunu gizle
    if (userLoggedOutButton) userLoggedOutButton.style.display = "none";
  } else {
    // Kullanıcı giriş yapmamışsa veya çıkış yapmışsa, kullanıcıya özel içeriği ve çıkış yap butonunu gizle
    if (userLoggedInContent) userLoggedInContent.style.display = "none";
    if (userLoggedInButton) userLoggedInButton.style.display = "none";

    // Giriş yap butonunu göster
    if (userLoggedOutButton) userLoggedOutButton.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  checkUserSession();
});
