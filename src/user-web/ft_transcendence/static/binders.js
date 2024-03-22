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

  const a_42login = document.getElementById("42LoginLink");
  a_42login.addEventListener("click", (e) => {
    e.preventDefault();
    fetchOAuthUrl();
  });
}

function bindRegister() {
  console.log("called bindRegister()"); // DEBUG, Should be called when register page appears
  const a_login = document.getElementById("loginLink");

  bindAnchor(a_login, bindLogin);
}

function bindHome() {}

function bindLogout() {}

function bindGame() {
  console.log("called bingGame");
  window.pong_start()
}

function bindRanking() {}

function bindProfile() {}

function bindChat() {
  chatFunction();
}

function bindAnchor(anchorInstance, func) {
  anchorInstance.removeEventListener("click", loadContentEvent);

  anchorInstance.addEventListener("click", (e) => {
    e.preventDefault();
    if ((func !== null) & (typeof func !== "undefined")) {
      bindFunc = func;
    }
    loadContent(e.currentTarget);
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

  fetchWithJWT(requestUrl)
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