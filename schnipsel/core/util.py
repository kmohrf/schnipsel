def get_email_localpart(email_address):
    local_part, _ = email_address.rsplit("@")
    return local_part
