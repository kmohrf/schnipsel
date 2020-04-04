from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from . import models


class BoardMembershipInlineAdmin(admin.TabularInline):
    fields = (
        "user",
        "is_owner",
        "can_modify",
    )
    model = models.BoardMembership


class NoteInlineAdmin(admin.TabularInline):
    fields = (
        "title",
        "content",
        "color",
    )
    model = models.Note


@admin.register(models.Board)
class BoardAdmin(admin.ModelAdmin):
    fields = (
        "title",
        "language",
        "description",
        "is_private",
    )
    inlines = (
        BoardMembershipInlineAdmin,
        NoteInlineAdmin,
    )


@admin.register(models.User)
class UserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = ("email", "name", "is_staff")
    search_fields = ("name", "email")
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("name", "language", "avatar")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
