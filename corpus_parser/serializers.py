from rest_framework import serializers
from .models import Article, Site, DailyTrend, WordCount


class ArticleSerializer(serializers.ModelSerializer):
    site = serializers.SlugRelatedField(slug_field='name', read_only=True)

    class Meta:
        model = Article
        fields = ('title', 'published', 'link', 'site', 'text')


class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ('name', 'rss_link')


class DailyTrendSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTrend
        fields = ('date', 'site', 'trends')


class WordCountSerializer(serializers.ModelSerializer):
    word = serializers.SlugRelatedField(slug_field='word', read_only=True)
    site = serializers.SlugRelatedField(slug_field='name', read_only=True)

    class Meta:
        model = WordCount
        fields = ('word', 'date', 'site', 'count')
