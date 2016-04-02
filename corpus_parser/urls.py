from django.conf.urls import url
from rest_framework import routers
from .views import test_trends, test_parse, ArticleListView, SiteListView, daily_trends_view

urlpatterns = [
    url(r'^trends/(?P<date>\d{4}-\d{1,2}-\d{1,2})/(?P<site>.*)$', daily_trends_view),
    url(r'^test-parse/$', test_parse),
    url(r'^test-trends/$', test_trends),
    # url(r'^trends', DailyTrendListView.as_view()),
    url(r'^sites', SiteListView.as_view()),
    url(r'^articles', ArticleListView.as_view()),
]

# router = routers.SimpleRouter()
# router.register(r'articles', ArticleListView.as_view())
# urlpatterns += router.urls
