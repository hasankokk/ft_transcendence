from django.db import models
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
                              default="image/default/user_image.jpg")
    is_42authenticated = models.BooleanField(_('is user authenticated by 42'), default=False)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = UserManager()

    def __str__(self):
        return self.username

class Friends(models.Model):
    class Meta:
        verbose_name_plural = "friends list"

    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name="friends_user1")
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name="friends_user2")
