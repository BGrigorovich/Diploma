from django.conf.urls import include, url
from .views import upload_file

urlpatterns = [
    url(r'^', upload_file),
]
