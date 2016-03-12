# -*- coding: utf-8 -*-
import json
import operator
import re
import string
from collections import Counter

import redis

from Diploma.settings import GOLD_CORPUS_DIR
from utils.interpolation import interpolate, interpolate_token_count_of_count


class BaseCorpus:
    def __init__(self, text):
        self.text = text
        self.tokens = list()
        self.tokens_count = Counter()
        self.tokens_prob = dict()

    def tokenize_text(self):
        corpus_text = re.sub('–|«|»|\d+', ' ', self.text)
        tokens = [word.strip(string.punctuation) for word in corpus_text.split()]
        # todo: figure out why I have the '' token
        tokens = list(filter(''.__ne__, tokens))
        self.tokens = [token.lower() for token in tokens]

    def clean_from_stopwords(self):
        with open(GOLD_CORPUS_DIR + 'stopwords') as stopwords_file:
            stopwords = set([word[:-1] for word in stopwords_file])
            self.tokens = [token for token in self.tokens if token not in stopwords]

    def lemmatize_tokens(self):
        if self.tokens:
            r = redis.StrictRedis('localhost', port=6379, db=10)
            for i in range(len(self.tokens)):
                word_lemma = r.get(self.tokens[i])
                if word_lemma:
                    self.tokens[i] = word_lemma.decode()
        else:
            raise ValueError('BaseCorpus attribute self.tokens is empty')

    def calc_tokens_count(self):
        self.tokens_count = Counter(self.tokens)

    def smooth(self):
        counts_of_counts = Counter(self.tokens_count.values())
        interpolation_function = interpolate(counts_of_counts)

        for token, token_count in self.tokens_count.items():
            interp = interpolate_token_count_of_count(interpolation_function, token_count)
            self.tokens_count[token] = (token_count + 1) * interp / counts_of_counts[token_count]

    def calc_tokens_prob(self):
        for token, token_count in self.tokens_count.items():
            self.tokens_prob[token] = token_count / len(self.tokens)

    @classmethod
    def from_file(cls, filename):
        with open(filename, errors='ignore') as corpus_file:
            return cls(corpus_file.read())


class GoldCorpusFileHandler:
    def __init__(self, prob_filename):
        self.prob_filename = prob_filename
        with open(self.prob_filename, errors='ignore') as gold_corpus_file:
            data = json.loads(gold_corpus_file.read())
            self.tokens_prob = data['tokens_prob']
            self.zero_count_total_prob = data['zero_count_prob']

    def calc_zero_count_tokens_prob(self, tokens_to_compare):
        return self.zero_count_total_prob / len(tokens_to_compare - set(self.tokens_prob.values()))


# todo: rename
class OurCorpus(BaseCorpus):
    def calc_prob_difference(self):
        self.tokenize_text()
        self.lemmatize_tokens()
        self.clean_from_stopwords()
        self.calc_tokens_count()
        self.calc_tokens_prob()

        gold_corpus = GoldCorpusFileHandler(GOLD_CORPUS_DIR + 'ukr_prob.json')
        zero_prob = gold_corpus.calc_zero_count_tokens_prob(set(self.tokens))

        probability_difference = dict()
        for word in self.tokens_prob:
            probability_difference[word] = self.tokens_prob[word] - gold_corpus.tokens_prob.get(word, zero_prob)
        return probability_difference

    def get_top_trends(self, trends_count):
        return sorted(self.calc_prob_difference().items(), key=operator.itemgetter(1), reverse=True)[:trends_count]


def smooth_corpus(corpus_file):
    gold_corpus = BaseCorpus.from_file(corpus_file)
    gold_corpus.tokenize_text()
    gold_corpus.lemmatize_tokens()
    gold_corpus.clean_from_stopwords()
    gold_corpus.calc_tokens_count()
    gold_corpus.smooth()
    gold_corpus.calc_tokens_prob()

    zero_prob = 1 - sum(gold_corpus.tokens_prob.values())
    return {'zero_count_prob': zero_prob, 'tokens_prob': gold_corpus.tokens_prob}
