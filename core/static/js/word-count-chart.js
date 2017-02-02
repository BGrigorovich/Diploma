var data = [];  // масив всіх даних для графіка

/**
 * перевіряє, чи графік для слова вже побудований
 * @param item - дані для побудови графіку
 * @returns {boolean} - чи графік слова вже побудований
 */
function isAlreadyPlotted(item) {
    for (var i = 0; i < data.length; i++) {
        if (data[i]['label'].toLowerCase() == item['label'].toLowerCase()) {    // чи такий лейбл вже є на графіку
            return true;
        }
    }
    return false;
}

/**
 * повертає індекс графіку для слова, який був змінений
 * @param previousLabel - попередній підпис до лінії графіку
 * @returns {number} - індекс даних графіку, які були змінені
 */
function changedItemIndex(previousLabel) {
    for (var i = 0; i < data.length; i++) {
        if (data[i]['label'].toLowerCase() == previousLabel.toLowerCase()) {    // чи такий лейбл вже є на графіку
            return i;
        }
    }
    return -1;
}

/**
 * загружає графік слів
 * @param $control
 * @returns {boolean}
 */
function loadChart($control) {
    /**
     * виводить помилку біля інпуту
     * @param msg - текст помилки
     */
    function showError(msg) {
        var $wordInput = $control.find('.word-input');  // находить інпут
        $wordInput.attr('title', msg);  // ставить тайтл для тултіпу
        $wordInput.tooltip({    // змінює позицію інпуту з стандартної
            position: {my: 'left+15 center', at: 'right center'}
        }).off(['mouseover mouseout', 'focusin focusout']);
        $wordInput.tooltip('open'); // програмно показує тултіп
        $control.addClass('has-error'); // добавляє клас з червоними рамками для інпуту і селекту
    }

    var $wordInput = $control.find('.word-input');  // знаходить інпут
    var word = $wordInput.val();    // бере його значення
    if (!word) {    // якщо значення немає
        showError('Введіть слово, щоб побудувати графік.'); // показує помилку
        return false;
    }
    var $siteSelect = $control.find(".site-select");    // знаходить селектор сайтів
    var siteId = $siteSelect.val(); // бере ід вибраного сайту
    var siteName = $siteSelect.find('option:selected').data('name');    // бере назву вибраного сайту
    var dateFrom = $("#datepicker-from").datepicker('getDate'); // бере дату початку
    var dateTo = $("#datepicker-to").datepicker('getDate'); // бере дату кінця

    // AJAX запит на кількості слів
    $.ajax({
        url: "/word-counts/" + word.toLowerCase() + "/" + siteId + '?date-from=' + dateToAPIFormat(dateFrom) + '&date-to=' + dateToAPIFormat(dateTo),
        success: function (response) {  // у разі успішного запиту
            var series = {  // дані для графіку
                data: [],
                label: siteId ? word + " (" + siteName + ")" : word + " (всі видання)"  // лейбл для графіку
            };
            if (response.length) {  // якщо прийшов не пустий масив
                $.each(response, function (i, val) {
                    series['data'].push([new Date(val['date']).getTime(), val['count']]);   // заповнюєм дані для графіку
                });

                if (!isAlreadyPlotted(series)) {    // якщо графік для слова ще не побудований
                    var chartIndex = changedItemIndex($wordInput.attr('data-previous') + ' (' + $siteSelect.attr('data-previous') + ')');   // індекс графіку для слова, яке змінив юзер
                    if (chartIndex == -1) { // якщо юзер не змінював слова
                        data.push(series);  // добавляєм дані для слова до масиву всіх даних
                    } else {    // якщо юзер змінив слово
                        data[chartIndex] = series;  // заміняє дані для цього слова
                    }
                    plot(); // перебудовує графік
                    $wordInput.attr('data-previous', word); // запам'ятовує поточне слово
                    $siteSelect.attr('data-previous', siteId ? siteName : 'всі видання');   // запам'ятовує поточний сайт

                    try {   // ховає повідомлення про помилку
                        $wordInput.removeAttr('title');
                        $wordInput.tooltip('destroy');
                        $control.removeClass('has-error');
                    } catch (e) {
                    }
                } else {    // якщо графік для слова вже побудований
                    showError('Графік для слова вже побудований.');
                }
            } else {    // якщо даних для слова немає
                showError('Не вдається побудувати графік для слова.');
            }
        },
        error: function () {    // якщо сталася помилка на сервері
            showError('Не вдається побудувати графік для слова.')
        }
    });
}

/**
 * повністю перезагружає графік (використовується при зміні дат на дейтпікерах)
 */
function reloadChart() {
    window.data = [];   // обнуляє масив всіх даних для графіка
    $('.control').each(function (i, control) {  // для кожного слова з контролів
        loadChart($(control));  // будує графік
    });
}

/**
 * будує графік
 */
function plot() {
    var $chart = $("#word-count-chart");
    // побудова графіка
    $.plot($chart, window.data,
        {
            // вісь абсцис
            xaxis: {
                mode: "time",   // відображає дати на осі
                minTickSize: [1, "day"] // мінімальний інтервал
            },
            // вісь ординат
            yaxis: {
                min: 5  // мінімальне значення
            },
            // дані
            series: {
                shadowSize: 0,  // розмір тіней
                points: {show: true},   // показує точки на графіку
                lines: {show: true} // показує лінії
            },
            // сітка
            grid: {
                hoverable: true // показує тултіп при наведенні
            }
        });

    // настройки тултіпа для графіка
    $("<div id='tooltip'></div>").css({
        position: "absolute",
        display: "none",
        border: "1px solid #fdd",
        padding: "2px",
        "background-color": "#fee",
        opacity: 0.80
    }).appendTo("body");
}

