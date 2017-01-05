from django.conf.urls import url
from .views import test_trends, test_parse, ArticleListView, SiteListView, daily_trends_view, WordCountListView

urlpatterns = [
    url(r'^trends/(?P<date>\d{4}-\d{1,2}-\d{1,2})/(?P<site_id>\d*)$', daily_trends_view),
    url(r'^word-counts/(?P<word>.+)/(?P<site_id>\d*)$', WordCountListView.as_view()),
    url(r'^test-parse/$', test_parse),
    url(r'^test-trends/$', test_trends),
    url(r'^sites', SiteListView.as_view()),
    url(r'^articles', ArticleListView.as_view()),
]
