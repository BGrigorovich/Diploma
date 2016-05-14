var data = [];
var sites = [];

function loadSiteSelect() {
    $.each($(".site-select"), function () {
        var siteSelect = $(this);
        if (siteSelect.find("option").length != sites.length + 1) {
            $.each(sites, function (index, site) {
                siteSelect.append($("<option></option>")
                    .attr("value", site.name)
                    .text(site.name));
            });
        }
    });
}

function alreadyPlotted(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]['label'] == item['label']) {
            return true;
        }
    }
    return false;
}

function getChartData(word, site) {
    $.ajax({
        url: "/word-counts/" + word + "/" + site,
        async: false,
        success: function (response) {
            var series = {
                data: [],
                label: site ? word + " (" + site + ")" : word + " (всі видання)"
            };
            if (response.length) {
                $.each(response, function (i, val) {
                    series['data'].push([new Date(val['date']).getTime(), val['count']]);
                });

                if (!alreadyPlotted(data, series)) {
                    data.push(series);
                    loadChart();
                }
            }
        }
    });
}

function loadChart() {
    var chart = $("#word-count-chart");
    $.plot(chart, window.data,
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

    chart.bind("plothover", function (event, pos, item) {
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
}

function showRemoveButton() {
    if ($(".control").length == 1) {
        $(".remove-chart-control").hide();
    } else {
        $(".remove-chart-control").show();
    }
}

function loadControls() {
    // todo: remove previous chart before build new (update data series)
    //(function () {
    //var previous;
    //$.each($(".site-select"), function () {
    //    $(this).focus(function() {
    //        console.log(1);
    //    });
    //});
    $(".site-select").on("focus", function () {
        console.log($(this).val());
        //var previous = $(this).val();
    });
    //.bind("change", function () {
    //    console.log($(this).prev());
    //    $(this).blur();
    //    previous = $(this).val();
    //var word = $(this).parent().siblings("label").children(".word-input").val();
    //if (word) {
    //    getChartData(word, $(this).val());
    //}
    //});
    //})();
    $(".word-input").bind("change", function () {
        var site = $(this).siblings(".site-select").val();
        getChartData($(this).val(), site);
    });

    $(".remove-chart-control").bind("click", function () {
        var $control = $(this).parent();
        var word = $control.find(".word-input").val();
        var site = $control.find(".site-select").val();
        var label = site ? word + " (" + site + ")" : word + " (всі видання)";
        $control.remove();
        showRemoveButton();

        for (var i = 0; i < window.data.length; i++) {
            console.log(label);
            if (window.data[i]['label'] == label) {
                window.data[i]['label'] = "";
                window.data[i]['data'] = [];
            }
        }
        console.log(window.data);
        loadChart();
    });
}

function initialize() {
    $('body').css('overflowY', 'scroll');
    $.ajax({
        url: "/sites?parse=true",
        async: false,
        success: function (response) {
            window.sites = response;
        }
    });

    var chart = $("#word-count-chart");
    chart.height(chart.width() * 9 / 16);
    $.plot(chart, [[]], {});
    loadControls();
    loadSiteSelect();

    $("#add-chart-control").click(function () {
        $(".control-panel").append(
            '<p>\
                <div class="control form-inline">\
                    <label>Видання:</label>\
                        <select class="site-select form-control">\
                            <option value="">Всі видання</option>\
                        </select>\
                    <label>Слово:</label>\
                        <input type="text" class="word-input form-control">\
                    <button type="button" class="btn btn-warning badge remove-chart-control"><i\
                            class="glyphicon glyphicon-remove"></i></button>\
                    <br>\
                </div>\
            </p>');
        loadSiteSelect();
        loadControls();
        showRemoveButton();
    });
}


$(document).ready(function () {
    initialize();
});