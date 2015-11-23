# -*- coding: utf-8 -*-
import os
import codecs
import string
import nltk

import operator
import re
from Diploma.settings import GOLD_CORPUS_DIR


def calc_trends(file_name):
    new_file_name = '.'.join(file_name.split('.')[:-1]) if '.' in file_name.split('/')[-1] else file_name
    os.rename(file_name, new_file_name)
    file_name = new_file_name
    with open(file_name) as input_file:
        # delete non ukrainian words and symbols
        text = input_file.read()
        only_words = re.sub('\W|\d+', ' ', text)

        tokens = nltk.word_tokenize(only_words)
        tokens_lower = [token.lower() for token in tokens]

        # calc_tokens_prob
        with codecs.open(file_name + '_lower', 'w+', encoding='utf-8', errors='ignore') as output_file:
            output_file.write(' '.join(tokens_lower))
            os.system('/home/bogdan/AACIMP/kenlm/bin/lmplz -o 1 --skip_symbols -S 60% --arpa ' +
                      file_name + '_prob' + ' < ' + file_name + '_lower')

    # get_trends
    gold_corpus = {}
    our_corpus = {}
    stopwords = [word for word in open(GOLD_CORPUS_DIR + 'stopwords')]
    with open(GOLD_CORPUS_DIR + 'ukr_prob', errors='ignore') as gold_corpus_file, \
            open(file_name + '_prob') as our_corpus_file:
        for line in gold_corpus_file:
            try:
                gold_corpus[line.split('\t')[1]] = 10 ** float(line.split('\t')[0])  # I have no idea what is going on
            except:
                pass
        for line in our_corpus_file:
            try:
                our_corpus[line.split('\t')[1]] = 10 ** float(line.split('\t')[0])
            except:
                pass

    diff = {}
    for word in our_corpus:
        if word not in stopwords:
            # if gold_corpus.has_key(word):
            if word in gold_corpus.keys():
                diff[word] = our_corpus[word] - gold_corpus[word]
            else:
                diff[word] = our_corpus[word]

    files_path = '/'.join(file_name.split('/')[:-1]) + '/'
    sorted_diff = sorted(diff.items(), key=operator.itemgetter(1), reverse=True)

    if not os.path.exists(files_path + 'trends/'):
        os.makedirs(files_path + 'trends/')
    with open(files_path + 'trends/' + file_name.split('/')[-1] + '_trends', 'w+') as f:
        for x in sorted_diff:
            f.write(x[0][:-1] + '   ' + str(x[1]) + '\n')

    os.remove(file_name + '_lower')
    os.remove(file_name + '_prob')

    return sorted_diff

# todo: topic modeling
