const funcMap = {
  Home: bindHome,
  Login: bindLogin,
  Pong: bindPongRoom,
  Chat: bindChat,
  ChatRoom: bindChatRoom,
  Ranking: bindRanking,
  Profile: bindProfile,
};

const items = document.getElementsByClassName("nav-item");
const main_content = document.getElementById("main-content");
let bindFunc;
let chatSocket;
let pongSocket;
let onGamePage = false;
const observer = new MutationObserver(function (mutations) {
  for (const mutation of mutations) {
    console.log(mutation); // DEBUG

    mutation.addedNodes.forEach((element) => {
      // === DEBUG ===
      if (!element.tagName) {
        console.log("non class found! " + element.nodeName);
      } else if (element.classList.contains("eoc")) {
        console.log("eoc found!");
        updateContentAnchors();
        if ((bindFunc !== null) & (typeof bindFunc !== "undefined")) {
          bindFunc();
          bindFunc = null;
        }
      } else {
        console.log("other class found! " + element.className);
      }
      // === DEBUG ===
    });
  }
});

observer.observe(main_content, { childList: true });

for (i = 0; i < items.length; i++) {
  const anchor = items[i].querySelector("a");

  if (anchor.text !== "Logout") {
    bindAnchor(anchor, funcMap[anchor.text]);
  } else {
    bindLogout(anchor);
  }
}

window.addEventListener("load", (e) => {
  if (history.state == null) {
    history.replaceState(getState("/home", funcMap["Home"]), "", "");
  }
  loadHistoryEvent(history);
});

window.addEventListener("unload", (e) => {
  closeSocket(chatSocket);
  closeSocket(pongSocket);
});

window.addEventListener("popstate", (e) => {
  loadHistoryEvent(e);
});

document.addEventListener("DOMContentLoaded", function () {
  checkUserSession();
});
