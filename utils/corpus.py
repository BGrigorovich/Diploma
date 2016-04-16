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

    def tokenize(self):
        print('corpus.text', self.text, end='\n')
        corpus_text = re.sub('–|«|»|\d+', ' ', self.text)
        tokens = [word.strip(string.punctuation) for word in corpus_text.split()]
        print(1, tokens)
        # todo: figure out why I have the '' token
        tokens = list(filter(''.__ne__, tokens))
        print(2, tokens)
        self.tokens = [token.lower() for token in tokens]
        return self

    def remove_stopwords(self):
        if self.tokens:
            with open(GOLD_CORPUS_DIR + 'stopwords') as stopwords_file:
                stopwords = set([word[:-1] for word in stopwords_file])
                self.tokens = [token for token in self.tokens if token not in stopwords]
                return self
        else:
            raise ValueError('Object attribute self.tokens is empty')

    def lemmatize(self):
        if self.tokens:
            r = redis.StrictRedis('localhost', port=6379, db=10)
            for i in range(len(self.tokens)):
                word_lemma = r.get(self.tokens[i])
                if word_lemma:
                    self.tokens[i] = word_lemma.decode()
            return self
        else:
            raise ValueError('Object attribute self.tokens is empty')

    @classmethod
    def from_file(cls, filename):
        with open(filename, errors='ignore') as corpus_file:
            return cls(corpus_file.read())


class ProbabilityCorpus(BaseCorpus):
    def __init__(self, text):
        super().__init__(text)
        self.tokens_count = Counter()
        self.tokens_prob = dict()
        self.prob_difference = dict()

    def calc_tokens_count(self):
        if self.tokens:
            self.tokens_count = Counter(self.tokens)
            return self
        else:
            raise ValueError('Object attribute self.tokens is empty')

    def smooth(self):
        if self.tokens_count:
            counts_of_counts = Counter(self.tokens_count.values())
            interpolation_function = interpolate(counts_of_counts)

            for token, token_count in self.tokens_count.items():
                interp = interpolate_token_count_of_count(interpolation_function, token_count)
                self.tokens_count[token] = (token_count + 1) * interp / counts_of_counts[token_count]
            return self
        else:
            raise ValueError('Object attribute self.tokens_count is empty')

    def calc_tokens_prob(self):
        if self.tokens_count:
            for token, token_count in self.tokens_count.items():
                self.tokens_prob[token] = token_count / len(self.tokens)
            return self
        else:
            raise ValueError('Object attribute self.tokens_count is empty')

    def calc_prob_difference(self):
        self.tokenize().lemmatize().remove_stopwords().calc_tokens_count().calc_tokens_prob()

        gold_corpus = GoldCorpusFileHandler(GOLD_CORPUS_DIR + 'ukr_prob.json')
        zero_prob = gold_corpus.calc_zero_count_tokens_prob(set(self.tokens))

        for word in self.tokens_prob:
            self.prob_difference[word] = self.tokens_prob[word] - gold_corpus.tokens_prob.get(word, zero_prob)
        return self

    def get_top_trends(self, trends_count):
        if self.prob_difference:
            return sorted(self.prob_difference.items(), key=operator.itemgetter(1), reverse=True)[:trends_count]
        else:
            raise ValueError('Object attribute self.prob_difference is empty')

    def get_top_counts(self, trends_count):
        top_counts = dict()
        if self.prob_difference:
            for token, prob in self.get_top_trends(trends_count):
                top_counts[token] = self.tokens_count[token]
            return top_counts
        else:
            raise ValueError('Object attribute self.prob_difference is empty')


class GoldCorpusFileHandler:
    def __init__(self, prob_filename):
        self.prob_filename = prob_filename
        with open(self.prob_filename, errors='ignore') as gold_corpus_file:
            data = json.loads(gold_corpus_file.read())
            self.tokens_prob = data['tokens_prob']
            self.zero_count_prob = data['zero_count_prob']

    def calc_zero_count_tokens_prob(self, tokens_to_compare):
        return self.zero_count_prob / len(tokens_to_compare - set(self.tokens_prob.values()))


def smooth_corpus(corpus_text):
    gold_corpus = ProbabilityCorpus(corpus_text)
    gold_corpus.tokenize().lemmatize().remove_stopwords().calc_tokens_count().smooth().calc_tokens_prob()
    zero_prob = 1 - sum(gold_corpus.tokens_prob.values())
    return {'zero_count_prob': zero_prob, 'tokens_prob': gold_corpus.tokens_prob}
