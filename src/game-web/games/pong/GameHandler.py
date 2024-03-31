from enum import IntEnum
from time import time

import random
import asyncio
import copy

from pong.Vector import Vector2D

class Player:
    def __init__(self, board_size : Vector2D, paddle_size : Vector2D,
                 nickname: str | None = None, velocity=500.0):
        self.nickname = nickname
        
        self.is_ready = False
        self.is_playing = False
        self.times_played = 0

        self.def_position = abs(Vector2D(board_size.x / 2 - paddle_size.x, 0))
        self.position = copy.copy(self.def_position)
        self.velocity = velocity

        self.score = 0
        self.total_score = 0
        self.wins = 0

    def reset_game_variables(self):
        self.position = copy.copy(self.def_position)
        self.is_ready = False

    def toggle_position_x(self):
        self.position.x = -self.position.x

    def move(self, to_up : bool, factor):
        direction = 1 if to_up else -1
        
        self.position.y += direction * factor * self.velocity

class Ball:
    def __init__(self, board_size: Vector2D, paddle_size: Vector2D,
                 radius, velocity: tuple, position=(0.0,0.0)):

        self.def_position = Vector2D(position[0], position[1])
        self.def_velocity = abs(Vector2D(velocity[0], velocity[1]))
        self.position = copy.copy(self.def_position)
        self.velocity = copy.copy(self.def_velocity)

        self.radius = abs(radius)

        self.bounce_margin = Vector2D(board_size.x / 2 - self.radius - paddle_size[0],
                                      board_size.y / 2 - self.radius)

        self.score_margin = board_size.x / 2 - self.radius - paddle_size[0] / 2

    def reset_game_variables(self):
        """Reset variables to default"""
        self.position = copy.copy(self.def_position)
        self.velocity = copy.copy(self.def_velocity)

    def reset(self):
        """Reset ball based on last score"""
        pos_x = self.position.x
        self.reset_game_variables()

        if pos_x > 0:
            self.velocity.x = abs(self.velocity.x)
        else:
            self.velocity.x = -abs(self.velocity.x)

    def bounce_vertical(self) -> bool:
        if self.bounce_margin.y < abs(self.position.y):
            self.velocity.y = -self.velocity.y

        return True

    def bounce_horizontal(self, paddle_range: tuple[float, float]) -> bool:
        """Returns False if ball position has passed the paddle"""
        
        pos_x = abs(self.position.x)
        
        if self.bounce_margin.x < pos_x:

            if pos_x < self.score_margin:
                if paddle_range[0] < self.position.y < paddle_range[1]:
                    self.velocity.x = -self.velocity.x
                return True
            else:
                return False
        
        return True

class GameState(IntEnum):
    PENDING = 1
    ACTIVE = 2
    LOOP_ENDED = 3
    FINISHED = 4

class GameType(IntEnum):
    ONEVONE = 1
    TOURNAMENT = 2

