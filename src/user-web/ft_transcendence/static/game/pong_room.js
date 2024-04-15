let pongRoomConnected = {};
let pongRoomName;
let isConnected = false;
let pingInterval;
let pongGameType;

function pongRoom() {
  document.querySelector("#pong-message-input").focus();
  document
    .querySelector("#pong-message-input")
    .addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        // enter, return
        document.querySelector("#pong-message-submit").click();
      }
    });

  if (isConnected) {
    setDisabledPongRoom(false);
  } else {
    setDisabledPongRoom(true);
  }

  document.getElementById("pong-room-switch-type").addEventListener("click", function (e) {
    pingSwitchType(pongSocket);
  });

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
      pongRoomName = roomName;
      document.querySelector("#pong-message-log").value +=
        "[!] Connected to " + pongSocket.url + "\n";

      setDisabledPongRoom(false);
      isConnected = true;
      pingInterval = setInterval(function () {
        pingPong(pongSocket);
      }, 10);
    };

    pongSocket.onmessage = function (e) {
      if (!onGamePage) {
        return;
      }
      const info = JSON.parse(e.data);
      if (("type" in info) & (info.type === "pong.status")) {
        const log = document.querySelector("#pong-ping-log");
        log.value = JSON.stringify(info, null, 4);
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
      const log = document.querySelector("#pong-message-log");
      if (typeof log != "null") {
        log.value += "[!] Pong socket closed at " + pongSocket.url + "\n";
      }

      setDisabledPongRoom();
      isConnected = false;
      pongRoomName = null;
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
  if (isConnected) {
    socket.send(
      JSON.stringify({
        type: "pong.status",
        message: "",
      })
    );
  }
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

function pingSwitchType(socket) {
  let targetType;
  if (pongGameType === 1) {
    targetType = "TOURNAMENT";
  } else {
    targetType = "ONEVONE";
  }

  socket.send(
    JSON.stringify({
      type: "pong.setting",
      settings: {type: targetType},
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
  pongGameType = info.game_type;
  updateScoreBoard(info);
  if (info.status === 2 && !window.gameActive()) {
    window.gameInitBoard(info.board_size[0], info.board_size[1]);
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
        player.pos,
        player.vel,
        player.width,
        player.height,
        player.nickname,
        player.username
      );
      count += 1;
    }
    window.gameStartMatch();
  } else if ((info.status === 3 || info.status === 4) && window.gameActive()) {
    window.gameFinishMatch();
  } else if (info.status === 2) {
    updateScoreLabel(info);
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
    width: p_info.width,
    height: p_info.height,
  };
}

function updateScoreLabel(info) {
  const score0 = info.players[info.current_players[0]].score;
  const score1 = info.players[info.current_players[1]].score;

  document.getElementById("pong-score-label").innerText =
    score0 + " - " + score1;
}

function updateScoreBoard(info) {
  let stripped = {};

  for (const key of Object.keys(info.players)) {
    const value = info.players[key];
    stripped[key] = [
      value.nickname,
      value.is_owner,
      value.wins,
      value.total_score,
    ];
  }

  if (!isSameConnected(pongRoomConnected, stripped)) {
    pongRoomConnected = stripped;

    const element = document.getElementById("pong-player-scores");
    element.innerHTML = "";
    for (const [key, value] of Object.entries(pongRoomConnected)) {
      const row = element.appendChild(document.createElement("div"));
      row.classList.add("row");

      const name = row.appendChild(document.createElement("div"));
      name.classList.add("col");
      name.textContent = value[0];
      if (value[1]) {
        const span = name.appendChild(document.createElement("span"));
        span.classList.add("position-absolute", "start-50", "text-warning");
        span.innerHTML = '<i class="bi bi-star-fill"></i>';
      }

      const scores = row.appendChild(document.createElement("div"));
      scores.classList.add("col");
      const score_row = scores.appendChild(document.createElement("div"));
      score_row.classList.add("row", "justify-content-between");
      const win = score_row.appendChild(document.createElement("div"));
      win.classList.add("col");
      win.textContent = value[2] + "W";
      const total_score = score_row.appendChild(document.createElement("div"));
      total_score.classList.add("col");
      total_score.textContent = value[3] + "TP";
    }
  }
}

function isSameConnected(dict1, dict2) {
  if (Object.keys(dict1).length !== Object.keys(dict2).length) {
    return false;
  } else {
    const a1 = Object.entries(dict1).sort();
    const a2 = Object.entries(dict2).sort();

    for (let i = 0; i < a1.length; i++) {
      const e1 = a1[i];
      const e2 = a2[i];

      // e1[0] key / username
      // e1[1] value / [nickname, is_owner, wins, total_score, score]

      if (e1.length !== e2.length) {
        return false;
      } else if (e1[0] !== e2[0]) {
        return false;
      }

      const val1 = e1[1];
      const val2 = e2[1];

      if (val1.length !== val2.length) {
        return false;
      }

      for (let j = 0; j < val1.length; j++) {
        if (val1[j] !== val2[j]) {
          return false;
        }
      }
    }
  }
  return true;
}
