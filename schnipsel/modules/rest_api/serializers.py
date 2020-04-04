from rest_framework import serializers
import reversion
from reversion.models import Version

from schnipsel.core import models
from schnipsel.core.util import get_email_localpart


class DefaultUserMeta:
    model = models.User
    fields = (
        "avatar",
        "label",
        "url",
    )


class UserSerializer(serializers.HyperlinkedModelSerializer):
    avatar = serializers.HyperlinkedIdentityField("user-avatar")
    label = serializers.SerializerMethodField("_get_label")

    def _get_label(self, user):
        return user.name if user.name else get_email_localpart(user.email)

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
