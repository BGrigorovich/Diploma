from __future__ import absolute_import

import os

from celery import Celery
from django.conf import settings

app = Celery('Diploma', broker='redis://localhost:5673/0')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Diploma.settings')


app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS, force=True)
