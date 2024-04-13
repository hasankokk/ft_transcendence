function checkUserSession() {
  fetchWithJWT("/user/check-session/", {
    method: "GET",
    credentials: "include", // Çerezleri her istekte göndermek için
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Oturum durumunu kontrol et
      updateUserNavbar(data.isLoggedIn);
      if (data.isLoggedIn & (typeof chatSocket === "undefined")) {
        initiateChatSocket();
      } else if (
        data.isLoggedIn &
        (chatSocket.readyState === WebSocket.CLOSED)
      ) {
        initiateChatSocket();
      } else if (
        !data.isLoggedIn &
        (chatSocket.readyState === WebSocket.OPEN)
      ) {
        chatSocket.close();
      }
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

function initiateChatSocket() {
  chatSocket = new WebSocket("wss://" + window.location.host + "/ws/chat-api/");
  chatSocket.onmessage = chatSocketReceive;
  chatSocket.onopen = chatSocketOpen;
  chatSocket.onclose = chatSocketClose;
}

function chatSocketOpen(event) {
  console.log("Chat connection has been established."); // DEBUG
  sessionStorage.setItem("online-info", "[]");
  sessionStorage.setItem("chat-room-history", "{}");
  sessionStorage.setItem("chat-user-room", "{}");
}

function chatSocketClose(event) {
  console.log("Chat connection has been closed."); // DEBUG
}

function chatSocketReceive(event) {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "chat.error":
      receiveChatErrorSignal(data);
      break;
    case "chat.list":
      receiveChatListSignal(data);
      break;
    case "chat.open":
      receiveChatOpenSignal(data);
      break;
    case "chat.message":
      receiveChatMessageSignal(data);
      break;
  }
}
