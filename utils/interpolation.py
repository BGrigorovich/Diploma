import operator
from scipy.interpolate import interp1d


def interpolate_token_count_of_count(interpolation_func, interpolated_value):
    try:
        return interpolation_func(interpolated_value + 1)
    except ValueError:
        return 1.


def interpolate(sorted_counts_of_counts):
    sorted_counts_of_counts = sorted(sorted_counts_of_counts.items(), key=operator.itemgetter(0))
    x, y = zip(*sorted_counts_of_counts)
    return interp1d(x, y)
