var trends;
var articles;

/**
 * перевіряє, чи два відрізки на прямій накладаються
 * @param c1 - ліва координата першого відрізка
 * @param l1 - довжина першого відрізка
 * @param c2 - ліва координата другого відрізка
 * @param l2 - довжина другого відрізка
 * @returns {boolean} - чи два відрізки на прямій накладаються
 */
function isIntersectsByAxis(c1, l1, c2, l2) {
    return !(c1 + l1 <= c2 || c2 + l2 <= c1);
}

/**
 * перевіряє, чи накладаються два прямокутники на площині
 * @param left1 - ліва координата першого прямокутника
 * @param width1 - ширина першого прямокутника
 * @param top1 - верхня координата першого прямокутника
 * @param height1 - висота першого прямокутника
 * @param left2 - ліва координата другого прямокутника
 * @param width2 - ширина другого прямокутника
 * @param top2 - верхня другого першого прямокутника
 * @param height2 - висота другого прямокутника
 * @returns {boolean} - чи накладаються два прямокутники на площині
 */
function isTwoRectanglesIntersects(left1, width1, top1, height1, left2, width2, top2, height2) {
    return isIntersectsByAxis(left1, width1, left2, width2) && isIntersectsByAxis(top1, height1, top2, height2);
}

/**
 * перевіряє, чи слово в хмарі слів накладається на інші
 * @param left - ліва координата слова
 * @param width - ширина слова
 * @param top - верхня координата слова
 * @param height - висота слова
 * @returns {boolean} - чи слово в хмарі слів накладається на інші
 */
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

/**
 * додає слово в хмару слів
 * @param wordText - текст слова
 * @param font - розмір шрифта слова
 */
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

/**
 * відображає список статей
 * @param articlesList - масив з сртатями
 */
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

/**
 * загружає список статей з заданим словом
 * @param word - слово
 */
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

/**
 * загружає хмару слів
 */
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

/**
 * загружає дейтпікер
 */
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
