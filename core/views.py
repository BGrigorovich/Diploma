from django.shortcuts import render_to_response


def word_cloud_view(reuqest):
    return render_to_response('word-cloud.html')


def word_count_graph_view(reuqest):
    return render_to_response('word-count-chart.html')
