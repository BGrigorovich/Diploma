from django.db import models
from django.core.files.storage import FileSystemStorage
from Diploma.settings import MEDIA_ROOT

corpus_storage = FileSystemStorage(MEDIA_ROOT)


def upload_to(instance, filename):
    return 'files/{}'.format(filename)


class CorpusFile(models.Model):
    corpus_file = models.FileField(storage=corpus_storage)
