from django.core.files.storage import FileSystemStorage
from Diploma.settings import MEDIA_ROOT, CORPUS_DIR, TRENDS_DIR


# # todo: file permissions
# class CorpusFileSystemStorage(FileSystemStorage):
#     # todo: remove when file permissions will be added
#     def get_available_name(self, name, max_length=None):
#         new_name = '.'.join(name.split('.')[:-1]) if '.' in name.split('/')[-1] else name
#         return new_name


class TrendsFileSystemStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        return name + '_trends.json'


corpus_storage = FileSystemStorage(CORPUS_DIR)
trends_storage = TrendsFileSystemStorage(TRENDS_DIR)
