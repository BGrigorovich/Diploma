# -*- coding: utf-8 -*-
import operator
import os
import json
# from celery.decorators import task
from utils.corpus import OurCorpus


# todo: move to storage
def write_trends(file_name, diff):
    files_path = '/'.join(file_name.split('/')[:-1]) + '/'
    if not os.path.exists(files_path + 'trends/'):
        os.makedirs(files_path + 'trends/')
    with open(files_path + 'trends/' + file_name.split('/')[-1] + '_trends.json', 'w+') as trends_file:
        trends_file.write(json.dumps(diff, ensure_ascii=False))


# @task
def calc_trends(file_name):
    corpus = OurCorpus(file_name)
    diff = corpus.calc_prob_difference()
    # diff = calc_prob_diff(tokens)
    write_trends(file_name, diff)
    sorted_diff = sorted(diff.items(), key=operator.itemgetter(1), reverse=True)

    return sorted_diff
