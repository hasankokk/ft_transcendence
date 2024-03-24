from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

from django.utils import timezone

inactivity_threshold = timezone.timedelta(minutes=5)
game_length = timezone.timedelta(seconds=60)

def max_player_validator(lobby_id):
    lobby = Lobby.objects.get(pk=lobby_id)

    if lobby.player_count() >= lobby.max_players():
        raise ValidationError(_("Lobby #%(id)s is already full with maximum number of %(max)s players"),
                              params={"id": lobby_id, "max": lobby.max_players()})

class LobbyManager(models.Manager):
    def create_lobby(self, username, **kwargs):
        lobby = self.create(**kwargs)

        try:
            lobby.lobbyuser_set.create(username=username, is_owner=True)
        except ValidationError as e:
            lobby.delete()
            return None

        return lobby

    def delete_inactive_lobbies(self):
        threshold = timezone.now() - inactivity_threshold

        inactive_lobbies = self.get_queryset().filter(last_activity__lt=threshold)
        inactive_lobbies.delete()

class Lobby(models.Model):

    class LobbyType(models.TextChoices):
        ONE_VS_ONE = "OVO", _("One vs. One")
        TOURNAMENT = "TRN", _("Tournament")

        __empty__ = _("Unknown Lobby Type")

    class LobbyStatus(models.IntegerChoices):
        WAITING_PLR = 1, _("Waiting for Players") # Not used
        WAITING_RDY = 2, _("Waiting for Players to be Ready")
        GAME_ACTIVE = 3, _("Game started")
        GAME_COMPLETE = 4, _("Game has ended")

        __empty__ = _("Unknown Lobby Status")

    title = models.CharField(max_length=25, default=_("Game"))
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    last_status = models.DateTimeField(default=timezone.now)
    mode = models.CharField(max_length=3, choices=LobbyType, default=LobbyType.ONE_VS_ONE)
    status = models.IntegerField(choices=LobbyStatus, default=LobbyStatus.WAITING_RDY)

    objects = LobbyManager()

    def __str__(self):
        return self.title

    def player_count(self):
        return self.lobbyuser_set.count()

    def max_players(self):
        return 4 if self.mode == self.LobbyType.TOURNAMENT else 2

    def is_active(self):
        threshold = timezone.now() - inactivity_threshold

        if self.last_activity < threshold:
            return False
        return True

    def is_all_ready(self):
        ready_plr_count = self.lobbyuser_set.filter(is_ready=True).count()

        if ready_plr_count == self.max_players():
            return True
        return False

    def set_status(self, status : LobbyStatus):
        self.status = status
        self.last_status = timezone.now()
        self.save() # Remove if unnecessary

class LobbyUser(models.Model):
    username = models.CharField(_('username'), max_length=25, primary_key=True)
    nickname = models.CharField(_('nickname'), max_length=25, blank=True)
    lobby = models.ForeignKey(Lobby, validators=[max_player_validator], on_delete=models.CASCADE)
    is_ready = models.BooleanField(default=False)
    is_owner = models.BooleanField(default=False) # owner of the lobby
    joined_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0) # current score
    total_score = models.IntegerField(default=0) # cumulative score in tournament
    wins = models.IntegerField(default=0) # number of wins

    def __str__(self):
        return self.username

class GameStatus(models.Model):
    lobby = models.OneToOneField(Lobby, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    player1 = models.ForeignKey(LobbyUser, related_name='player1', on_delete=models.PROTECT)
    player2 = models.ForeignKey(LobbyUser, related_name='player2', on_delete=models.PROTECT)
    player1_pos_x = models.FloatField(default=0.0) # specify default at creation
    player1_pos_y = models.FloatField(default=0.0)
    player2_pos_x = models.FloatField(default=0.0)
    player2_pos_y = models.FloatField(default=0.0)
    ball_pos_x = models.FloatField(default=0.0)
    ball_pos_y = models.FloatField(default=0.0)
    ball_velocity = models.FloatField(default=0.0)

    def is_finished(self):
        threshold = timezone.now() - game_length

        if self.created_at < threshold:
            return True
        return False
        

    # def send_history() make request to user-web to store values, then delete this object, set lobby status to 2
