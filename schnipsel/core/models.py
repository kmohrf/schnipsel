import random
import string

from django.contrib.auth.models import AbstractUser, UnicodeUsernameValidator
from django.core import validators
from django.db import models
from django.utils.translation import gettext_lazy as _
import reversion

SUPPORTED_BOARD_LANGUAGES = (
    ("ar", "العربية"),
    ("de", "Deutsch"),
    ("dk", "Dansk"),
    ("en", "English"),
    ("es", "Español"),
    ("fi", "Suomi"),
    ("fr", "Français"),
    ("hu", "Magyar"),
    ("it", "Italiano"),
    ("jp", "日本語"),
    ("nl", "Nederlands"),
    ("no", "Norsk"),
    ("pt", "Português"),
    ("ro", "Limba Română"),
    ("ru", "Русский язык"),
    ("se", "Svenska"),
    ("th", "ภาษาไทย"),
    ("tr", "Türkçe"),
    ("vi", "Tiếng Việt"),
)

SUPPORTED_UI_LANGAUGES = (("en", "English"),)


def _create_random_token(length, alphabet=string.ascii_letters + string.digits):
    return "".join(random.choice(alphabet) for _ in range(length))


class NotThatUsernameValidator(validators.BaseValidator):
    message = _('Username cannot be "%(limit_value)s".')
    code = "not_that_username"

    def compare(self, a, b):
        return a == b


class User(AbstractUser):
    username = models.CharField(
        _("username"),
        max_length=150,
        unique=True,
        help_text=_(
            "Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
        ),
        validators=[UnicodeUsernameValidator, NotThatUsernameValidator("me")],
        error_messages={"unique": _("A user with that username already exists."),},
    )
    name = models.CharField(max_length=150, null=True, blank=True)
    avatar = models.ImageField(null=True, blank=True)
    language = models.CharField(
        max_length=2, default="en", choices=SUPPORTED_UI_LANGAUGES
    )


class Board(models.Model):
    token = models.CharField(max_length=40, primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    language = models.CharField(
        max_length=2, choices=SUPPORTED_BOARD_LANGUAGES, default="en"
    )
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.token:
            self.token = _create_random_token(40)

    def __str__(self):
        return self.title


@reversion.register()
class Note(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="notes")
    title = models.TextField()
    content = models.TextField(null=True, blank=True)
    color = models.CharField(max_length=30, default="whitesmoke")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class BoardMembership(models.Model):
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="+")
    can_modify = models.BooleanField(default=True)
    is_owner = models.BooleanField(default=False)
    member_since = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        member_state = "an owner" if self.is_owner else "a member"
        return (
            f"{self.user} is {member_state} of {self.board} since {self.member_since}"
        )
