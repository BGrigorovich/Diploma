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