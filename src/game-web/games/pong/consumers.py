from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async

import json
import re

from pong.GameHandler import GamePool

class AsyncTestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Accepts JWT authenticated users if the game room is not full"""

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_name = re.sub(r'\W+', '_', self.room_name)
        self.room_name = (self.room_name[:75]) if len(self.room_name) > 75 else self.room_name
        self.room_group_name = f"pong_{self.room_name}"

        self.username = self.scope.get("username", None)

        if self.username is None:
            await self.close()
            return

        GamePool().add_game(self.room_name)
        if not GamePool()[self.room_name].add_player(self.channel_name, self.username):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
    
        if self.username is None:
            return

        if len(GamePool()[self.room_name]) <= 1:
            # TODO If game is complete and not in pending state, send game data to database
            GamePool().remove_game(self.room_name)
        else:
            if GamePool()[self.room_name].is_active():
                GamePool()[self.room_name].remove_channel(self.username)
            else:
                GamePool()[self.room_name].remove_player(self.username)

        await self.channel_layer.group_discard(self.room_group_name,
                                               self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        data = text_data_json
        data["room"] = self.room_group_name
        data["username"] = self.username
        data["type"] = text_data_json.get("type", "chat.message")

        if data["type"] == "chat.message":
            await self.channel_layer.group_send(self.room_group_name, data)
        else:
            await self.channel_layer.send(self.channel_name, data)

    async def pong_status(self, event):
        game = GamePool()[self.room_name]
    
        ball_data = {
            "pos_x": game.ball.position.x,
            "pox_y": game.ball.position.y,
            "vel_x": game.ball.velocity.x,
            "vel_y": game.ball.velocity.y,
            "radius": game.ball.radius
        }

        players = {}

        for p in game.players:
            user = game.players[p]
            players[p] = {
                "is_ready": user.is_ready,
                "is_playing": user.is_playing,
                "is_owner": user.is_owner,
                "pos_x": user.position.x,
                "pos_y": user.position.y,
                "vel": user.velocity,
                "score": user.score,
                "total_score": user.total_score,
                "wins": user.wins,
            }

        data = {
            "status": game.status,
            "game_type": game.type,
            "max_players": game.max_players,
            "ball": ball_data,
            "board_size": (game.board_size.x, game.board_size.y),
            "paddle_size": (game.paddle_size.x, game.paddle_size.y),
            "players": players,
            "current_players": game.current_players,
            "seconds": game.time_elapsed - game.time_started,
            "max_seconds": game.time_max,
        }

        data["type"] = "pong.status"

        await self.send(text_data=json.dumps(data))

    async def pong_ready(self, event):
        username = event["username"]
        await GamePool()[self.room_name].toggle_ready(username)

    async def pong_move(self, event):
        username = event["username"]
        to_up = event.get("to_up", None)

        if to_up is not None and isinstance(to_up, bool):
            await GamePool()[self.room_name].move_player(username, to_up)

    async def pong_setting(self, event):
        username = event["username"]
        game = GamePool()[self.room_name]
        player = game[username]

        if player is not None and player.is_owner:
            game.update_settings(event["settings"])

    async def chat_message(self, event):
        username = event["username"]
        room = event["room"]
        prefix = username + "@" + room + ": "
        message = event["message"]

        await self.send(text_data=json.dumps({"type": "chat.message", "message": prefix + message}))

    async def chat_command(self, event):
        username = event["username"]
        room = event["room"]
        msg_prefix = username + "@" + room + ": "
        message = event["message"]
        info_prefix = "Pong: "
        info = "Unrecognized command"

        if message.startswith("/games"):
            info = str(GamePool())

        if message.startswith("/list"):
            fields = message.split()
            if len(fields) == 1:
                info = str(GamePool()[self.room_name])
            else:
                info = ""
                for room in fields[1:]:
                    try:
                        info += room + ": " + str(GamePool()[room]) + "; "
                    except KeyError:
                        info += room + ": " + "None" + "; "

        response = msg_prefix + message + "\n" + info_prefix + info
        await self.send(text_data=json.dumps({"type": "chat.command", "message": response}))
