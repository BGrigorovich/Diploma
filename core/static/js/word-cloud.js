var trends;
var sites;
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
    var words = $(".word");
    var isIntersects = false;
    [].forEach.call(words, function (word) {
        if (isTwoRectanglesIntersects(word.offsetLeft, word.offsetWidth + 10, word.offsetTop, word.offsetHeight + 10, left, width + 10, top, height + 10)) {
            isIntersects = true;
        }
    });
    return isIntersects;
}

function testIntersectsByAxis() {
    // true
    console.log(isIntersectsByAxis(2, 4, 0, 3)); // x
    console.log(isIntersectsByAxis(1, 3, 0, 2)); // y

    console.log(isIntersectsByAxis(2, 4, 4, 3)); // x
    console.log(isIntersectsByAxis(1, 3, 0, 2)); // y

    console.log(isIntersectsByAxis(2, 4, 0, 3)); // x
    console.log(isIntersectsByAxis(1, 3, 3, 2)); // y

    console.log(isIntersectsByAxis(2, 4, 4, 3)); // x
    console.log(isIntersectsByAxis(1, 3, 3, 2)); // y

    // false
    console.log(isIntersectsByAxis(1, 3, 10, 2));

}

function putTrend(wordText, font) {
    var wordCloud = $("#word-cloud-container");
    wordCloud.height(wordCloud.width() * 9 / 16);
    var word = $("<div></div>");
    wordCloud.append(word);
    word.text(wordText);
    word.css("font-size", font + "px;");
    word.addClass("new-word");  // doesn't work without it
    //console.log(word);
    console.log(word.offsetHeight);
    do {
        var left = Math.floor(Math.random() * (wordCloud.width() - word.width()));
        var top = Math.floor(Math.random() * (wordCloud.height() - word.height()));
    } while (isIntersectsWithWords(left, word.width(), top, word.height()));

    word.css({"left": left + "px", "top": top + "px", "font-size": font + "px"});
    word.removeClass("new-word");
    word.addClass("word");
}

function putArticle(article, $articleContainer) {
    var articleDiv = $("<div></div>");
    articleDiv.addClass("article");
    articleDiv.html("<p><a href='" + article.link + "' target='_blank'>" + article.title + "</a></p>");
    $articleContainer.append(articleDiv);
}

function loadSitesSelect() {
    $.ajax({
        url: "/sites?parse=true",
        async: false,
        success: function (response) {
            window.sites = response;
        }
    });
    $.each(sites, function (index, site) {
        $('#site-select').append($("<option></option>")
            .attr("value", site.name)
            .text(site.name));
    });
}

function loadArticles(word) {
    var site = $("option:selected").val();
    $(".article").remove();
    $.ajax({
        url: "/articles?published=" + dateToAPIFormat($("#datepicker").datepicker('getDate')) + "&site__name=" + site + "&text__icontains=" + word,
        async: false,
        success: function (response) {
            window.articles = response;
        }
    });
    var $articleContainer = $("#articles-container");
    $articleContainer.css('display', 'block');
    $.each(articles, function (index, article) {
        putArticle(article, $articleContainer);
    });
}


function getLargestProb() {
    var trendsArr = Object.keys(trends).map(function (key) {
        return trends[key];
    });
    return Math.max.apply(null, trendsArr);
}

function getKyeWithMaxValue(dict) {
    return Object.keys(dict).reduce(function (a, b) {
        return dict[a] > dict[b] ? a : b
    });
}


function yesterday() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

function dateToAPIFormat(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function loadWordCloud() {
    var date = $("#datepicker").datepicker('getDate');
    var site = $("option:selected").val();

    $(".word, .new-word").remove(); // I don't know why, but .new-word should be removed too
    $.ajax({
        url: "/trends/" + dateToAPIFormat(date) + "/" + site,
        async: false,
        success: function (response) {
            window.trends = response;
        }
    });

    var maxFontSize = 40;
    var largestProb = getLargestProb();
    for (var key in trends) {
        trends[key] = Math.ceil(trends[key] / largestProb * maxFontSize);
    }
    for (var i = Object.keys(trends).length - 1; i >= 0; i--) {
        var k = getKyeWithMaxValue(trends);
        putTrend(k, trends[k]);
        delete trends[k];
    }

    $(".word").click(function () {
        loadArticles($(this).text());
    });
}

function loadDatePicker() {
    $("#datepicker").datepicker({
        defaultDate: yesterday(),
        maxDate: yesterday(),
        dateFormat: "DD, d MM, yy",
        showOtherMonths: true,
        selectOtherMonths: true,
        onSelect: function (dateText, inst) {
            loadWordCloud();
        }
    }).datepicker("setDate", yesterday());
}

$(document).ready(function () {
    loadDatePicker();
    loadSitesSelect();
    loadWordCloud();

    $('#site-select').change(function () {
        loadWordCloud();
    });
});

$.datepicker.regional['ua'] = ukrDate;
$.datepicker.setDefaults($.datepicker.regional['ua']);
