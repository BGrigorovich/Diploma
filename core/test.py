# get_trends
gold_corpus = {}
our_corpus = {}
stopwords = [word for word in open('/home/bogdan/AACIMP/kenlm/stopwords.txt')]
with open('/home/bogdan/AACIMP/kenlm/ukr_prob', errors='ignore') as gold_corpus_file:
    for line in gold_corpus_file:
        try:
            gold_corpus[line.split('\t')[1]] = 10 ** float(line.split('\t')[0])  # I have no idea what is going on
        except:
            pass
    print(sum(gold_corpus.values()))