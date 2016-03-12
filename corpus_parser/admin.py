from django.contrib import admin
from .models import Site, SiteAdmin, Article, ArticleAdmin, DailyTrend

admin.site.register(Site, SiteAdmin)
admin.site.register(Article, ArticleAdmin)
admin.site.register(DailyTrend)
