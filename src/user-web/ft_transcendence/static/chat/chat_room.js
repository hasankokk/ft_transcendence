function chatRoom() {
  document
    .getElementById("chat-room-online-refresh")
    .addEventListener("click", (e) => {
      if (chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(
          JSON.stringify({
            type: "chat.list",
          })
        );

        setTimeout(function () {
          updateOnlineList();
        }, 1000);
      } else {
        document.getElementById("chat-room-online-log").innerHTML =
          "No connection established.";
      }
    });
}

function updateOnlineList() {
  const online_info = JSON.parse(localStorage.getItem("online-info"));
  const target = document.getElementById("chat-room-online-log");
  target.innerHTML = "";
  for (const element of online_info.users) {
    target.appendChild(document.createElement("li")).innerHTML = element;
  }
  document.getElementById("chat-room-online-ago").innerText =
    "Last updated at " + online_info.last_update;
}
