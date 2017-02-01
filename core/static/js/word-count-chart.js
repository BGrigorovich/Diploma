var data = [];

/**
 * перевіряє, чи графік для слова вже побудований
 * @param item - дані для побудови графіку
 * @returns {boolean} - чи графік слова вже побудований
 */
function isAlreadyPlotted(item) {
    for (var i = 0; i < data.length; i++) {
        if (data[i]['label'].toLowerCase() == item['label'].toLowerCase()) {
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
        if (data[i]['label'].toLowerCase() == previousLabel.toLowerCase()) {
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
    function showError(msg) {
        var $wordInput = $control.find('.word-input');
        $wordInput.attr('title', msg);
        $wordInput.tooltip({
            position: {my: 'left+15 center', at: 'right center'}
        }).off(['mouseover mouseout', 'focusin focusout']);
        $wordInput.tooltip('open');
        $control.addClass('has-error');
    }

    var $wordInput = $control.find('.word-input');
    var word = $wordInput.val();
    if (!word) {
        showError('Введіть слово, щоб побудувати графік.');
        return false;
    }
    var $siteSelect = $control.find(".site-select");
    var siteId = $siteSelect.val();
    var siteName = $siteSelect.find('option:selected').data('name');
    var dateFrom = $("#datepicker-from").datepicker('getDate');
    var dateTo = $("#datepicker-to").datepicker('getDate');

    $.ajax({
        url: "/word-counts/" + word.toLowerCase() + "/" + siteId + '?date-from=' + dateToAPIFormat(dateFrom) + '&date-to=' + dateToAPIFormat(dateTo),
        success: function (response) {
            var series = {
                data: [],
                label: siteId ? word + " (" + siteName + ")" : word + " (всі видання)"
            };
            if (response.length) {
                $.each(response, function (i, val) {
                    series['data'].push([new Date(val['date']).getTime(), val['count']]);
                });

                if (!isAlreadyPlotted(series)) {
                    var chartIndex = changedItemIndex($wordInput.attr('data-previous') + ' (' + $siteSelect.attr('data-previous') + ')');
                    if (chartIndex == -1) {
                        data.push(series);
                    } else {
                        data[chartIndex] = series;
                    }
                    plot();
                    $wordInput.attr('data-previous', word);
                    $siteSelect.attr('data-previous', siteId ? siteName : 'всі видання');

                    try {
                        $wordInput.removeAttr('title');
                        $wordInput.tooltip('destroy');
                        $control.removeClass('has-error');
                    } catch (e) {
                    }
                } else {
                    showError('Графік для слова вже побудований.');
                }
            } else {
                showError('Не вдається побудувати графік для слова.');
            }
        },
        error: function () {
            showError('Не вдається побудувати графік для слова.')
        }
    });
}

/**
 * повністю перезагружає графік (використовується при зміні дат на дейтпікерах)
 */
function reloadChart() {
    window.data = [];
    $('.control').each(function (i, control) {
        loadChart($(control));
    });
}

/**
 * будує графік
 */
function plot() {
    var $chart = $("#word-count-chart");
    $.plot($chart, window.data,
        {
            xaxis: {
                mode: "time",
                minTickSize: [1, "day"]
            },
            yaxis: {
                min: 5
            },
            series: {
                shadowSize: 0,
                points: {show: true},
                lines: {show: true}
            },
            grid: {
                hoverable: true
            }
        });

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
    if ($(".control").length == 1) {
        $(".remove-chart-btn").hide();
    } else {
        $(".remove-chart-btn").show();
    }
}

$(document).ready(function () {
    $('body').css('overflowY', 'scroll');
    var $chart = $("#word-count-chart");
    $chart.height($chart.width() * 9 / 16);
    $.plot($chart, [[]], {
        xaxis: {
            mode: "time",
            minTickSize: [1, "day"],
            min: startDate,
            max: yesterday()
        },
        yaxis: {
            min: 5,
            max: 20
        }
    });

    $("#datepicker-from").datepicker({
        defaultDate: startDate,
        minDate: startDate,
        maxDate: yesterday(),
        dateFormat: "DD, d MM, yy",
        showOtherMonths: true,
        selectOtherMonths: true,
        onSelect: function (dateText, inst) {
            $("#datepicker-to").datepicker('option', 'minDate', $("#datepicker-from").datepicker('getDate'));
            reloadChart();
        }
    }).datepicker("setDate", startDate);
    $("#datepicker-to").datepicker({
        defaultDate: yesterday(),
        maxDate: yesterday(),
        dateFormat: "DD, d MM, yy",
        showOtherMonths: true,
        selectOtherMonths: true,
        onSelect: function (dateText, inst) {
            $("#datepicker-from").datepicker('option', 'maxDate', $("#datepicker-to").datepicker('getDate'));
            reloadChart();
        }
    }).datepicker("setDate", yesterday());

    $(document).on('click', '.plot-chart-btn', function () {
        loadChart($(this).parent());
    });

    $(document).on('change', '.site-select', function () {
        if ($(this).siblings('.word-input').val()) {
            loadChart($(this).parent());
        }
    });

    $(document).on('keypress', '.word-input', function (e) {
        if (e.which == 13 && $(this).val()) {
            loadChart($(this).parent());
        }
    });

    $(document).on('click', '.remove-chart-btn', function () {
        var $control = $(this).parent();
        var word = $control.find(".word-input").val();
        var site = $control.find(".site-select option:selected").text().trim();
        if (site == 'Всі видання') {
            site = site.toLowerCase();
        }
        var label = word + ' (' + site + ')';
        $control.remove();
        showRemoveButton();

        for (var i = 0; i < window.data.length; i++) {
            if (window.data[i]['label'] == label) {
                window.data[i]['label'] = "";
                window.data[i]['data'] = [];
            }
        }
        plot();
    });

    $(document).on("plothover", $chart, function (event, pos, item) {
        if (item) {
            var date = new Date(item.datapoint[0]);
            var x = date.getDate() + " " + ukrDate["monthNames"][date.getMonth()];
            var y = item.datapoint[1];

            $("#tooltip").html(x + "<br>" + y + " згадувань")
                .css({top: item.pageY + 5, left: item.pageX + 5})
                .fadeIn(200);
        } else {
            $("#tooltip").hide();
        }
    });

    $("#add-chart-control").click(function () {
        $('.control').eq(-1).clone().appendTo('#control-panel');
        var $newControl = $('.control').eq(-1);
        $newControl.find('.word-input').val('').attr('data-previous', '');
        $newControl.find('.site-select').val('').attr('data-previous', 'всі видання');
        $newControl.removeClass('has-error');
        showRemoveButton();
    });
});