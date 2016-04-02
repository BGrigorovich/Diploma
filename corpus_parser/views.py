import json
import re
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics
from .tasks import parse_all, calculate_daily_trends
from .models import Article, Site, DailyTrend
from .serializers import ArticleSerializer, SiteSerializer
from .filters import ArticleFilter


def test_parse(request):
    parse_all()
    return HttpResponse('Testing parse')


def test_trends(request):
    calculate_daily_trends(50)
    return HttpResponse('Testing trends')


# works by site id or name
# todo: add site info to response (?)
def daily_trends_view(request, date, site):
    if site:
        if not re.match(r'^\d+$', site):
            site = Site.objects.get(name=site)
        trend = get_object_or_404(DailyTrend, date=date, site=site).trends
    else:
        trend = get_object_or_404(DailyTrend, date=date, site=None).trends
    response = HttpResponse(json.dumps(dict(eval(trend)), ensure_ascii=False),
                            content_type='application/json; charset=utf-8')
    response['Access-Control-Allow-Origin'] = '*'
    return response


class ArticleListView(generics.ListAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    filter_class = ArticleFilter


class SiteListView(generics.ListAPIView):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    filter_fields = ('id', 'name', 'parse')

# class DailyTrendListView(generics.ListAPIView):
#     queryset = DailyTrend.objects.all()
#     serializer_class = DailyTrendSerializer
#     filter_fields = ('date', 'site',)
