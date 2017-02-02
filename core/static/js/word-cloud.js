var trends; // масив слів в хмарі слів
var articles;   // масив статей

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
    wordCloud.append($word);    // добавляє слово в хмару слів
    $word.text(wordText);   // задає текст слова
    $word.css('font-size', font);   // задає розмір шрифту для слова
    $word.addClass('new-word');
    // рандомно вибирає координати доки слово не буде перетинатись з іншими словами в хмарі
    do {
        var left = Math.floor(Math.random() * (wordCloud.width() - $word.width()));
        var top = Math.floor(Math.random() * (wordCloud.height() - $word.height()));
    } while (isIntersectsWithWords(left, $word.width(), top, $word.height()));

    // задає координати для слова
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
    $articlesContainer.find('.article').remove();   // видаляє попередні статті
    var $articlesUL = $articlesContainer.find('ul');    // знаходить список, в який треба вставляти статті
    // якщо список статей не порожній
    if (articlesList.length) {
        // добавляє статті в список
        $articlesUL.append(
            articlesList.map(function (article) {
                return '<li class="article"><p><a href="' + article.link + '" target="_blank">' + article.title + '</a> (' + article.site + ')</p></li>'
            }).join('')
        );
    } else {
        // виводить повідомлення, що статей немає
        $articlesUL.append('<div class="article"><strong>Немає статей.</strong></div>');
    }
}

/**
 * загружає список статей з заданим словом
 * @param word - слово
 */
function loadArticles(word) {
    var site = $('#site-select').val(); // дістає ід вибраного сайта
    var $articlesContainer = $('#articles-container');
    $articlesContainer.find('.article').remove();   // видаляє попередні статті
    // AJAX запит на статті по слову і сайту
    $.ajax({
        url: '/articles?published=' + dateToAPIFormat($('#datepicker').datepicker('getDate')) + '&site=' + site + '&text__icontains=' + word,
        success: function (response) {  // в разі успішної відповіді
            window.articles = response;
            $articlesContainer.show();  // показує контейнер для статей
            $('#articles-container-header-word').text(word); // задає текст заголовку списку статей
            $('#articles-site-filter').val(''); // виставляє значення по замовчуванню для
            displayArticles(window.articles);   // виводить статті на екран
        }
    });
}

/**
 * загружає хмару слів
 */
function loadWordCloud() {
    var date = $('#datepicker').datepicker('getDate');  // бере дату з дейтпікера
    var site = $('#site-select').val(); // бере ід вибраного сайта
    $('.word, .new-word').remove(); // видаляє попередні слова з хмари слів
    $('#articles-container').hide();    // ховає статті

    // AJAX запит на тренди
    $.ajax({
        url: '/trends/' + dateToAPIFormat(date) + '/' + site,
        success: function (response) {  // у разі успішної відповіді
            trends = [];
            $.each(response, function (word, prob) {
                trends.push([word, prob]);
            }); // формує масив трендів
            trends.sort(function (a, b) {
                return b[1] - a[1];
            }); // сортує тренди по спаданню популярності
            var $wordCloud = $('#word-cloud-container');
            $wordCloud.height($wordCloud.width() * 9 / 16); // задає висоту хмари слів

            var maxFontSize = Math.round($wordCloud.height() / 20); // максимальний розмір шрифта (розмір хмари / 20)
            var FONT_STEP = maxFontSize / 15;   // крок, з яким змінюється шрифт в хмарі

            for (var i = 0; i < trends.length; i++) {
                trends[i][1] = maxFontSize - (FONT_STEP * Math.floor(i / 5));   // задає розмір шрифта для слова
                putTrend(trends[i][0], trends[i][1]);   // виводить слово в хмарі слів
            }
        }
    });
}

/**
 * загружає дейтпікер
 */
function loadDatePicker() {
    $('#datepicker').datepicker({
        defaultDate: yesterday(),   // дата по замовчуванню
        minDate: startDate, // мінімальна дата, яку можна вибрати, 23 листопада 2016
        maxDate: yesterday(),   // максимальна дата, яку можна вибрати
        dateFormat: 'DD, d MM, yy', // формат відображення дати
        showOtherMonths: true,  // чи показувати місяці крім поточного
        selectOtherMonths: true,    // чи можна вибирати дати з місяців крім поточного
        onSelect: function (dateText, inst) {   // подія на зміну вибраного дня
            loadWordCloud();    // перезагружає хмару слів
        }
    }).datepicker('setDate', yesterday());
}

$(document).ready(function () {
    loadDatePicker();
    loadWordCloud();

    // подія на зміну сайту в селекторі
    $('#site-select').change(function () {
        loadWordCloud();    // перезагружає хмару слів
        var $articlesSiteFilter = $('#articles-site-filter');   // фільтр статей по сайту
        if ($(this).val()) {    // якщо хмара слів побудована для якогось сайту
            $articlesSiteFilter.parent().hide();    // ховає фільтр по сайту для статей
        } else {    // якщо хмара слів побудована для всіх сайтів
            $articlesSiteFilter.parent().show();    // показує фільтр по сайту для статей
            $articlesSiteFilter.val('');    // виставляє дефолтне значення для фільтру по сайтах
        }
    });

    // подія на зміну сайту в фільтрі по сайтах
    $('#articles-site-filter').change(function () {
        var siteName = $(this).val();   // назва сайту
        if (siteName) { // якщо не всі видання
            displayArticles(window.articles.filter(function(article) {  // фільтрує статті по сайту і відображаємо їх
                return article.site == siteName;
            }));
        } else {    // якщо всі видання
            displayArticles(window.articles);   // відображає статті по всіх виданнях
        }
    });

    // подія на клік по слову в хмарі
    $(document).on('click', '.word', function () {
        loadArticles($(this).text());   // загружає статті для слова
    });
});
