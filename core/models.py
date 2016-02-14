from django.db import models

from .storages import corpus_storage, trends_storage


class CorpusFile(models.Model):
    # todo: restrict file types
    corpus_file = models.FileField(storage=corpus_storage)
    trends_file = models.FileField(storage=trends_storage)

    # def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
    #     super(CorpusFile, self).save()
    #     trends = calc_trends(MEDIA_ROOT + 'corpus/' + str(self.corpus_file))[:50]
    #     print(self.corpus_file.name)
    #     print(trends_storage.get_available_name(self.corpus_file.name))
    #     self.trends_file = trends_storage.get_available_name(self.corpus_file.name)
