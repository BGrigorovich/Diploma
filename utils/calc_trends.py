# -*- coding: utf-8 -*-
import operator
import os
import json
from utils.corpus import OurCorpus
from Diploma.settings import TRENDS_DIR
# from celery.decorators import task


def write_trends(file_name, diff):
    if not os.path.exists(TRENDS_DIR):
        os.makedirs(TRENDS_DIR)
    with open(TRENDS_DIR + file_name.split('/')[-1] + '_trends.json', 'w+') as trends_file:
        trends_file.write(json.dumps(diff, ensure_ascii=False))


# @task
def calc_trends(file_name):
    corpus = OurCorpus.from_file(file_name)
    diff = corpus.calc_prob_difference()

    write_trends(file_name, diff)
    sorted_diff = sorted(diff.items(), key=operator.itemgetter(1), reverse=True)

    return sorted_diff
