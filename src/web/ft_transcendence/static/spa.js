import { homePage } from "./homePage.js";
import { gamePage, setupChatButton } from "./game/gamePage.js";
import { loginPage, checkOAuthSuccess } from "./user/loginPage.js";
import { registerPage } from "./user/registerPage.js";
import { logoutPage } from "./user/logoutPage.js";
import { isUserLoggedIn, navigateTo } from "./helpers.js";

// Link tıklamalarını işleyecek fonksiyon
function handleLinkClick(e) {
  e.preventDefault();
  const path = e.target.getAttribute("href");
  history.pushState({}, "", path);
  router();
}
// Kullanıcı oturum durumunu kontrol et

function router() {
  const routes = {
    "/": homePage,
    "/game": gamePage,
    "/login": loginPage,
    "/register": registerPage,
    "/logout": logoutPage,
    // Diğer rotalar...
  };

  const path = window.location.pathname;

  // Oturum durumuna göre yönlendirme
  if (!isUserLoggedIn() && path !== "/login" && path !== "/register") {
    navigateTo("/login");
    return;
  }

  if (isUserLoggedIn() && (path === "/login" || path === "/register")) {
    navigateTo("/");
    return;
  }

  const page = routes[path] ? routes[path]() : homePage();
  document.getElementById("app").innerHTML = page;
  if (path === "/game") {
    setupChatButton();
  }
  document.querySelectorAll("a").forEach((link) => {
    link.removeEventListener("click", handleLinkClick);
    link.addEventListener("click", handleLinkClick);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  checkOAuthSuccess(); // Bu satırı ekleyin
  router();
});
// Uygulama başlangıcında ve her popstate event'ında router'ı çağır
window.addEventListener("popstate", router);
document.addEventListener("DOMContentLoaded", router);

export { router, handleLinkClick };
