# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-02-01 15:51
from __future__ import unicode_literals

import core.storages
import django.core.files.storage
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CorpusFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('corpus_file', models.FileField(storage=django.core.files.storage.FileSystemStorage('/home/bogdan/PycharmProjects/Diploma/files/corpus/'), upload_to='')),
                ('trends_file', models.FileField(storage=core.storages.TrendsFileSystemStorage('/home/bogdan/PycharmProjects/Diploma/files/trends/'), upload_to='')),
            ],
        ),
    ]