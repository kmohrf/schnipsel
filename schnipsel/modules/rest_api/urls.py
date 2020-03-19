from rest_framework import routers

from . import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"users", views.UserViewSet)
router.register(r"boards", views.BoardViewSet, basename="board")
router.register(r"notes", views.NoteViewSet, basename="note")
router.register(r"settings", views.SettingsViewSet, basename="settings")
