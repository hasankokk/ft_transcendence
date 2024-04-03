from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db.models import UniqueConstraint
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

def max_player_validator(game_id):
    game = GameHistory.objects.get(pk=game_id)

    if game.player_count() >= game.max_players():
        raise ValidationError(_("Game #%(id)s is already full with maximum number of %(max)s players"),
                              params={"id": game_id, "max": game.max_players()})

class GameHistoryManager(models.Manager):
    def get_user_history(self, user_id, last=10):
        records = GameHistoryUser.objects.filter(user=user_id).order_by("-game__date")
        count = records.count()

        if last > count:
            records = records[0:count]
        else:
            records = records[0:last]

        return GameHistory.objects.filter(pk__in=records.values("game"))

    def get_user_best(self, user_id, last=3):
        records = GameHistoryUser.objects.filter(user=user_id).order_by("-wins", "-total_score")
        count = records.count()
        
        if last > count:
            records = records[0:count]
        else:
            records = records[0:last]

        return GameHistory.objects.filter(pk__in=records.values("game"))

    def get_ranking(self, last=10):
        records = GameHistoryUser.objects.order_by("-wins", "-total_score")
        count = records.count()

        if last > count:
            records = records[0:count]
        else:
            records = records[0:last]

        return GameHistory.objects.filter(pk__in=records.values("game"))

class GameHistory(models.Model):

    class Meta:
        verbose_name_plural = "game histories"
        ordering = ("-date",)

    class GameType(models.IntegerChoices):
        ONEVONE = 1, _("One vs One")
        TOURNAMENT = 2, _("Tournament")

        __empty__ = _("Unknown Game Type")

    type = models.IntegerField(choices=GameType)

    date = models.DateField()
    length = models.DurationField()

    objects = GameHistoryManager()

    def __str__(self):
        return str(self.pk) + "#" + str(self.type)

    def player_count(self):
        return self.gamehistoryuser_set.count()

    def player_exists(self, user_id):
        return self.gamehistoryuser_set.filter(user=user_id).count() > 0

    def get_player_record(self, user_id):
        try:
            return self.gamehistoryuser_set.get(user=user_id)
        except ObjectDoesNotExist:
            return None

    def max_players(self):
        return 4 if self.type == self.GameType.TOURNAMENT else 2

class GameHistoryUser(models.Model):

    class Meta:
        constraints = [
            UniqueConstraint(fields=["game", "user"], name="history_user_index_constraint"),
        ]
        
        ordering = ("game", "-wins", "-total_score")

    game = models.ForeignKey(GameHistory, validators=[max_player_validator], on_delete=models.CASCADE)
    user = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True)
    total_score = models.IntegerField()
    wins = models.IntegerField()

    def __str__(self):
        return str(get_user_model().objects.get(pk=self.user)) + "@" + str(self.game)
