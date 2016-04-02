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
def calculate_trends_for_site(trends_count, site, published):
    if site:
        daily_articles = Article.objects.filter(published=published, site=site)
    else:
        daily_articles = Article.objects.filter(published=published)

    texts = ' '.join([article.text for article in daily_articles])
    corpus = ProbabilityCorpus(texts)
    DailyTrend(trends=dict(corpus.get_top_trends(trends_count)), site=site).save()


@shared_task
def calculate_daily_trends(trends_count):
    # yesterday = datetime.date.today() - datetime.timedelta(1)
    yesterday = datetime.date.today()# - datetime.timedelta(1)
    for site in Site.objects.filter(parse=True):
        calculate_trends_for_site(trends_count, site, yesterday)
    calculate_trends_for_site(trends_count, None, yesterday)
