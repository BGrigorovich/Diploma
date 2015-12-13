# -*- coding: utf-8 -*-
import json
import os
import nltk
import operator
import re
from collections import Counter
from Diploma.settings import GOLD_CORPUS_DIR


def rename_input_file(file_name):
    new_file_name = '.'.join(file_name.split('.')[:-1]) if '.' in file_name.split('/')[-1] else file_name
    os.rename(file_name, new_file_name)
    return new_file_name


def tokenize_text(file_name):
    with open(file_name) as input_file:
        # delete non ukrainian words and symbols
        text = input_file.read()
        only_words = re.sub('\W|\d+', ' ', text)

        tokens = nltk.word_tokenize(only_words)
        tokens_lower = [token.lower() for token in tokens]
        return tokens_lower

        # todo: good lemmatization words set
        # with open(GOLD_CORPUS_DIR + 'word_forms') as word_forms_file:
        #     word_forms = dict()
        #     for line in word_forms_file:
        #         form, initial_form = line.split()
        #         word_forms[form] = initial_form
        #     tokens_lemmatized = [word_forms[token] if token in word_forms else token for token in tokens]
        #     return tokens_lemmatized


def calc_tokens_prob(tokens):
    tokens_prob = Counter(tokens)
    for token in tokens_prob.keys():
        tokens_prob[token] /= len(tokens)
    return tokens_prob


def get_gold_corpus_prob(file_path=GOLD_CORPUS_DIR + 'ukr_prob.json'):
    with open(file_path, errors='ignore') as gold_corpus_file:
        return json.loads(gold_corpus_file.read())


def calc_prob_diff(tokens):
    our_corpus_prob = calc_tokens_prob(tokens)
    stopwords = [word for word in open(GOLD_CORPUS_DIR + 'stopwords')]
    print(stopwords)
    gold_corpus_prob = get_gold_corpus_prob()

    probability_difference = {}
    for word in our_corpus_prob:
        if word + '\n' not in stopwords:
            # todo: replace + '\n' in comparison on something more elegant (each word in stopwords end with \n)
            probability_difference[word] = our_corpus_prob[word] - gold_corpus_prob.get(word, 0)
    return probability_difference


def write_trends(file_name, diff):
    files_path = '/'.join(file_name.split('/')[:-1]) + '/'
    # if not os.path.exists(files_path + 'trends/'):
    #     os.makedirs(files_path + 'trends/')
    with open(files_path + 'trends/' + file_name.split('/')[-1] + '_trends.json', 'w+') as trends_file:
        trends_file.write(json.dumps(diff, ensure_ascii=False))


# todo: don`t delete apostrophe
def calc_trends(file_name):
    file_name = rename_input_file(file_name)
    tokens = tokenize_text(file_name)
    diff = calc_prob_diff(tokens)
    write_trends(file_name, diff)
    sorted_diff = sorted(diff.items(), key=operator.itemgetter(1), reverse=True)

    return sorted_diff

# todo: topic modeling
