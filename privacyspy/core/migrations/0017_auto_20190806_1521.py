# Generated by Django 2.2.4 on 2019-08-06 15:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0016_profile_following_products'),
    ]

    operations = [
        migrations.RenameField(
            model_name='profile',
            old_name='following_products',
            new_name='watching_products',
        ),
    ]