from django.shortcuts import render_to_response

from corpus_parser.models import Site


def word_cloud_view(request):
    context = {'sites': Site.objects.filter(parse=True)}
    return render_to_response('word-cloud.html', context=context)


def word_count_graph_view(request):
    context = {'sites': Site.objects.filter(parse=True)}
    return render_to_response('word-count-chart.html', context=context)


def about_page_view(request):
    return render_to_response('about.html')
