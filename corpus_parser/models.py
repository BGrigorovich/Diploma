import datetime
from django.contrib import admin
from django.db import models
from django.contrib.postgres.fields import JSONField


class Site(models.Model):
    name = models.CharField(max_length=50, unique=True)
    rss_link = models.CharField(max_length=100, unique=True)
    article_class_name_or_id = models.CharField(max_length=25, null=True, blank=True)
    stop_phrase = models.CharField(max_length=50, null=True, blank=True)
    parse = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class SiteAdmin(admin.ModelAdmin):
    list_display = ('name', 'parse')
    list_filter = ('parse',)


class Article(models.Model):
    title = models.CharField(max_length=200)
    published = models.DateField()
    link = models.CharField(max_length=350, db_index=True)
    text = models.TextField()
    site = models.ForeignKey(Site, blank=True, null=True, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.link


class ArticleAdmin(admin.ModelAdmin):
    list_display = ('site', 'published', 'title')
    list_filter = ('site', 'published')


class DailyTrend(models.Model):
    date = models.DateField(default=datetime.date.today() - datetime.timedelta(1))
    site = models.ForeignKey(Site, null=True, blank=True)
    trends = JSONField()
    counts = JSONField()

    def __str__(self):
        return '{0}, {1}'.format(self.date.strftime('%d %b %Y'), self.site)

    class Meta:
        unique_together = ('date', 'site',)


class DailyTrendAdmin(admin.ModelAdmin):
    list_display = ('date', 'site')


class Word(models.Model):
    word = models.CharField(max_length=25, unique=True)

    def __str__(self):
        return self.word


class WordCount(models.Model):
    word = models.ForeignKey(Word)
    site = models.ForeignKey(Site, null=True, blank=True)
    date = models.DateField(default=datetime.date.today() - datetime.timedelta(1))
    count = models.IntegerField()

    def __str__(self):
        return '{0} ({1}, {2}): {3}'.format(self.word, self.date.strftime('%d %b %Y'), self.site, self.count)

    class Meta:
        unique_together = ('word', 'site', 'date',)


class WordCountAdmin(admin.ModelAdmin):
    list_display = ('word', 'date', 'site', 'count')