class Game:
    def __init__(self,
                 board_size=(800,600), paddle_size=(30,100),
                 ball_radius=5.0, ball_velocity=(35.0, 25.0),
                 time_max = 30, type=GameType.ONEVONE):

        self.players : dict[str, Player] = {} # All players
        self.current_players = tuple() # 1V1 players when game is active
        self.channels = {} # Connected players
        self.status = GameState.PENDING
        self.type = type
        self.time_started = time() # Dummy default
        self.time_elapsed = time() # Dummy default
        self.time_max = time_max
        self.task = set()

        self.board_size = abs(Vector2D(board_size[0], board_size[1]))
        self.paddle_size = abs(Vector2D(paddle_size[0], paddle_size[1]))

        self.ball = Ball(self.board_size, self.paddle_size,
                         radius=ball_radius, velocity=ball_velocity)

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
            player = Player(self.board_size, self.paddle_size,
                            **kwargs)
            self.players[username] = player
            self.channels[username] = channel_name
            return True
        return False

    def remove_player(self, username: str) -> None | Player:
        self.remove_channel(username)
        return self.players.pop(username, None)

    def remove_channel(self, username : str):
        self.players[username].is_ready = False
        self.channels.pop(username, None)

    def is_active(self):
        return self.status == GameState.ACTIVE

    def is_all_ready(self):
        if len(self.players) == self.max_players:
            for user in self.players:
                if not self.players[user].is_ready:
                    return False
            return True
        return False

    def full_reset(self):
        self.ball.reset_game_variables()
        for user in self.players:
            self.players[user].reset_game_variables()
            self.players[user].total_score = 0
            self.players[user].wins = 0

    async def toggle_ready(self, username):
        if self.status != GameState.PENDING:
            return

        self.players[username].is_ready = not self.players[username].is_ready

        if self.is_all_ready():
            task = asyncio.create_task(self.startGame())
            self.task.add(task)
            task.add_done_callback(self.task.discard)

    async def move_player(self, username, to_up : bool):
        t_delta = time() - self.time_elapsed

        if t_delta > 10e-3: # 10ms
            self.players[username].move(to_up, 0.1)


    def __str__(self):
        return str([username for username in self.players])

    def __getitem__(self, username: str) -> None | Player:
        try:
            return self.players[username]
        except KeyError:
            return None

    def __len__(self):
        return len(self.channels)

    def pair_select(self, loop_count) -> None | tuple[str, str]:
        # match players with lowest number of times_played and wins
        pass

    def paddle_range(self, players) -> tuple[float, float]:
        if self.ball.position.x > 0:
            min = self.players[players[0]].position.y - self.paddle_size.y / 2
            max = self.players[players[0]].position.y + self.paddle_size.y / 2
        else:
            min = self.players[players[1]].position.y - self.paddle_size.y / 2
            max = self.players[players[1]].position.y + self.paddle_size.y / 2

        return (min, max)
    
    def set_score(self, players):
        if self.ball.position.x > 0:
            self.players[players[0]].score += 1
        else:
            self.players[players[1]].score += 1

        self.ball.reset()

    async def startGame(self):
        pl_list = list(self.players)
        random.shuffle(pl_list)
        self.full_reset()

        if self.type == GameType.ONEVONE:
            await self.startMatch((pl_list[0], pl_list[1]))
        else:
            loop_count = 0
            while not all([self.players[user].times_played < 2 for user in pl_list]):
                pair = self.pair_select(loop_count)
                if pair is not None:
                    await self.startMatch(pair)
                else:
                    raise PairNotFound()
        
        self.status = GameState.FINISHED
        await asyncio.sleep(10)
        # Send game data to database
        self.status = GameState.PENDING

        print("GAME FINISHED") # DEBUG

    async def startMatch(self, players : tuple[str, str]):
        self.status = GameState.ACTIVE
        self.current_players = players
        for p in players:
            self.players[p].reset_game_variables()
            self.players[p].is_playing = True
        self.players[players[0]].toggle_position_x()
        self.time_started = time()
        self.time_elapsed = self.time_started

        while (self.status != GameState.LOOP_ENDED):
            await self.cycle(players)
            if self.time_elapsed - self.time_started > self.time_max:
                self.status = GameState.LOOP_ENDED
            await asyncio.sleep(25e-3) # 25ms

        for p in players:
            self.players[p].times_played += 1
            self.players[p].is_playing = False
            self.players[p].total_score += self.players[p].score

        if self.players[players[0]].score > self.players[players[1]].score:
            self.players[players[0]].wins += 1
        elif self.players[players[0]].score < self.players[players[1]].score:
            self.players[players[1]].wins += 1

        self.current_players = ()
        print("MATCH FINISHED") # DEBUG

    async def cycle(self, players):
        t_delta = time() - self.time_elapsed

        if t_delta > 10e-3: # 10ms

            self.ball.bounce_vertical()
            if not self.ball.bounce_horizontal(self.paddle_range(players)):
                self.set_score(players)

            self.ball.position.x += self.ball.velocity.x * t_delta
            self.ball.position.y += self.ball.velocity.y * t_delta

        self.time_elapsed = time()

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

class PairNotFound(Exception):
    pass
