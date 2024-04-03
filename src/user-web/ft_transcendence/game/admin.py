from django.contrib import admin
from . import models

admin.site.register(models.GameHistory)
admin.site.register(models.GameHistoryUser)
