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

        GamePool().add_game(self.room_name)
        if not GamePool()[self.room_name].add_player(self.channel_name, self.username):
            await self.close()

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
        message = text_data_json["message"]
        message_type = text_data_json.get("type", "chat.message")
        data = {"type": message_type,
                "message": message,
                "room": self.room_group_name,
                "username": self.username}

        if message_type != "chat.command":
            await self.channel_layer.group_send(self.room_group_name, data)
        else:
            await self.channel_layer.send(self.channel_name, data)

    async def chat_message(self, event):
        username = event["username"]
        room = event["room"]
        prefix = username + "@" + room + ": "
        message = event["message"]

        await self.send(text_data=json.dumps({"message": prefix + message}))

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
        await self.send(text_data=json.dumps({"message": response}))
