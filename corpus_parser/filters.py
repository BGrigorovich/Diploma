import rest_framework_filters as filters
from .models import Article, Site


class SiteFilter(filters.FilterSet):
    class Meta:
        model = Site
        fields = ['name', 'parse']


class ArticleFilter(filters.FilterSet):
    text = filters.AllLookupsFilter(name='text')
    published = filters.DateFilter(name='published')
    site = filters.RelatedFilter(SiteFilter, name='site')

    class Meta:
        model = Article
        fields = ['published', 'site', 'text']
