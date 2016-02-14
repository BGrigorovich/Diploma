from django.shortcuts import render_to_response
from django.template.context_processors import csrf

from Diploma.settings import MEDIA_ROOT
from utils.calc_trends import calc_trends
from .forms import UploadFileForm
from .models import CorpusFile


def upload_file(request):
    args = {}
    args.update(csrf(request))
    if request.POST:
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            args['form'] = UploadFileForm()
            corpus_file = CorpusFile(corpus_file=request.FILES['corpus_file'])
            corpus_file.save()

            # trends_task = calc_trends.delay(MEDIA_ROOT + str(corpus_file.corpus_file)[2:])
            # trends = trends_task.get()[:50]

            # todo: wtf? refactor this
            trends = calc_trends(MEDIA_ROOT + 'corpus/' + str(corpus_file.corpus_file))[:50]

            args['tokens'] = trends
            args['file_uploaded'] = True
        return render_to_response('fileupload.html', args)
    else:
        args['form'] = UploadFileForm()
    return render_to_response('fileupload.html', args)
