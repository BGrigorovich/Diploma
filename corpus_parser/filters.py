import rest_framework_filters as filters
from .models import Article, Site


class SiteFilter(filters.FilterSet):
    class Meta:
        model = Site
        fields = ['name', 'parse']


# http://127.0.0.1:8000/articles?site__name=24%20%D0%BA%D0%B0%D0%BD%D0%B0%D0%BB
# http://127.0.0.1:8000/articles?text__icontains=%D0%9C%D0%97%D0%A1
class ArticleFilter(filters.FilterSet):
    text = filters.AllLookupsFilter(name='text')
    published = filters.DateFilter(name='published')
    site = filters.RelatedFilter(SiteFilter, name='site')

    class Meta:
        model = Article
        fields = ['published', 'site', 'text']
