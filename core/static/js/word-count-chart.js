var data = [];

function isAlreadyPlotted(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]['label'].toLowerCase() == item['label'].toLowerCase()) {
            return true;
        }
    }
    return false;
}

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
    $wordInput.attr('data-previous', $wordInput.val());
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
                var $wordInput = $control.find('.word-input');

                if (!isAlreadyPlotted(data, series)) {
                    data.push(series);
                    plot();
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

function reloadChart() {
    window.data = [];
    $('.control').each(function (i, control) {
        loadChart($(control));
    });
}

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

    $(document).on('click', '.build-chart-btn', function () {
        loadChart($(this).parent());
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
        $newControl.find('input').val('');
        $newControl.find('select').val('');
        $newControl.removeClass('has-error');
        showRemoveButton();
    });
});