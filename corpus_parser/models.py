from django.db import models
from django.contrib import admin


class Site(models.Model):
    name = models.CharField(max_length=50)
    rss_link = models.CharField(max_length=100)
    article_class_name = models.CharField(max_length=25)

    def __str__(self):
        return self.name


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
