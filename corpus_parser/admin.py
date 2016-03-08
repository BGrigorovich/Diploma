from django.contrib import admin
from .models import Site, Article, ArticleAdmin

admin.site.register(Site)
admin.site.register(Article, ArticleAdmin)
