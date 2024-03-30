from enum import Enum
from time import time

from pong.Vector import Vector2D

class Player:
    def __init__(self, nickname: str | None = None,
                 position=(1.0,0.0), velocity=5.0):
        self.nickname = nickname
        self.is_ready = False
        self.def_position = Vector2D(position[0], position[1])
        self.position = self.def_position
        self.velocity = velocity

class Ball:
    def __init__(self, width=5.0,
                 position=(0.0,0.0), velocity=(5.0,5.0)):
        self.def_position = Vector2D(position[0], position[1])
        self.position = self.def_position
        self.def_velocity = Vector2D(velocity[0], velocity[1])
        self.velocity = self.def_velocity
        self.width = width

class GameState(Enum):
    PENDING = 1
    ACTIVE = 2
    FINISHED = 3

class GameType(Enum):
    ONEVONE = 1
    TOURNAMENT = 2

class Game:
    def __init__(self,
                 board_size=(800,600), type=GameType.ONEVONE):
        self.players = {}
        self.channels = {}
        self.ball = None
        self.status = GameState.PENDING
        self.width = board_size[0]
        self.height = board_size[1]
        self.type = type
        self.time = time()

        if self.type == GameType.TOURNAMENT:
            self.max_players = 4
        else:
            self.max_players = 2

    def add_player(self, channel_name, username, **kwargs) -> bool:
        if username in self.players and \
            username not in self.channels:
            self.channels[username] = channel_name
            return True
        elif len(self.players) >= self.max_players:
            return False
        elif GamePool.find_user(username) is None:
            player = Player(**kwargs)
            self.players[username] = player
            self.channels[username] = channel_name
            return True
        return False

    def remove_player(self, username: str) -> None | Player:
        self.remove_channel(username)
        return self.players.pop(username, None)

    def remove_channel(self, username : str):
        self.channels.pop(username, None)

    def is_active(self):
        return self.status == GameState.ACTIVE

    def __str__(self):
        return str([username for username in self.players])

    def __getitem__(self, username: str) -> None | Player:
        try:
            return self.players[username]
        except KeyError:
            return None

    def __len__(self):
        return len(self.channels)

class GamePool:
    games : dict[str, Game] = {}

    @classmethod
    def add_game(cls, room_name: str, **kwargs) -> bool:
        if room_name not in cls.games:
            game = Game(**kwargs)
            cls.games[room_name] = game
            return True
        return False

    @classmethod
    def remove_game(cls, room_name: str) -> None | Game:
        return cls.games.pop(room_name, None)

    @classmethod
    def find_user(cls, username: str) -> None | str:
        """Returns room_name of the game where the user with username exists"""
        for room_name in cls.games:
            if cls.games[room_name][username] is not None:
                return room_name
        return None

    @classmethod
    def __str__(cls):
        return str([room for room in cls.games])

    @classmethod
    def __getitem__(cls, room_name: str) -> Game:
        return cls.games[room_name]
