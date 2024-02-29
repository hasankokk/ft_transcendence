from django.db import models
from django.db.models import UniqueConstraint, CheckConstraint, Q, F
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class UserManager(BaseUserManager):
    
    def create_user(self, username, email, password, **extra_fields):

        if not username:
            raise ValueError(_('You must provide a username'))
        if not email:
            raise ValueError(_('You must provide an email address'))

        username = AbstractBaseUser.normalize_username(username)
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        # If password is None, then runs self.set_unusable_password
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, username, email, password, **extra_fields):

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') != True:
            raise ValueError(_('Superuser must be assigned to is_staff=True'))
        if extra_fields.get('is_superuser') != True:
            raise ValueError(_('Superuser must be assigned to is_superuser=True'))
        
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(_('username'), max_length=25, unique=True)
    email = models.EmailField(_('email address'), unique=True)
    image = models.ImageField(_('user image'), upload_to="image/user", blank=True,
                              default="image/default/user.png")
    is_42authenticated = models.BooleanField(_('is user authenticated by 42'), default=False)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = UserManager()

    def __str__(self):
        return self.username

class UserRelationship(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=["user1", "user2"], name="index_constraint"),
            CheckConstraint(check=Q(user2__gt=F('user1')), name="user2__gt_user1"),
        ]

    class RelationshipType(models.TextChoices):
        PENDING12 = "P12", _("User1 sent friend request to User2")
        PENDING21 = "P21", _("User2 sent friend request to User1")
        FRIENDS = "FRN", _("User1 and User2 are friends")
        BLOCK12 = "B12", _("User1 blocked User2")
        BLOCK21 = "B21", _("User2 blocked User1")
        BLOCKS = "BLK", _("User1 and User2 blocked each other")

        __empty__ = _("Unknown")

    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name="userRelationship_user1")
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name="userRelationship_user2")
    type = models.CharField(max_length=3, choices=RelationshipType,
                            default=RelationshipType.PENDING12)

    def __str__(self):
        return str(self.user1) + " & " + str(self.user2)

    def is_pending_user1(self):
        return self.type == self.RelationshipType.PENDING12
    def is_pending_user2(self):
        return self.type == self.RelationshipType.PENDING21
    def is_friends(self):
        return self.type == self.RelationshipType.FRIENDS
    def is_blocking_user1(self):
        return self.type == self.RelationshipType.BLOCK12
    def is_blocking_user2(self):
        return self.type == self.RelationshipType.BLOCK21
    def is_blocking_mutual(self):
        return self.type == self.RelationshipType.BLOCKS
