from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

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
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Data", {"fields": ("name", "language", "avatar",)}),
    )
