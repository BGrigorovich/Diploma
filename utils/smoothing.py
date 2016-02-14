import operator
from collections import Counter
from contextlib import redirect_stdout
from scipy.interpolate import interp1d


def interpolate(sorted_counts_of_counts):
    sorted_counts_of_counts = sorted(sorted_counts_of_counts.items(), key=operator.itemgetter(0))
    x, y = zip(*sorted_counts_of_counts)
    return interp1d(x, y)


def smooth(tokens_counts):
    counts_of_counts = Counter(tokens_counts.values())
    interpolated_counts_of_counts = interpolate(counts_of_counts)
    # todo: refactor
    smoothed_count = dict()
    for token, token_count in tokens_counts.items():
        try:
            interp = interpolated_counts_of_counts(token_count + 1)
        except ValueError:
            interp = 1.
        smoothed_count[token] = (token_count + 1) * interp / counts_of_counts[token_count]
    with open('out.txt', 'w+') as f:
        with redirect_stdout(f):
            print(tokens_counts, end='\n\n')
            print(smoothed_count, end='\n\n')
            print('sum of probs:', sum(counts_of_counts.values()))
            print('sum of smoothed probs:', sum(smoothed_count.values()))

    return smoothed_count

# todo: smooth gold corpus
