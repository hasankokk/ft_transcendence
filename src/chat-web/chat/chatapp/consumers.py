from channels.generic.websocket import AsyncWebsocketConsumer

from chatapp.ClientHandler import ClientPool

import json
import re

class AsyncChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = self.scope.get("username", None)
        self.rooms = set()

        if self.username is None:
            await self.close()
            return

        if not ClientPool.add_client(self.username): # If the client is already connected
            self.username = None
            await self.close()
            return

        await self.accept()

    async def disconnect(self, close_code):

        if self.username is None:
            return

        for room in self.rooms:
            await self.channel_layer.group_discard(room, self.channel_name)

        ClientPool().remove_client(self.username)

    async def receive(self, text_data):
        data = json.loads(text_data)
        data["username"] = self.username
        data["type"] = data.get("type", "chat.message")

        if data["type"] == "chat.message":
            room = data.get("room", None)
            target = data.get("target", None)

            if room is None or target is None:
                return
            if ClientPool().get_room(self.username, target) != room:
                return

            await self.channel_layer.group_send(room, data)
        else:
            await self.channel_layer.send(self.channel_name, data)

    async def chat_message(self, event):
        username = event["username"]
        prefix = username + ": "
        message = event["message"]

        await self.send(text_data=json.dumps({"type": "chat.message", "message": prefix + message}))

    async def chat_list(self, event):
        await self.send(text_data=json.dumps({'type': 'chat.list',
                                              'users': list(ClientPool().clients.keys())
                                              }))

    async def chat_open(self, event):
        target = event.get("target", None)

        if target is None:
            await self.send(text_data=json.dumps({"type": "chat.open", "message": "No target was provided in the context"}))
            return

        room_name = ClientPool().add_room(event["username"], target)

        if room_name is None:
            await self.send(text_data=json.dumps({"type": "chat.open", "message": "Chat connection cannot be established with target " + str(target)}))
            return

        await self.channel_layer.group_add(room_name, self.channel_name)
        self.rooms.add(room_name)
        await self.send(text_data=json.dumps({"type": "chat.open", "message": "Chat connection has been established with target " + str(target)}))
