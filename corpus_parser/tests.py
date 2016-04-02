from unittest.mock import patch
from django.test import TestCase
from bs4 import BeautifulSoup
from .parser import get_article_from_html


# <!DOCTYPE html><html><head></head><body><div id="test_id">This is id</div><div class="test_class">This is class</div></body></html>


# class GetArticleFromHtmlTestCase(TestCase):
#     def setUp(self):
#         self.html = '<!DOCTYPE html><html><head></head><body><div id="test_id">This is id</div><div class="test_class">This is class</div></body></html>'
#
#     def test_get_text_from_class_name(self):
#         with patch('main.requests') as mock_requests:
#             mock_requests.get.return_value = self.html
#
#
#     def text_get_text_from_id(self):
#         pass
