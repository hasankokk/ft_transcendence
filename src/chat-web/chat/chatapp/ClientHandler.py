import re

class ClientPool:
    clients : dict[str, set[str]] = {} # username : list of chatting users
    client_id : dict[str, int] = {} # username : unique_id # inefficient, better to get id from jwt
    id_counter = 10
    rooms : dict[tuple[str, str], str] = {} # (user1, user2) : room_name & keep user1 < user2

    @classmethod
    def add_client(cls, username : str) -> bool:
        if username in cls.clients:
            return False

        cls.clients[username] = set()
        cls.client_id[username] = cls.id_counter
        cls.id_counter += 1
        return True

    @classmethod
    def add_room(cls, user1, user2) -> str | None:
        pair = cls.get_pair(user1, user2)

        if pair in cls.rooms:
            return None

        cls.clients[user1].add(user2)
        cls.clients[user2].add(user1)
        room_name = "chat_" + str(cls.client_id[user1]) + "_" + str(cls.client_id[user2])
        cls.rooms[pair] = room_name
        return room_name

    @classmethod
    def remove_client(cls, username : str):
        cls.client_id.pop(username, None)
        others = cls.clients.pop(username, None)

        if others is None:
            return

        for user2 in others:
            if not user2 in cls.clients:
                cls.remove_room(username, user2)

    @classmethod
    def remove_room(cls, user1 : str, user2 : str):
        room = cls.rooms.pop(cls.get_pair(user1, user2), None)

        if room is None:
            return

        if user1 in cls.clients:
            cls.clients[user1].discard(user2)
        if user2 in cls.clients:
            cls.clients[user2].discard(user1)

    @classmethod
    def is_online(cls, username):
        return username in cls.clients

    @classmethod
    def get_room(cls, user1, user2):
        return cls.rooms.get(cls.get_pair(user1, user2), None)

    @staticmethod
    def get_pair(user1 : str, user2 : str) -> tuple[str, str]:
        if user1 > user2:
            return (user2, user1)
        return (user1, user2)
