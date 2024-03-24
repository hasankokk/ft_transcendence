from django.test import TestCase
from django.utils import timezone
from pong import models

class LobbyTestCase(TestCase):
    def setUp(self):
        models.Lobby.objects.create(title="new_empty")

        models.Lobby.objects.create_lobby(title="new_w_user",
                                          username="testuser")

        models.Lobby.objects.create(title="all_ready_to_count")
        
        to_count = models.Lobby.objects.get(title="all_ready_to_count")
        models.LobbyUser.objects.create(lobby=to_count, username="user1",
                                        is_ready=True)
        models.LobbyUser.objects.create(lobby=to_count, username="user2",
                                        is_ready=True)
        
        models.Lobby.objects.create(title="tournament",
                                    mode=models.Lobby.LobbyType.TOURNAMENT)

    def test_is_active(self):
        """Test if new lobbies are active and old lobbies are inactive"""

        new = models.Lobby.objects.get(title="new_empty")
        
        current_tz = timezone.get_current_timezone()
        old = models.Lobby(title="old_empty",
                           last_activity=timezone.datetime(year=1999,
                                                            month=1,
                                                            day=1,
                                                            tzinfo=current_tz))
        new_w_user = models.Lobby.objects.get(title="new_w_user")

        self.assertIs(new.is_active(), True)
        self.assertIs(old.is_active(), False)
        self.assertIs(new_w_user.is_active(), True)

    def test_player_count(self):
        """Test if the number of players are correctly counted"""

        new_w_user = models.Lobby.objects.get(title="new_w_user")
        to_count = models.Lobby.objects.get(title="all_ready_to_count")
        
        self.assertEqual(new_w_user.player_count(), 1)
        self.assertEqual(to_count.player_count(), 2)

    def test_max_player_count(self):
        """Test if the maximum number of players are correct according to game mode"""
    
        to_count = models.Lobby.objects.get(title="all_ready_to_count")
        tournament = models.Lobby.objects.get(title="tournament")

        self.assertEqual(to_count.max_players(), 2)
        self.assertEqual(tournament.max_players(), 4)

    def test_is_all_ready(self):
        """Test if is_all_ready returns True when all players are ready"""
        
        new_w_user = models.Lobby.objects.get(title="new_w_user")
        to_count = models.Lobby.objects.get(title="all_ready_to_count")

        self.assertIs(new_w_user.is_all_ready(), False)
        self.assertIs(to_count.is_all_ready(), True)

class GameStatusTestCase(TestCase):
    def setUp(self):
        models.Lobby.objects.create(title="all_ready_to_count")
        
        to_count = models.Lobby.objects.get(title="all_ready_to_count")
        models.LobbyUser.objects.create(lobby=to_count, username="user1",
                                        is_ready=True)
        models.LobbyUser.objects.create(lobby=to_count, username="user2",
                                        is_ready=True)

    def test_is_finished(self):
        """Test if old games are returned as finished"""

        to_count = models.Lobby.objects.get(title="all_ready_to_count")
        user1 = models.LobbyUser.objects.get(username="user1")
        user2 = models.LobbyUser.objects.get(username="user2")

        status = models.GameStatus.objects.create(lobby=to_count,
                                                  player1=user1,
                                                  player2=user2)

        self.assertIs(status.is_finished(), False)

        current_tz = timezone.get_current_timezone()
        status.created_at = timezone.datetime(year=1999,
                                              month=1,
                                              day=1,
                                              tzinfo=current_tz)
        status.save()

        self.assertIs(status.is_finished(), True)
