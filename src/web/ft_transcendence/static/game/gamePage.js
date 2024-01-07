import { initLogoutButton } from "../user/logoutPage.js";

function gamePage() {
  const gameContent = `
  <nav class="navbar navbar-expand-lg mx-auto navbar-custom mt-4">
      <div class="container-fluid">
          <a href="/index" class="navbar-brand h1 mb-0">PONG</a>
          <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-target="#navbarTogglerDemo01"
              aria-controls="navbarNavDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation"
          >
              <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
              <ul class="navbar-nav">
                  <li class="nav-item">
                      <button
                          class="nav-link active"
                          style="background: none; border: none; cursor: pointer"
                          aria-current="page"
                          id="chatButton"
                      >
                          Chat
                      </button>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="/game">Tournament</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="#">Ranking</a>
                  </li>
		   		 <li class="nav-item">
            	<a href="/login" class="nav-link btn31 btn-danger custom-logout-button1"
            id="logoutButton""
            >Logout</a>
            </li>
              </ul>
          </div>
      </div>
  </nav>
    <div
      class="d-flex justify-content-center position-relative"
      style="height: 100vh"
    >
      <div
          class="position-absolute"
          style="
              left: 50%;
              top: 50%;
              transform: translate(-85%, -50%);
              border: 3px solid black;
              border-radius: 4px;
              box-shadow: 0 0 75px #fafafa;
          "
      >
          <canvas id="pongCanvas" width="800" height="400"></canvas>      </div>

      <div
          class="position-absolute"
          style="
              left: 50%;
              top: 50%;
              transform: translate(500%, -50%);
              border: 3px solid black;
              border-radius: 4px;
              box-shadow: 0 0 75px #fafafa;
              display: none;
          "
          id="chatCard"
      >
          <img src="" width="425" height="750" alt="Chat Content" />
  </div>
  `;
  setTimeout(initLogoutButton, 0);
  // document.body.innerHTML = gameContent;
  // setTimeout(initPongGame(), 0);
  return gameContent;
}

function setupChatButton() {
  const chatButton = document.getElementById("chatButton");
  const chatPanel = document.getElementById("chatCard");

  // Chat panelinin son durumunu yükle
  const chatPanelVisible = localStorage.getItem("chatPanelVisible") === "true";

  // Chat panelinin görünürlüğünü ayarla
  chatPanel.style.display = chatPanelVisible ? "block" : "none";

  if (chatButton && chatPanel) {
    chatButton.addEventListener("click", function () {
      const isDisplayed = chatPanel.style.display === "block";
      chatPanel.style.display = isDisplayed ? "none" : "block";

      // Yeni durumu kaydet
      localStorage.setItem("chatPanelVisible", !isDisplayed);
    });
  }
}

export { gamePage, setupChatButton };
