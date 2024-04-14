function pongRoom() {
  document.querySelector("#pong-message-input").focus();
  document.querySelector("#pong-message-input").onkeyup = function (e) {
    if (e.key === "Enter") {
      // enter, return
      document.querySelector("#pong-message-submit").click();
    }
  };

  setDisabledPongRoom();

  let isConnected = false;
  let pingInterval;

  document.querySelector("#pong-room-connect").onclick = function (e) {
    const messageInputDom = document.querySelector("#pong-room-input");
    const message = messageInputDom.value;
    const roomName = message;

    if (isConnected) {
      pongSocket.close();
    }

    pongSocket = new WebSocket(
      "wss://" + window.location.host + "/ws/pong/" + roomName + "/"
    );

    pongSocket.onopen = function (e) {
      document.querySelector("#pong-message-log").value +=
        "[!] Connected to " + pongSocket.url + "\n";

      setDisabledPongRoom(false);
      isConnected = true;
      pingInterval = setInterval(function () {
        pingPong(pongSocket);
      }, 10);
    };

    pongSocket.onmessage = function (e) {
      const info = JSON.parse(e.data);
      if (("type" in info) & (info.type === "pong.status")) {
        document.querySelector("#pong-ping-log").value = JSON.stringify(
          info,
          null,
          4
        );
        if (("current_players" in info) & (info.current_players.length > 0)) {
          replaceOutput(
            info.players[info.current_players[0]],
            "pong-player1-log",
            ["0", info.current_players[0]]
          );
          replaceOutput(
            info.players[info.current_players[1]],
            "pong-player2-log",
            ["1", info.current_players[1]]
          );
        }
        handlePongGame(info);
      } else {
        document.querySelector("#pong-message-log").value +=
          info.message + "\n";
      }
    };

    pongSocket.onclose = function (e) {
      document.querySelector("#pong-message-log").value +=
        "[!] Pong socket closed at " + pongSocket.url + "\n";

      setDisabledPongRoom();
      isConnected = false;
      clearInterval(pingInterval);
    };

    document.querySelector("#pong-message-submit").onclick = function (e) {
      const messageInputDom = document.querySelector("#pong-message-input");
      const message = messageInputDom.value;
      let type;

      if (message.startsWith("/")) {
        type = "chat.command";
      } else {
        type = "chat.message";
      }

      pongSocket.send(
        JSON.stringify({
          type: type,
          message: message,
        })
      );
      messageInputDom.value = "";
    };
  };

  document.querySelector("#pong-room-disconnect").onclick = function (e) {
    pongSocket.close();
  };

  document.querySelector("#pong-room-ready").onclick = function (e) {
    pingReady(pongSocket);
  };

  document.querySelector("#pong-room-move-up").onclick = function (e) {
    pingMove(pongSocket, true);
  };

  document.querySelector("#pong-room-move-down").onclick = function (e) {
    pingMove(pongSocket, false);
  };
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

function pingMove(socket, to_up = true) {
  socket.send(
    JSON.stringify({
      type: "pong.move",
      to_up: to_up,
    })
  );
}

function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, undefined, 4);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

function replaceOutput(input, targetElementId, playerInfo = ["x", "username"]) {
  const target = document.getElementById(targetElementId);
  target.innerHTML = "";
  target.appendChild(document.createElement("h3")).innerHTML =
    "player " + playerInfo[0] + ": " + playerInfo[1];
  target.appendChild(document.createElement("pre")).innerHTML =
    syntaxHighlight(input);
}

function setDisabledPongRoom(setBool = true) {
  document.querySelector("#pong-message-submit").disabled = setBool;
  document.querySelector("#pong-message-input").disabled = setBool;
  document.querySelector("#pong-room-ready").disabled = setBool;
  document.querySelector("#pong-room-move-up").disabled = setBool;
  document.querySelector("#pong-room-move-down").disabled = setBool;
}

function handlePongGame(info) {
  if (info.status === 2 && !window.gameActive()){
    window.gameSetBoard(info.board_size[0], info.board_size[1]);
    let ball = ballDict(info.ball);
    window.gameInitBall(ball.pos, ball.vel, ball.rad);
    let count = 0;
    for (const p of info.current_players) {
      let p_info = info.players[p];
      p_info["width"] = info.paddle_size[0];
      p_info["height"] = info.paddle_size[1];
      const player = playerDict(p_info, p);
      window.gameInitPlayer(
        "player" + count,
        player.pos, player.vel,
        player.width, player.height,
        player.nickname, player.username);
      count += 1;
    }
    window.gameStartMatch();
  } else if ((info.status === 3 || info.status === 4) && window.gameActive()) {
    window.gameFinishMatch();
  } else if (info.status === 2) {
    let ball = ballDict(info.ball);
    window.gameSetBall(ball.pos, ball.vel);

    let count = 0;
    for (const p of info.current_players) {
      let p_info = info.players[p];
      p_info["width"] = info.paddle_size[0];
      p_info["height"] = info.paddle_size[1];
      const player = playerDict(p_info, p);
      window.gameSetPlayer("player" + count, player.pos);
      count += 1;
    }
  }
}

function ballDict(info_ball) {
  return {
    pos: { x: info_ball.pos_x, y: info_ball.pos_y },
    vel: { x: info_ball.vel_x, y: info_ball.vel_y },
    rad: info_ball.radius,
  };
}

function playerDict(p_info, username) {
  return {
    pos: { x: p_info.pos_x, y: p_info.pos_y },
    vel: p_info.vel,
    nickname: p_info.nickname,
    username: username,
    width: p_info.width ? "with" in p_info : 10,
    height: p_info.height ? "height" in p_info : 10,
  };
}