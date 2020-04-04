import hashlib

from django.contrib.auth import logout
from django.db.models import Exists, OuterRef, Q
from django.http.response import HttpResponseRedirect, HttpResponseRedirectBase
from django.urls import reverse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from schnipsel.core import models
from . import permissions as my_permissions, serializers


def _choices_to_dicts(choices, key_name="key", value_name="value"):
    return [{key_name: key, value_name: value} for key, value in choices]


class HttpTemporaryRedirect(HttpResponseRedirectBase):
    status_code = 307


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [my_permissions.UserPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["email"]

    def get_queryset(self):
        if self.action == "list":
            request_keys = set(self.request.query_params.keys())
            # we don’t want to provide a list of users
            # in case no filter params have been provided
            if not request_keys.intersection(self.filterset_fields):
                return models.User.objects.none()
        return models.User.objects.all().order_by("-date_joined")

    def get_serializer_class(self):
        if self.action == "retrieve":
            user = self.get_object()
            if user.id == self.request.user.id:
                return serializers.UserDetailSerializer
            else:
                return serializers.UserSerializer
        elif self.action == "create":
            return serializers.UserCreateSerializer
        elif self.action == "update":
            return serializers.UserUpdateSerializer
        else:
            return serializers.UserSerializer

    @action(detail=False, methods=["GET"])
    def me(self, request):
        return Response(
            serializers.UserDetailSerializer(
                instance=request.user, context={"request": request}
            ).data
        )

    @action(detail=True, methods=["GET"], permission_classes=[permissions.AllowAny])
    @action(detail=False, methods=["GET"], permission_classes=[permissions.AllowAny])
    def login(self, request):
        if self.request.user.is_authenticated:
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(
                {"login_endpoint": reverse("login")}, status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=False, methods=["POST"], permission_classes=[permissions.AllowAny])
    def logout(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

    def avatar(self, request, pk=None):
        user = self.get_object()
        if user.avatar:
            return HttpResponseRedirect(
                request.build_absolute_uri(user.avatar_thumbnail.url)
            )
        token = hashlib.md5(f"schnipsel-${user.email}".encode()).hexdigest()
        return HttpTemporaryRedirect(f"https://api.adorable.io/avatars/128/{token}.png")


class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.BoardSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        my_permissions.IsBoardOwner,
    ]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_private"]

    def get_queryset(self):
        user = self.request.user
        qs = models.Board.objects.order_by("title")
        if not user.is_anonymous:
            has_membership = Exists(
                models.BoardMembership.objects.filter(board=OuterRef("pk"), user=user)
            )
            return qs.annotate(has_membership=has_membership).filter(
                Q(is_private=False) | Q(has_membership=True)
            )
        else:
            return qs.filter(is_private=False)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.NoteSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        my_permissions.CanModifyNotes,
    ]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["board"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_anonymous:
            has_board_membership = Exists(
                models.BoardMembership.objects.filter(
                    board=OuterRef("board__pk"), user=user
                )
            )
            return models.Note.objects.annotate(
                has_board_membership=has_board_membership
            ).filter(Q(board__is_private=False) | Q(has_board_membership=True))
        else:
            return models.Note.objects.filter(board__is_private=False)


class SettingsViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        return Response(
            {
                "board_language_choices": _choices_to_dicts(
                    models.SUPPORTED_BOARD_LANGUAGES,
                    key_name="code",
                    value_name="name",
                ),
                "ui_language_choices": _choices_to_dicts(
                    models.SUPPORTED_UI_LANGAUGES, key_name="code", value_name="name",
                ),
            }
        )
