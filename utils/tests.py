from django.test import TestCase
from .corpus import smooth_corpus
from Diploma.settings import GOLD_CORPUS_DIR


class SmoothingTestCase(TestCase):
    def setUp(self):
        self.corpus_probabilities = smooth_corpus(GOLD_CORPUS_DIR + 'smoothing_test.txt')

    def test_zero_prob(self):
        self.assertAlmostEqual(self.corpus_probabilities['zero_count_prob'], -0.11111111111111)
        # yup, zero count prob is negative for this particular corpus

    def test_token_prob(self):
        self.assertAlmostEqual(self.corpus_probabilities['tokens_prob']['a'], 0.61111111111111)
