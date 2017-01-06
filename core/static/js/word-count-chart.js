var data = [];

function isAlreadyPlotted(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]['label'] == item['label']) {
            return true;
        }
    }
    return false;
}

function getChartData(word, siteId, siteName) {
    $.ajax({
        url: "/word-counts/" + word + "/" + siteId,
        success: function (response) {
            var series = {
                data: [],
                label: siteId ? word + " (" + siteName + ")" : word + " (всі видання)"
            };
            if (response.length) {
                $.each(response, function (i, val) {
                    series['data'].push([new Date(val['date']).getTime(), val['count']]);
                });

                if (!isAlreadyPlotted(data, series)) {
                    data.push(series);
                    loadChart();
                }
            }
        }
    });
}

function loadChart() {
    var $chart = $("#word-count-chart");
    $.plot($chart, window.data,
        {
            xaxis: {
                mode: "time",
                minTickSize: [1, "day"]
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
        $(".remove-chart-control").hide();
    } else {
        $(".remove-chart-control").show();
    }
}

$(document).ready(function () {
    $('body').css('overflowY', 'scroll');
    var $chart = $("#word-count-chart");
    $chart.height($chart.width() * 9 / 16);
    var startDate = new Date('2016-11-23');
    $.plot($chart, [[]], {
        xaxis: {
            mode: "time",
            minTickSize: [1, "day"],
            min: startDate,
            max: yesterday()
        }
    });

    $("#datepicker-from").datepicker({
        defaultDate: startDate,
        minDate: startDate,
        maxDate: yesterday(),
        dateFormat: "DD, d MM, yy",
        showOtherMonths: true,
        selectOtherMonths: true
    }).datepicker("setDate", startDate);
    $("#datepicker-to").datepicker({
        defaultDate: yesterday(),
        maxDate: yesterday(),
        dateFormat: "DD, d MM, yy",
        showOtherMonths: true,
        selectOtherMonths: true
    }).datepicker("setDate", yesterday());

    $(document).on('change', '.word-input', function () {
        var siteId = $(this).siblings(".site-select").val();
        var siteName = $(this).siblings(".site-select").find('option:selected').data('name');
        getChartData($(this).val(), siteId, siteName);
    });

    $(document).on('click', '.remove-chart-control', function () {
        var $control = $(this).parent();
        var word = $control.find(".word-input").val();
        var site = $control.find(".site-select").val();
        var label = site ? word + " (" + site + ")" : word + " (всі видання)";
        $control.remove();
        showRemoveButton();

        for (var i = 0; i < window.data.length; i++) {
            if (window.data[i]['label'] == label) {
                window.data[i]['label'] = "";
                window.data[i]['data'] = [];
            }
        }
        loadChart();
    });

    $(document).on("plothover", $chart, function (event, pos, item) {
        if (item) {
            var date = new Date(item.datapoint[0]);
            var x = date.getDate() + " " + ukrDate["monthNames"][date.getMonth()],
                y = item.datapoint[1];

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
        showRemoveButton();
    });
});