from collections import namedtuple
from contextlib import suppress

import feedparser
import requests
from annoying.functions import get_object_or_None
from bs4 import BeautifulSoup
from celery import shared_task
from dateutil.parser import parse as parse_time

from .models import Article, Site

Item = namedtuple('Item', ['title', 'link', 'published'])


def get_article_from_html(link, article_class_name):
    response = requests.get(link)
    if response.status_code == requests.codes.ok:
        soup = BeautifulSoup(response.content, 'lxml')
        return soup.find('div', class_=article_class_name).get_text()


def parse_rss(site):
    rss_feed = feedparser.parse(site.rss_link)
    new_articles = [Item(item['title'], item['link'], item['published']) for item in rss_feed['items']]
    for article in new_articles:
        if not get_object_or_None(Article, link=article.link):
            with suppress(AttributeError):
                published = parse_time(article.published).date()
                article_text = get_article_from_html(article.link, site.article_class_name)
                Article(title=article.title, published=published, link=article.link,
                        text=article_text, site=site).save()
        else:
            break


@shared_task
def parse_all():
    sites_to_parse = Site.objects.filter(parse=True)
    for site in sites_to_parse:
        parse_rss(site)
