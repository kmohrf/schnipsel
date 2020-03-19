from rest_framework import permissions

from schnipsel.core import models


class IsBoardOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        try:
            models.BoardMembership.objects.get(
                board=obj, user=request.user, is_owner=True
            )
        except models.BoardMembership.DoesNotExist:
            return False
        else:
            return True


class CanModifyNotes(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        try:
            models.BoardMembership.objects.get(
                board=obj.board, user=request.user, can_modify=True
            )
        except models.BoardMembership.DoesNotExist:
            return False
        else:
            return True


class UserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == "create":
            return request.user.is_anonymous
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if view.action == "create":
            return True
        if view.action == "retrieve":
            return True
        return request.user.id == obj.id
