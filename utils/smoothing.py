import operator
from collections import Counter
from contextlib import redirect_stdout
from scipy.interpolate import interp1d


def interpolate_token_count_of_count():
    pass


def interpolate(sorted_counts_of_counts):
    sorted_counts_of_counts = sorted(sorted_counts_of_counts.items(), key=operator.itemgetter(0))
    x, y = zip(*sorted_counts_of_counts)
    return interp1d(x, y)
