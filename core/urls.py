from django.conf.urls import include, url
from .views import upload_file_view, word_cloud_view

urlpatterns = [
    url(r'^upload-file$', upload_file_view),
    url(r'^$', word_cloud_view),
]
