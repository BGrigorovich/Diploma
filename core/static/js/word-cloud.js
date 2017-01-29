var trends;
var articles;

/**
 * checks if rectangle 2 intersects with rectangle 1 on given axis
 * @param coord1 - rectangle 1 left top corner coordinate on given axis
 * @param size1 - rectangle 1 size on given axis
 * @param coord2 - rectangle 2 left top corner coordinate on given axis
 * @param size2 - rectangle 2 size on given axis
 * @returns {boolean}
 */
function isIntersectsByAxis(coord1, size1, coord2, size2) {
    return (coord1 <= coord2 && coord2 <= coord1 + size1) || (coord1 <= coord2 + size2 && coord2 + size2 <= coord1 + size1);
}

function isTwoRectanglesIntersects(left1, width1, top1, height1, left2, width2, top2, height2) {
    return ((isIntersectsByAxis(left1, width1, left2, width2) && isIntersectsByAxis(top1, height1, top2, height2)) ||
    (isIntersectsByAxis(left2, width2, left1, width1) && isIntersectsByAxis(top2, height2, top1, height1)));
}

function isIntersectsWithWords(left, width, top, height) {
    var words = $('.word');
    var isIntersects = false;
    [].forEach.call(words, function (word) {
        if (isTwoRectanglesIntersects(word.offsetLeft, word.offsetWidth + 10, word.offsetTop, word.offsetHeight + 10, left, width + 10, top, height + 10)) {
            isIntersects = true;
        }
    });
    return isIntersects;
}

function putTrend(wordText, font) {
    var wordCloud = $('#word-cloud-container');
    var $word = $('<div></div>');
    wordCloud.append($word);
    $word.text(wordText);
    $word.css('font-size', font);
    $word.addClass('new-word');
    do {
        var left = Math.floor(Math.random() * (wordCloud.width() - $word.width()));
        var top = Math.floor(Math.random() * (wordCloud.height() - $word.height()));
    } while (isIntersectsWithWords(left, $word.width(), top, $word.height()));

    $word.css({'left': left + 'px', 'top': top + 'px', 'font-size': font + 'px'});
    $word.removeClass('new-word');
    $word.addClass('word');
}

function displayArticles(articlesList) {
    var $articlesContainer = $('#articles-container');
    $articlesContainer.find('.article').remove();
    var $articlesUL = $articlesContainer.find('ul');
    if (articlesList.length) {
        $articlesUL.append(
            articlesList.map(function (article) {
                return '<li class="article"><p><a href="' + article.link + '" target="_blank">' + article.title + '</a> (' + article.site + ')</p></li>'
            }).join('')
        );
    } else {
        $articlesUL.append('<div class="article"><strong>Немає статей.</strong></div>');
    }
}

function loadArticles(word) {
    var site = $('#site-select').val();
    var $articlesContainer = $('#articles-container');
    $articlesContainer.find('.article').remove();
    $.ajax({
        url: '/articles?published=' + dateToAPIFormat($('#datepicker').datepicker('getDate')) + '&site=' + site + '&text__icontains=' + word,
        success: function (response) {
            window.articles = response;
            $articlesContainer.show();
            var $articleContainerHeader = $('#articles-container-header-word');
            $articleContainerHeader.text(word);
            $('#articles-site-filter').val('');
            displayArticles(window.articles);
        }
    });
}

function loadWordCloud() {
    var date = $('#datepicker').datepicker('getDate');
    var site = $('#site-select').val();
    $('.word, .new-word').remove();
    $('#articles-container').hide();

    $.ajax({
        url: '/trends/' + dateToAPIFormat(date) + '/' + site,
        success: function (response) {
            trends = [];
            $.each(response, function (word, prob) {
                trends.push([word, prob]);
            });
            trends.sort(function (a, b) {
                return b[1] - a[1];
            });
            var $wordCloud = $('#word-cloud-container');
            $wordCloud.height($wordCloud.width() * 9 / 16);

            var maxFontSize = Math.round($wordCloud.height() / 20);
            var FONT_STEP = maxFontSize / 15;

            for (var i = 0; i < trends.length; i++) {
                trends[i][1] = maxFontSize - (FONT_STEP * Math.floor(i / 5));
                putTrend(trends[i][0], trends[i][1]);
            }
        }
    });
}

function loadDatePicker() {
    $('#datepicker').datepicker({
        defaultDate: yesterday(),
        minDate: startDate,
        maxDate: yesterday(),
        dateFormat: 'DD, d MM, yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        onSelect: function (dateText, inst) {
            loadWordCloud();
        }
    }).datepicker('setDate', yesterday());
}

$(document).ready(function () {
    loadDatePicker();
    loadWordCloud();

    $('#site-select').change(function () {
        loadWordCloud();
        var $articlesSiteFilter = $('#articles-site-filter');
        if ($(this).val()) {
            $articlesSiteFilter.parent().hide();
        } else {
            $articlesSiteFilter.parent().show();
            $articlesSiteFilter.val('')
        }
    });

    $('#articles-site-filter').change(function () {
        var siteName = $(this).val();
        if (siteName) {
            displayArticles(window.articles.filter(function(article) {
                return article.site == siteName;
            }));
        } else {
            displayArticles(window.articles);
        }
    });


    $(document).on('click', '.word', function () {
        loadArticles($(this).text());
    });
});
