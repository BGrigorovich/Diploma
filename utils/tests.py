from django.test import TestCase
from redis import StrictRedis
from .corpus import smooth_corpus, ProbabilityCorpus


class SmoothingTestCase(TestCase):
    def setUp(self):
        self.corpus_probabilities = smooth_corpus('a a a a a a a a a a b b b c c d e f')

    # yup, zero count prob is negative for this particular corpus
    def test_zero_prob(self):
        self.assertAlmostEqual(self.corpus_probabilities['zero_count_prob'], -0.11111111111111)

    def test_token_prob(self):
        self.assertAlmostEqual(self.corpus_probabilities['tokens_prob']['a'], 0.61111111111111)


class ProbDifferenceTestCase(TestCase):
    def setUp(self):
        self.corpus = ProbabilityCorpus('Порошенко, Порошенко, бігти, біжить')
        self.prob_difference = self.corpus.calc_prob_difference()

    def test_prob_difference(self):
        self.assertAlmostEqual(self.prob_difference['порошенко'], 0.45781046262238456)
        self.assertAlmostEqual(self.prob_difference['бігти'], 0.4998421953328491)


class LemmatizationTestCase(TestCase):
    def setUp(self):
        self.r = StrictRedis('localhost', port=6379, db=10)

    def test_get_lemma(self):
        self.assertEqual(self.r.get('Аарона').decode(), 'Аарон')
