# -*- coding: utf-8 -*-
import re
import string
import json
from collections import Counter
from Diploma.settings import GOLD_CORPUS_DIR


class Corpus(object):
    def __init__(self, filename):
        self.filename = filename
        self.tokens = list()
        self.tokens_prob = list()

    def tokenize_text(self):
        with open(self.filename, errors='ignore') as input_file:
            text = input_file.read()
            text = re.sub('–|«|»|\d+', ' ', text)
            tokens = [word.strip(string.punctuation) for word in text.split()]
            tokens_lower = [token.lower() for token in tokens]
            self.tokens = tokens_lower

    def calc_tokens_prob(self):
        tokens_prob = Counter(self.tokens)
        # print(smooth(tokens_prob))
        for token in tokens_prob.keys():
            tokens_prob[token] /= len(self.tokens)
        self.tokens_prob = tokens_prob


class GoldCorpus(Corpus):
    @staticmethod
    def tokens_prob(file_path=GOLD_CORPUS_DIR + 'ukr_prob.json'):
        with open(file_path, errors='ignore') as gold_corpus_file:
            return json.loads(gold_corpus_file.read())

    @staticmethod
    def stopwords():
        return set([word[:-1] for word in open(GOLD_CORPUS_DIR + 'stopwords')])


class OurCorpus(Corpus):
    def calc_prob_difference(self):
        self.tokenize_text()
        self.calc_tokens_prob()
        # leave two blank lines at the end of the stopwords file
        stopwords = GoldCorpus.stopwords()
        gold_corpus_prob = GoldCorpus.tokens_prob()

        probability_difference = {}
        for word in self.tokens_prob:
            if word not in stopwords:
                probability_difference[word] = self.tokens_prob[word] - gold_corpus_prob.get(word, 0)
        return probability_difference
