from django.conf.urls import include, url
from .views import upload_file_view, word_cloud_view, word_count_graph_view

urlpatterns = [
    url(r'^upload-file$', upload_file_view),
    url(r'^chart/$', word_count_graph_view, name='chart'),
    url(r'^$', word_cloud_view, name='word-cloud'),
]
