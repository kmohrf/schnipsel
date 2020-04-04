from django_python3_ldap.auth import LDAPBackend

from .util import get_email_localpart


def format_username_openldap(data):
    from django_python3_ldap.utils import format_username_openldap as _format

    data["username"] = get_email_localpart(data.pop("email"))
    return _format(data)


def clean_user_data(model_fields):
    from django_python3_ldap.utils import clean_user_data as _clean_data

    model_fields = _clean_data(model_fields)
    model_fields.pop("username", None)
    model_fields["source"] = "ldap"
    return model_fields


class UsernameRewriteLDAPBackend(LDAPBackend):
    def authenticate(self, *args, **kwargs):
        kwargs["email"] = kwargs.pop("username")
        return super().authenticate(*args, **kwargs)
