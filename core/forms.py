from django import forms


class UploadFileForm(forms.Form):
    corpus_file = forms.FileField()
