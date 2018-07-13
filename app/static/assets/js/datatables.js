function initiliseDataTables() {

    /* eslint-disable */
    const surveyTable = $("#survey-datatable").DataTable({
        paging: true,
        lengthChange: false,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        autoHeight: false,
        scrollY: "30vh",
        scrollCollapse: true,
        scroller: {
            loadingIndicator: false
        }
    });
    /* eslint-enable */

    $("#survey-search").keyup(function() {
        surveyTable.search($(this).val()).draw();
    });

    /* eslint-disable */
    const collexTable = $("#collex-datatable").DataTable({
        paging: true,
        lengthChange: false,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        autoHeight: false,
        scrollY: "30vh",
        scrollCollapse: true,
        scroller: {
            loadingIndicator: false
        },
        data: [],
        columns: [{
            "data": "userDescription",
            "title": "Collection Exercise Period",
            "width": "600px"
        }],
        rowId: 'collectionExerciseId'
    });
    /* eslint-enable */

    $("#collex-search").keyup(function() {
        collexTable.search($(this).val()).draw();
    });

    $("#survey-datatable tbody").on("click", "tr", function() {
        const id = surveyTable.row(this).id();

        if (typeof id !== "undefined") {
            const surveyShortName = $(this).data("survey-short-name");

            $("#chosen-survey").text(surveyShortName);
            $("#modal-survey").modal("toggle");

            if (typeof reporting_url == "undefined") {
                $("#modal-collex").attr('data-backdrop', 'static');
                $("#modal-collex").attr('data-keyboard', 'false');
            }

            loadCollexTableData(collexTable, id);
        }

    });

}

function loadCollexTableData(collexTable, id) {

    const surveys = JSON.parse($('#collex-id').data('surveys'));

    collexTable.clear().draw();
    collexTable.rows.add(get_collex_from_survey_id(surveys, id)).draw();

    $("#modal-collex").modal("toggle");

    $("#collex-datatable tbody").on("click", "tr", function() {
        const id = collexTable.row(this).id();
        const reporting_url = $("#collex-id").data("reporting-url");

        if (typeof id !== "undefined") {
            if (typeof reporting_url == "undefined") {
                window.location.href = 'dashboard/collection-exercise/' + id;
            } else {
                window.location.href = id;
            }

        }
    });
}

function get_collex_from_survey_id(surveys, survey_id) {

    for (let i = 0; i < surveys.length; i++) {
        if (surveys[i].surveyId === survey_id) {
            let collection_exercises = surveys[i].collectionExercises;
            return collection_exercises;
        }
    }
}

$(document).ready(function() {
    initiliseDataTables();
});