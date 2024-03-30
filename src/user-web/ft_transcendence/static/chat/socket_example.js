function chatRoom() {
  document.querySelector("#chat-message-input").focus();
  document.querySelector("#chat-message-input").onkeyup = function (e) {
    if (e.key === "Enter") {
      // enter, return
      document.querySelector("#chat-message-submit").click();
    }
  };

  document.querySelector("#chat-message-submit").disabled = true;
  document.querySelector("#chat-message-input").disabled = true;
  document.querySelector("#room-ready").disabled = true;

  let chatSocket;
  let isConnected = false;
  let pingInterval;

  document.querySelector("#room-connect").onclick = function (e) {
    const messageInputDom = document.querySelector("#room-input");
    const message = messageInputDom.value;
    const roomName = message;

    if (isConnected) {
      chatSocket.close();
    }

    chatSocket = new WebSocket(
      "ws://" + window.location.host + "/pong/socket/" + roomName + "/"
    );

    chatSocket.onopen = function (e) {
      document.querySelector("#chat-log").value +=
        "[!] Connected to " + chatSocket.url + "\n";

      document.querySelector("#chat-message-submit").disabled = false;
      document.querySelector("#chat-message-input").disabled = false;
      document.querySelector("#room-ready").disabled = false;
      isConnected = true;
      pingInterval = setInterval(function () {
        pingPong(chatSocket);
      }, 1000);
    };

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      if ("type" in data & data.type === "pong.status") {
        const info = JSON.stringify(JSON.parse(data.message), null, 2);
        document.querySelector("#ping-log").value = info + "\n";
      } else {
        document.querySelector("#chat-log").value += data.message + "\n";
      }
    };

    chatSocket.onclose = function (e) {
      document.querySelector("#chat-log").value +=
        "[!] Chat socket closed at " + chatSocket.url + "\n";

      document.querySelector("#chat-message-submit").disabled = true;
      document.querySelector("#chat-message-input").disabled = true;
      document.querySelector("#room-ready").disabled = true;
      isConnected = false;
      clearInterval(pingInterval);
    };

    document.querySelector("#chat-message-submit").onclick = function (e) {
      const messageInputDom = document.querySelector("#chat-message-input");
      const message = messageInputDom.value;
      let type;

      if (message.startsWith("/")) {
        type = "chat.command";
      } else {
        type = "chat.message";
      }

      chatSocket.send(
        JSON.stringify({
          type: type,
          message: message,
        })
      );
      messageInputDom.value = "";
    };
  };

  document.querySelector("#room-disconnect").onclick = function (e) {
    chatSocket.close();
  };

  document.querySelector("#room-ready").onclick = function (e) {
    pingReady(chatSocket);
  }
}

function pingPong(socket) {
  socket.send(
    JSON.stringify({
      type: "pong.status",
      message: "",
    })
  );
}

function pingReady(socket) {
  socket.send(
    JSON.stringify({
      type: "pong.ready",
      message: "",
    })
  );
}