import { router } from "./spa.js";

function isUserLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

function getCsrfToken() {
  // CSRF token'ını meta etiketinden al
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    .split("=")[1];
}

function navigateTo(path) {
  history.pushState(null, null, path);
  console.log("Navigating to", path);
  router();
}

export { isUserLoggedIn, getCsrfToken, navigateTo };
