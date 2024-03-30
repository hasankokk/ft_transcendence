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

  let chatSocket;
  let isConnected = false;

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
      isConnected = true;
    };

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      document.querySelector("#chat-log").value += data.message + "\n";
    };

    chatSocket.onclose = function (e) {
      document.querySelector("#chat-log").value +=
        "[!] Chat socket closed at " + chatSocket.url + "\n";

      document.querySelector("#chat-message-submit").disabled = true;
      document.querySelector("#chat-message-input").disabled = true;
      isConnected = false;
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
}