/**
 * показує або ховає кнопку для видалення слова з графіку
 */
function showRemoveButton() {
    if ($(".control").length == 1) {    // якщо слів більше ніж одне
        $(".remove-chart-btn").hide();
    } else {
        $(".remove-chart-btn").show();
    }
}

$(document).ready(function () {
    $('body').css('overflowY', 'scroll');
    var $chart = $("#word-count-chart");
    $chart.height($chart.width() * 9 / 16); // висота поля для графіка
    // побудова пустого графіка
    $.plot($chart, [[]], {
        // вісь абсцис
        xaxis: {
            mode: "time",    // відображає дати на осі
            minTickSize: [1, "day"],    // мінімальний інтервал
            min: startDate, // мінімальне значення
            max: yesterday()    // максимальне значення
        },
        // вісь ординат
        yaxis: {
            min: 5, // мінімальне значення
            max: 20 // максимальне значення
        }
    });

    $("#datepicker-from").datepicker({
        defaultDate: startDate, // дата по замовчуванню
        minDate: startDate, // мінімальна дата, яку можна вибрати, 23 листопада 2016
        maxDate: yesterday(),   // максимальна дата, яку можна вибрати
        dateFormat: "DD, d MM, yy", // формат відображення дати
        showOtherMonths: true,  // чи показувати місяці крім поточного
        selectOtherMonths: true,    // чи можна вибирати дати з місяців крім поточного
        onSelect: function (dateText, inst) {   // подія на зміну вибраного дня
            $("#datepicker-to").datepicker('option', 'minDate', $("#datepicker-from").datepicker('getDate'));   // обмежує мінімальну дату в дейтпікері кінцевої дати
            reloadChart();
        }
    }).datepicker("setDate", startDate);
    $("#datepicker-to").datepicker({
        defaultDate: yesterday(),   // дата по замовчуванню
        maxDate: yesterday(),   // максимальна дата, яку можна вибрати
        dateFormat: "DD, d MM, yy", // формат відображення дати
        showOtherMonths: true,  // чи показувати місяці крім поточного
        selectOtherMonths: true,    // чи можна вибирати дати з місяців крім поточного
        onSelect: function (dateText, inst) {
            $("#datepicker-from").datepicker('option', 'maxDate', $("#datepicker-to").datepicker('getDate'));   // обмежує максимальну дату в дейтпікері початкової дати
            reloadChart();
        }
    }).datepicker("setDate", yesterday());

    // подія на клік кнопки побудувати графік
    $(document).on('click', '.plot-chart-btn', function () {
        loadChart($(this).parent());
    });

    // подія на зміну сайту в селекторі сайтів
    $(document).on('change', '.site-select', function () {
        if ($(this).siblings('.word-input').val()) {
            loadChart($(this).parent());
        }
    });

    // подія на натиснення клавіші в інпуті для слова
    $(document).on('keypress', '.word-input', function (e) {
        // перевірка, чи клавіша - Enter і чи введене слово
        if (e.which == 13 && $(this).val()) {
            loadChart($(this).parent());
        }
    });

    // подія на клік кнопки видалити графік
    $(document).on('click', '.remove-chart-btn', function () {
        var $control = $(this).parent();
        var word = $control.find(".word-input").val();  // знаходить інпут і бере його значення
        var site = $control.find(".site-select option:selected").text().trim(); // бере назву вибраного сайту
        if (site == 'Всі видання') {
            site = site.toLowerCase();
        }
        var label = word + ' (' + site + ')';   // робить з назви сайту і слова лейбл для графіку
        $control.remove();  // видаляє контрол
        showRemoveButton();

        // шукає дані, які треба видалити і видаляє їх
        for (var i = 0; i < window.data.length; i++) {
            if (window.data[i]['label'] == label) {
                window.data[i]['label'] = "";   // видаляє лейбл графіка
                window.data[i]['data'] = [];    // видаляє дані для графіка
            }
        }
        // перебудовує графік
        plot();
    });

    // подія на наведення мишки на графік графіка
    $(document).on("plothover", $chart, function (event, pos, item) {
        // будує тултіп для графіка
        if (item) {
            var date = new Date(item.datapoint[0]); // бере дату, на яку зараз наведена мишка
            var x = date.getDate() + " " + ukrDate["monthNames"][date.getMonth()];
            var y = item.datapoint[1];

            $("#tooltip").html(x + "<br>" + y + " згадувань")
                .css({top: item.pageY + 5, left: item.pageX + 5})
                .fadeIn(200);
        } else {
            $("#tooltip").hide();
        }
    });

    // подія на клік кнопки добавити новий графік
    $("#add-chart-control").click(function () {
        // добавляє новий контрол
        $('.control').eq(-1).clone().appendTo('#control-panel');
        var $newControl = $('.control').eq(-1);
        $newControl.find('.word-input').val('').attr('data-previous', '');
        $newControl.find('.site-select').val('').attr('data-previous', 'всі видання');
        $newControl.removeClass('has-error');
        showRemoveButton();
    });
});