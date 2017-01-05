from django.conf.urls import include, url
from .views import word_cloud_view, word_count_graph_view

urlpatterns = [
    url(r'^chart/$', word_count_graph_view, name='chart'),
    url(r'^$', word_cloud_view, name='word-cloud'),
]
