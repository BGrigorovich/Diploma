from collections import namedtuple
from contextlib import suppress
import feedparser
import requests
from annoying.functions import get_object_or_None
from bs4 import BeautifulSoup
from dateutil.parser import parse as parse_time
from utils.corpus import BaseCorpus
from .models import Article

Item = namedtuple('Item', ['title', 'link', 'published'])


def get_article_from_html(link, article_class_name_or_id, stop_phrase):
    response = requests.get(link)
    if response.status_code == requests.codes.ok:
        soup = BeautifulSoup(response.content, 'lxml')
        try:
            article_text = soup.find('div', {'class': article_class_name_or_id}).get_text()
        except AttributeError:
            article_text = soup.find('div', {'id': article_class_name_or_id}).get_text()
        if stop_phrase:
            return article_text.split(stop_phrase, 1)[0]
        else:
            return article_text


def write_article(article, site):
    published = parse_time(article.published).date()
    article_text = get_article_from_html(article.link, site.article_class_name_or_id, site.stop_phrase)

    # fuck it
    if article_text and 'function' in article_text:
        return

    article_corpus = BaseCorpus(article_text)
    article_corpus.tokenize().lemmatize().remove_stopwords()
    article_text = ' '.join(article_corpus.tokens)

    Article(title=article.title, published=published, link=article.link,
            text=article_text, site=site).save()


def parse_rss(site):
    rss_feed = feedparser.parse(site.rss_link)
    new_articles = [Item(item['title'], item['link'], item['published']) for item in rss_feed['items']]
    for article in new_articles:
        if not get_object_or_None(Article, link=article.link, site=site):
            # todo: log AttributeError
            with suppress(AttributeError):
                write_article(article, site)
        else:
            break
