import time
from collections import namedtuple
from contextlib import suppress
import feedparser
import requests
from dateutil.parser import parse as parse_time
from annoying.functions import get_object_or_None
from bs4 import BeautifulSoup
from corpus_parser.models import Site, Article


# todo: delete
class LastCheckTime:
    __format = '%a, %d %b %Y %H:%M:%S'

    def __init__(self, filename):
        self.file = filename

    def get(self):
        try:
            with open(self.file) as f:
                return time.strptime(f.read(), self.__format)
        except (EnvironmentError, ValueError):
            # this day noon
            noon_format = self.__format[:12]
            return time.strptime(time.strftime(noon_format), noon_format)

    def set(self):
        with open(self.file, 'w+') as f:
            f.write(time.strftime(self.__format, time.gmtime()))


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


def parse_all():
    sites = Site.objects.all()
    for site in sites:
        parse_rss(site)
