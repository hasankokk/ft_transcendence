const funcMap = {
  Home: bindHome,
  Login: bindLogin,
  Games: bindGame,
  Ranking: bindRanking,
  Profile: bindProfile,
};

const items = document.getElementsByClassName("nav-item");
const main_content = document.getElementById("main-content");
bindFunc = null;
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
        if (bindFunc !== null) {
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

  bindAnchor(anchor, funcMap[anchor.text]);
}

window.addEventListener("load", (e) => {
  if (history.state == null) {
    history.replaceState(getState("/home", funcMap["Home"]), "", "");
  }
  loadHistoryEvent(history);
});

window.addEventListener("popstate", (e) => {
  loadHistoryEvent(e);
});
