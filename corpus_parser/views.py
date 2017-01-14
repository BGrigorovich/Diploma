import json
import datetime

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics

from .tasks import parse_all, calculate_daily_trends
from .models import Article, Site, DailyTrend, Word, WordCount
from .serializers import ArticleSerializer, SiteSerializer, WordCountSerializer
from .filters import ArticleFilter


def test_parse(request):
    parse_all()
    return HttpResponse('Testing parse')


def test_trends(request):
    calculate_daily_trends(50)
    return HttpResponse('Testing trends')


def daily_trends_view(request, date, site_id):
    if site_id:
        site = Site.objects.get(id=site_id)
        trend = get_object_or_404(DailyTrend, date=date, site=site).trends
    else:
        trend = get_object_or_404(DailyTrend, date=date, site=None).trends
    response = HttpResponse(json.dumps(trend, ensure_ascii=False),
                            content_type='application/json; charset=utf-8')
    response['Access-Control-Allow-Origin'] = '*'
    return response


class WordCountListView(generics.ListAPIView):
    serializer_class = WordCountSerializer

    def get_queryset(self):
        word = Word.objects.get(word=self.kwargs['word'])
        date_from = datetime.datetime.strptime(self.request.GET.get('date-from'), '%Y-%m-%d').date()
        date_to = datetime.datetime.strptime(self.request.GET.get('date-to'), '%Y-%m-%d').date()
        site = Site.objects.get(id=self.kwargs['site_id']) if self.kwargs['site_id'] else None
        return WordCount.objects.filter(word=word, site=site, date__gte=date_from, date__lte=date_to).order_by('date')


class ArticleListView(generics.ListAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    filter_class = ArticleFilter


class SiteListView(generics.ListAPIView):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    filter_fields = ('id', 'name', 'parse')
