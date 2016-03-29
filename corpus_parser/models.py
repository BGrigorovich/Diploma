import datetime
from django.contrib import admin
from django.db import models


class Site(models.Model):
    name = models.CharField(max_length=50)
    rss_link = models.CharField(max_length=100)
    article_class_name_or_id = models.CharField(max_length=25, null=True, blank=True)
    parse = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class SiteAdmin(admin.ModelAdmin):
    list_display = ('name', 'parse')
    list_filter = ('parse',)


class Article(models.Model):
    title = models.CharField(max_length=200)
    published = models.DateField()
    link = models.CharField(max_length=150, db_index=True)
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
    trends = models.TextField()

    def __str__(self):
        return self.date.strftime('%a, %d %b %Y')


class DailyTrendAdmin(admin.ModelAdmin):
    list_display = ('date', 'site')
