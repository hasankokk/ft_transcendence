import { initLogoutButton } from "./user/logoutPage.js";
/* ilk satır html içinde yazılabiliyorsa adres
 * 	{% static 'user/logoutPage.js' %}
 * olarak değiştirilmeli*/


function homePage() {
  const homeContent = `
    <nav class="navbar navbar-expand-lg mx-auto navbar-custom mt-4 ">
    <div class="container-fluid">
      <a href="/index" class="navbar-brand h1 mb-0">TRANSCENDENCE</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
        <ul class="navbar-nav d-flex justify-content-center">
          <li class="nav-item">
            <a href="/index" class="nav-link">Home</a>
          </li>
          <li class="nav-item">
            <a href="/game" class="nav-link">Game</a>
          </li>
          <li class="nav-item">
            <a class="nav-link">Ranking</a>
          </li>
		    <li class="nav-item">
            <a
            href="/login"
            class="nav-link btn31 btn-danger custom-logout-button1"
            id="logoutButton""
            >Logout</a>
            </li>
        </ul>
      </div>
    </div>
  </nav>
</header>
</div>
    <div class="d-flex justify-content-center position-relative" style="height: 100vh">
        <div
            class="position-absolute"
            style="left: 50%; top: 50%; transform: translate(-85%, -50%); border: 3px solid black; border-radius: 4px; box-shadow: 0 0 75px #fafafa;"
        >
            <img src="" width="900" height="100" alt="" />
        </div>
    </div>
    `;
  setTimeout(initLogoutButton, 0);
  return homeContent;
}

export { homePage };
