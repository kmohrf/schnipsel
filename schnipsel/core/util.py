def get_email_localpart(email_address):
    local_part, _ = email_address.rsplit("@")
    return local_part


def format_email_to_username_openldap(data):
    from django_python3_ldap.utils import format_username_openldap as _format

    data["username"] = get_email_localpart(data.pop("email"))
    return _format(data)
