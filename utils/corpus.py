# -*- coding: utf-8 -*-
import re
import string
import json
from collections import Counter
from Diploma.settings import GOLD_CORPUS_DIR
from .smoothing import interpolate


class BaseCorpus(object):
    def __init__(self, filename):
        self.filename = filename
        self.tokens = list()
        self.tokens_count = Counter()
        self.tokens_prob = dict()

    def tokenize_text(self):
        with open(self.filename, errors='ignore') as input_file:
            text = input_file.read()
            text = re.sub('–|«|»|\d+', ' ', text)
            tokens = [word.strip(string.punctuation) for word in text.split()]
            # todo: figure out why i have '' token
            tokens = list(filter(''.__ne__, tokens))
            tokens_lower = [token.lower() for token in tokens]
            self.tokens = tokens_lower

    def calc_tokens_count(self):
        self.tokens_count = Counter(self.tokens)

    def smooth(self):
        counts_of_counts = Counter(self.tokens_count.values())
        interpolated_counts_of_counts = interpolate(counts_of_counts)
        # todo: refactor, move exception handling to interpolate
        smoothed_count = dict()
        for token, token_count in self.tokens_count.items():
            try:
                interp = interpolated_counts_of_counts(token_count + 1)
            except ValueError:
                interp = 1.
            smoothed_count[token] = (token_count + 1) * interp / counts_of_counts[token_count]
        self.tokens_count = smoothed_count

    def calc_tokens_prob(self):
        for token, token_count in self.tokens_count.items():
            self.tokens_prob[token] = token_count / len(self.tokens)


# todo: refactor
class GoldCorpusFileHandler(object):
    # todo ensure only json files
    def __init__(self, prob_filename, stopwords_filename):
        self.prob_filename = prob_filename
        self.stopwords_filename = stopwords_filename
        self.tokens_prob = dict()
        self.stopwords = set()
        self.zero_count_prob = 0.

    def read_tokens_prob(self):
        with open(self.prob_filename, errors='ignore') as gold_corpus_file:
            self.tokens_prob = json.loads(gold_corpus_file.read())

    def zero_count_prob(self):
        return 1 - sum(self.tokens_prob.values())

    def zero_count_tokens_prob(self, tokens_to_compare):
        self.zero_count_prob = len(tokens_to_compare - set(self.tokens_prob.values()))

    def read_stopwords(self):
        self.stopwords = set([word[:-1] for word in open(self.stopwords_filename)])


# todo: refactor
class OurCorpus(BaseCorpus):
    def calc_prob_difference(self):
        self.tokenize_text()
        self.calc_tokens_count()
        self.calc_tokens_prob()

        # gold_corpus = GoldCorpusFileHandler(GOLD_CORPUS_DIR + 'ukr_prob_smoothed.json', GOLD_CORPUS_DIR + 'stopwords')
        gold_corpus = GoldCorpusFileHandler(GOLD_CORPUS_DIR + 'ukr_prob.json', GOLD_CORPUS_DIR + 'stopwords')
        gold_corpus.read_tokens_prob()
        gold_corpus.read_stopwords()
        stopwords = gold_corpus.stopwords
        gold_corpus_prob = gold_corpus.tokens_prob

        gold_corpus.zero_count_tokens_prob(set(self.tokens))

        zero_prob = gold_corpus.zero_count_prob

        probability_difference = {}
        for word in self.tokens_prob:
            if word not in stopwords:
                probability_difference[word] = self.tokens_prob[word] - gold_corpus_prob.get(word, zero_prob)
        return probability_difference
