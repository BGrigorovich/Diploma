from django.test import TestCase

from Diploma.settings import GOLD_CORPUS_DIR
from .corpus import smooth_corpus, ProbabilityCorpus, BaseCorpus, GoldCorpusFileHandler


class SmoothingTestCase(TestCase):
    def setUp(self):
        self.corpus_probabilities = smooth_corpus('a a a a a a a a a a b b b c c d e f')

    # yup, zero count prob is negative for this particular corpus
    def test_zero_prob(self):
        self.assertAlmostEqual(self.corpus_probabilities['zero_count_prob'], -0.11111111111111)

    def test_token_prob(self):
        self.assertAlmostEqual(self.corpus_probabilities['tokens_prob']['a'], 0.61111111111111)


class BaseCorpusTestCase(TestCase):
    def setUp(self):
        self.corpus = BaseCorpus('Порошенко, Порошенко, бігти, біжить, або, та')

    def test_tokenize(self):
        actual_tokens = self.corpus.tokenize().tokens
        expected_tokens = ['порошенко', 'порошенко', 'бігти', 'біжить', 'або', 'та']
        self.assertEqual(actual_tokens, expected_tokens)

    def test_remove_stopwords(self):
        actual_tokens = self.corpus.tokenize().remove_stopwords().tokens
        expected_tokens = ['порошенко', 'порошенко', 'бігти', 'біжить']
        self.assertEqual(actual_tokens, expected_tokens)

    def test_lemmatize_tokens(self):
        actual_tokens = self.corpus.tokenize().remove_stopwords().lemmatize().tokens
        expected_tokens = ['порошенко', 'порошенко', 'бігти', 'бігти']
        self.assertEqual(actual_tokens, expected_tokens)


class ProbabilityCorpusTestCase(TestCase):
    def setUp(self):
        self.corpus = ProbabilityCorpus('Порошенко, Порошенко, бігти, біжить, або, та')
        self.corpus.tokenize().remove_stopwords().lemmatize()

    def test_calc_tokens_count(self):
        actual_tokens_count = self.corpus.calc_tokens_count().tokens_count
        expected_tokens_count = {'порошенко': 2, 'бігти': 2}
        self.assertEqual(actual_tokens_count, expected_tokens_count)

    def test_calc_tokens_prob(self):
        actual_tokens_prob = self.corpus.calc_tokens_count().calc_tokens_prob().tokens_prob
        expected_tokens_prob = {'порошенко': 0.5, 'бігти': 0.5}
        self.assertEqual(actual_tokens_prob, expected_tokens_prob)

    def test_prob_difference(self):
        actual_prob_difference = self.corpus.calc_prob_difference()
        expected_prob_difference = {'порошенко': 0.45781046262238456, 'бігти': 0.4998421953328491}
        self.assertAlmostEqual(actual_prob_difference, expected_prob_difference)

    def test_get_top_trends(self):
        actual_top_trends = self.corpus.get_top_trends(trends_count=2)
        expected_top_trends = [('бігти', 0.4998421953328491), ('порошенко', 0.45781046262238456)]
        self.assertAlmostEqual(actual_top_trends, expected_top_trends)


class GoldCorpusFileHandlerTestCase(TestCase):
    def setUp(self):
        self.gold_corpus = GoldCorpusFileHandler(GOLD_CORPUS_DIR + 'ukr_prob.json')

    def test_token_prob(self):
        actual_token_prob = self.gold_corpus.tokens_prob['приземлення']
        expected_token_prob = 3.6385145981014515e-06
        self.assertAlmostEqual(actual_token_prob, expected_token_prob)

    def test_zero_count_prob(self):
        actual_zero_count_prob = self.gold_corpus.zero_count_prob
        expected_zero_count_prob = 0.08437907475523088
        self.assertAlmostEqual(actual_zero_count_prob, expected_zero_count_prob)
