import datetime
from contextlib import suppress

from celery import shared_task
from django.core.exceptions import MultipleObjectsReturned
from django.db import IntegrityError, DataError
from nltk.util import breadth_first
from requests.exceptions import TooManyRedirects

from Diploma.settings import MIN_WORD_COUNT_TOTAL, MIN_WORD_COUNT_FOR_SITE
from utils.corpus import ProbabilityCorpus
from .models import Site, Article, DailyTrend, Word, WordCount
from .parser import parse_rss


@shared_task
def parse_all():
    sites_to_parse = Site.objects.filter(parse=True)
    for site in sites_to_parse:
        with suppress(BaseException):
            parse_rss(site)


@shared_task
def write_words_count(corpus, site, date):
    min_count = MIN_WORD_COUNT_FOR_SITE if site else MIN_WORD_COUNT_TOTAL

    for word, count in corpus.tokens_count.most_common():
        if count < min_count:
            break

        try:
            _word = Word.objects.get(word=word)
        except Word.DoesNotExist:
            _word = Word(word=word)
            _word.save()
        WordCount(word=_word, site=site, date=date, count=count).save()


@shared_task
def calculate_trends_for_site(trends_count, site, published):
    with suppress(BaseException):
        if site:
            daily_articles = Article.objects.filter(published=published, site=site)
        else:
            daily_articles = Article.objects.filter(published=published)

        texts = ' '.join([article.text for article in daily_articles])
        corpus = ProbabilityCorpus(texts)
        corpus.calc_prob_difference()
        DailyTrend(trends=dict(corpus.get_top_trends(trends_count)),
                   counts=dict(corpus.get_top_counts(trends_count)),
                   site=site, date=published).save()
    
        write_words_count(corpus, site, published)


@shared_task
def calculate_daily_trends(trends_count):
    yesterday = datetime.date.today() - datetime.timedelta(1)
    for site in Site.objects.filter(parse=True):
            calculate_trends_for_site(trends_count, site, yesterday)
    calculate_trends_for_site(trends_count, None, yesterday)
