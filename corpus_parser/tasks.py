import datetime

from celery import shared_task
from utils.corpus import ProbabilityCorpus
from .models import Site, Article, DailyTrend
from .parser import parse_rss


@shared_task
def parse_all():
    sites_to_parse = Site.objects.filter(parse=True)
    for site in sites_to_parse:
        parse_rss(site)


@shared_task
def calculate_daily_trends(trends_count):
    daily_articles = Article.objects.filter(published=datetime.date.today() - datetime.timedelta(1))
    texts = ' '.join([article.text for article in daily_articles])

    corpus = ProbabilityCorpus(texts)
    DailyTrend(trends=corpus.get_top_trends(trends_count)).save()
