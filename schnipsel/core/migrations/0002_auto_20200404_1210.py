# Generated by Django 2.2.10 on 2020-04-04 12:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(model_name="user", name="first_name",),
        migrations.RemoveField(model_name="user", name="last_name",),
        migrations.RemoveField(model_name="user", name="username",),
        migrations.AlterField(
            model_name="boardmembership",
            name="board",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="memberships",
                to="core.Board",
            ),
        ),
        migrations.AlterField(
            model_name="user",
            name="email",
            field=models.EmailField(
                error_messages={
                    "unique": "A user with that email address already exists."
                },
                max_length=254,
                unique=True,
                verbose_name="email address",
            ),
        ),
    ]
