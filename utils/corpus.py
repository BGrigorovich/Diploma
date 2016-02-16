# -*- coding: utf-8 -*-
import re
import string
import json
from collections import Counter
from Diploma.settings import GOLD_CORPUS_DIR
from .interpolation import interpolate, interpolate_token_count_of_count


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
            # todo: figure out why I have the '' token
            tokens = list(filter(''.__ne__, tokens))
            tokens_lower = [token.lower() for token in tokens]
            self.tokens = tokens_lower

    def calc_tokens_count(self):
        self.tokens_count = Counter(self.tokens)

    def smooth(self):
        counts_of_counts = Counter(self.tokens_count.values())
        interpolation_function = interpolate(counts_of_counts)
        smoothed_count = dict()
        for token, token_count in self.tokens_count.items():
            interp = interpolate_token_count_of_count(interpolation_function, token_count)
            smoothed_count[token] = (token_count + 1) * interp / counts_of_counts[token_count]
        self.tokens_count = smoothed_count

    def calc_tokens_prob(self):
        for token, token_count in self.tokens_count.items():
            self.tokens_prob[token] = token_count / len(self.tokens)


class GoldCorpusFileHandler(object):
    def __init__(self, prob_filename, stopwords_filename):
        self.prob_filename = prob_filename
        self.stopwords_filename = stopwords_filename
        with open(self.prob_filename, errors='ignore') as gold_corpus_file:
            data = json.loads(gold_corpus_file.read())
            self.tokens_prob = data['tokens_prob']
            self.zero_count_total_prob = data['zero_count_prob']
        with open(self.stopwords_filename) as stopwords_file:
            self.stopwords = set([word[:-1] for word in stopwords_file])

    def calc_zero_count_tokens_prob(self, tokens_to_compare):
        return self.zero_count_total_prob / len(tokens_to_compare - set(self.tokens_prob.values()))


# todo: rename
class OurCorpus(BaseCorpus):
    def calc_prob_difference(self):
        self.tokenize_text()
        self.calc_tokens_count()
        self.calc_tokens_prob()

        gold_corpus = GoldCorpusFileHandler(GOLD_CORPUS_DIR + 'ukr_prob_smoothed.json', GOLD_CORPUS_DIR + 'stopwords')
        zero_prob = gold_corpus.calc_zero_count_tokens_prob(set(self.tokens))

        probability_difference = dict()
        for word in self.tokens_prob:
            if word not in gold_corpus.stopwords:
                probability_difference[word] = self.tokens_prob[word] - gold_corpus.tokens_prob.get(word, zero_prob)
        return probability_difference


def smooth_corpus(filename):
    gold_corpus = BaseCorpus(filename)

    gold_corpus.tokenize_text()
    gold_corpus.calc_tokens_count()
    gold_corpus.smooth()
    gold_corpus.calc_tokens_prob()

    zero_prob = 1 - sum(gold_corpus.tokens_prob.values())
    return {'zero_count_prob': zero_prob, 'tokens_prob': gold_corpus.tokens_prob}
