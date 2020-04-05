import base64
import hashlib
import re

from django.core.files.base import ContentFile
from rest_framework import serializers
import reversion
from reversion.models import Version

from schnipsel.core import models


def parse_base64_data_uri(uri):
    header, data = uri.split(",", 1)
    match = re.match(r"data:(?P<mime>.+/.+);base64", header)
    return match.group("mime"), base64.b64decode(data)


class HyperlinkedIdentityFileField(serializers.HyperlinkedIdentityField):
    def __init__(self, view_name=None, **kwargs):
        read_only = kwargs.pop("read_only", False)
        source = kwargs.pop("source", None)
        super().__init__(view_name, **kwargs)
        self.read_only = read_only
        self.source = source or self.field_name

    def to_representation(self, value):
        url = super().to_representation(value.instance)
        try:
            url_hash = hashlib.md5(value.url.encode()).hexdigest()
            return f"{url}?{url_hash}"
        except ValueError:
            return url

    def to_internal_value(self, data):
        if not data or not data.startswith("data:"):
            raise serializers.SkipField()
        mime_type, file_data = parse_base64_data_uri(data)
        file_format = mime_type.split("/")[1]
        filename = f"{self.field_name}-avatar.{file_format}"
        return ContentFile(file_data, name=filename)


class DefaultUserMeta:
    model = models.User
    fields = (
        "avatar",
        "label",
        "url",
    )


class UserSerializer(serializers.HyperlinkedModelSerializer):
    avatar = HyperlinkedIdentityFileField("user-avatar")
    label = serializers.CharField(source="__str__", read_only=True)

    class Meta(DefaultUserMeta):
        pass


class UserDetailSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=False)

    def create(self, validated_data):
        user = models.User.objects.create(email=validated_data["email"])
        user.set_password(validated_data["password"])
        user.save()
        return user

    def update(self, user, validated_data):
        password = validated_data.pop("password", None)
        if password:
            user.set_password(password)
        return super().update(user, validated_data)

    class Meta(DefaultUserMeta):
        fields = DefaultUserMeta.fields + (
            "email",
            "language",
            "name",
            "password",
            "pk",
            "source",
        )


class UserCreateSerializer(UserDetailSerializer):
    password = serializers.CharField(write_only=True, required=True)


class UserUpdateSerializer(UserDetailSerializer):
    password = serializers.CharField(write_only=True, required=False)


class BoardMembershipSerializer(serializers.ModelSerializer):
    user = serializers.HyperlinkedRelatedField(
        "user-detail", queryset=models.User.objects
    )

    class Meta:
        model = models.BoardMembership
        fields = ("user", "can_modify", "is_owner")


class BoardSerializer(serializers.HyperlinkedModelSerializer):
    pk = serializers.ReadOnlyField()
    memberships = BoardMembershipSerializer(many=True)

    def _save_memberships(self, board, memberships):
        if memberships:
            for membership in memberships:
                models.BoardMembership.objects.update_or_create(
                    board=board, **membership
                )
            users_with_membership = [membership["user"] for membership in memberships]
            models.BoardMembership.objects.filter(board=board).exclude(
                user__in=users_with_membership
            ).delete()
        return board

    def create(self, validated_data):
        memberships = validated_data.pop("memberships", None)
        return self._save_memberships(super().create(validated_data), memberships)

    def update(self, instance, validated_data):
        memberships = validated_data.pop("memberships", None)
        return self._save_memberships(
            super().update(instance, validated_data), memberships
        )

    class Meta:
        model = models.Board
        fields = (
            "pk",
            "created_at",
            "description",
            "is_private",
            "language",
            "memberships",
            "title",
            "url",
        )


class NoteSerializer(serializers.HyperlinkedModelSerializer):
    pk = serializers.ReadOnlyField()
    updated_at = serializers.SerializerMethodField("_get_updated_at")

    def _get_updated_at(self, obj: models.Note):
        versions = Version.objects.get_for_object(obj)
        return versions[0].revision.date_created if versions else None

    def create(self, validated_data):
        with reversion.create_revision():
            note = super().create(validated_data)
            reversion.set_user(self.context["request"].user)
            return note

    def update(self, instance, validated_data):
        with reversion.create_revision():
            note = super().update(instance, validated_data)
            reversion.set_user(self.context["request"].user)
            return note

    class Meta:
        model = models.Note
        fields = (
            "pk",
            "title",
            "content",
            "created_at",
            "updated_at",
            "color",
            "url",
            "board",
        )
