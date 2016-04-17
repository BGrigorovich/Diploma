from django.contrib import admin
from .models import Site, SiteAdmin, Article, ArticleAdmin, DailyTrend, DailyTrendAdmin, Word, WordCount, WordCountAdmin

admin.site.register(Site, SiteAdmin)
admin.site.register(Article, ArticleAdmin)
admin.site.register(DailyTrend, DailyTrendAdmin)
admin.site.register(Word)
admin.site.register(WordCount, WordCountAdmin)
