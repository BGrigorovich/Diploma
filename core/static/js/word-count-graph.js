//function loadChart(word) {
function loadChart(word, site) {

    $.ajax({
        url: "/word-counts/" + word + "/" + site,
        async: false,
        success: function (response) {
            console.log(response);
            var data = [];
            if (response.length) {
                $.each(response, function (i, val) {
                    data.push([new Date(val['date']).getTime(), val['count']]);
                });

                $.plot($("#word-count-graph-container"), [data],
                    {
                        xaxis: {
                            mode: "time",
                            minTickSize: [1, "day"]
                        },
                        series: {
                            shadowSize: 0
                        }
                    });
            }
        }
    });

}


function initialize() {
    var graph = $("#word-count-graph-container");
    graph.height(graph.width() * 9 / 16);
    loadSitesSelect();
    //loadChart();

    var $word = $('#word');
    var $site = $('#site-select');

    $site.change(function () {
        if ($word.val()) {
            loadChart($word.val(), $site.val());
        }
    });

    $word.change(function () {
        loadChart($word.val(), $site.val());
    });
}


$(document).ready(function () {
    initialize();
});