/* jshint esversion: 6 */
function getReport() {
  const report = {
    'accountsPending': {
      'id': 'accounts-pending',
      'title': 'Accounts Pending',
      'class': 'fa fa-user-plus',
      'tooltip': {
        'placement': 'bottom',
        'title': 'The number of accounts that have been created but not yet verified for this collection exercise.',
      },
    },
    'accountsEnrolled': {
      'id': 'accounts-enrolled',
      'title': 'Accounts Enrolled',
      'class': 'fa fa-users',
      'tooltip': {
        'placement': 'bottom',
        'title': 'The number of verified accounts for this collection exercise.',
      },
    },
    'notStarted': {
      'id': 'not-started',
      'title': 'Not Started',
      'class': 'fa fa-times',
      'tooltip': {
        'placement': 'bottom',
        'title': '<strong>eQ</strong>: The number of cases where a questionnaire has not yet been launched. <p /><strong>SEFT</strong>: The number of cases where a collection instrument has not been downloaded.',
      },
    },
    'inProgress': {
      'id': 'in-progress',
      'title': 'In Progress',
      'class': 'fa fa-spinner',
      'tooltip': {
        'placement': 'bottom',
        'title': '<strong>eQ</strong>: The number of cases where a questionnaire has been launched. <p /><strong>SEFT</strong>: The number of cases where a respondent has downloaded a collection instrument but not successfully uploaded the response.',
      },
    },
    'completed': {
      'id': 'completed',
      'title': 'Completed',
      'class': 'fa fa-check',
      'tooltip': {
        'placement': 'bottom',
        'title': '<strong>eQ</strong>: The number of cases where a questionnaire has been successfully submitted and receipted. <p /><strong>SEFT</strong>: The number of cases where a respondent has successfully uploaded a collection instrument.',
      },
    },
    'sampleSize': {
      'id': 'sample-size',
      'title': 'Sample Size',
      'class': 'fa fa-sitemap fa-color-white',
      'tooltip': {
        'placement': 'bottom',
        'title': 'The total number of cases for this collection exercise (excluding dummies sample units).',
      },
    },
  };

  return report;
}

function displayCollectionExerciseData(response, collexID) {
  const report = getReport(response);
  const countersElement = $('#counters');

  countersElement.empty();
  /* eslint-disable */
    for (const figure in report) {
        if (report.hasOwnProperty(figure)) {
            const figureValue =  response.report[figure]
            const figureID = report[figure].id
            const figureClass = report[figure].class
            const figureTitle = report[figure].title

            // let layoutClass = Object.keys(report).length % 2 && figure === "sampleSize" ? "col-lg-12 col-xs-12" : "col-lg-6 col-sm-6 col-xs-12";
            let relativeChange = getRelativeChangeForCollex(collexID, figure, figureValue)

            let figuresBoxLayout = $("<div>", {
                "class": "col-lg-6 col-sm-6 col-xs-12"
            })

            let figuresBoxInner = $("<div>", {
                "class": (figure === 'sampleSize') ? "small-box bg-ons-blue" : "small-box bg-ons-light-blue",
                "id": `${figureID}-box`
            })

            let figuresBoxInnerText = $("<div>", {
                "class": "inner"
            })

            let figuresBoxInnerTextChild1 = $("<h3>", {
                "id": `${figureID}-counter`
            }).text(figureValue)

            let figuresBoxInnerTextChild2 = $("<p>").text(figureTitle)

            let figuresBoxInnerIcon = $("<div>", {
                "class": "icon"
            })

            let figuresBoxInnerIconChild = $("<i>", {
                "class": figureClass
            })

            let figuresBoxFooter = $("<a>", {
                "class": "small-box-footer"
            })

            let figuresBoxFooterIcon = $("<i>", {
                "class": relativeChange.class
            })

            let figuresBoxFooterText = $("<span>", {
                "class": "relative-change-figure"
            }).text(relativeChange.value)

            figuresBoxFooter.append(figuresBoxFooterIcon, figuresBoxFooterText)
            figuresBoxInnerIcon.append(figuresBoxInnerIconChild)
            figuresBoxInnerText.append([figuresBoxInnerTextChild1, figuresBoxInnerTextChild2])
            figuresBoxInner.append([figuresBoxInnerText, figuresBoxInnerIcon, figuresBoxFooter])
            figuresBoxLayout.append(figuresBoxInner)
            countersElement.append(figuresBoxLayout)

            // Adds a minimal bounce animation to each counter
            $(`#${figureID}-counter`).effect("bounce", "slow");

            // Adds a tooltip to each counter
            $(`#${figureID}-box .inner`).tooltip({
                "title": report[figure].tooltip.title,
                "placement": report[figure].tooltip.placement,
                "html": true
            });

        }
    }

    /* eslint-enable */

    const timeUpdated = moment.unix(response.metadata.timeUpdated).calendar(); // eslint-disable-line
  const progress = (response.report.completed / response.report.sampleSize * 100) || 0;

  $('#sample-size-box').removeClass('bg-ons-light-blue').addClass('bg-ons-blue');
  $('#progress-uploaded').text(response.report.completed);
  $('#time-updated').text(timeUpdated);
  $('#progress-size').text(response.report.sampleSize);
  $('#collex-progress').css('width', `${progress}%`);

  if (progress >= 2) {
    $('#collex-progress').text(`${progress.toFixed()}%`);
  } else {
    $('#collex-progress').empty();
  }
}

function callAPI(doRefresh=true) {
  const collexID = $('#collex-id').data('collex');
  const surveyID = $('#collex-id').data('survey');
  const reportingRefreshCycleInSeconds = $('#collex-id').data('reporting-refresh-cycle');

  $.ajax({
    dataType: 'json',
    url: `/dashboard/reporting/survey/${surveyID}/collection-exercise/${collexID}`,
  }).done((result) => {
    $('.content-header').show();
    $('.content').show();
    $('#error-reporting').hide();
    $('#loading').hide();
    $('#time-updated-label').show();

    storeDataToLocalStorage(result);
    displayCollectionExerciseData(result, collexID);
    displayResetFigureButton();
  }).fail((result) => {
    $('#loading').hide();
    $('.content-header').hide();
    $('.content').hide();
    $('#error-reporting').show();
  }).always(() => {
    const validReportingRefreshCycle = reportingRefreshCycleInSeconds >= 5 && reportingRefreshCycleInSeconds <= 604800;

    if (doRefresh && validReportingRefreshCycle) {
      setTimeout(callAPI, reportingRefreshCycleInSeconds * 1000);
    }
  });
}

function storeDataToLocalStorage(figures) {
  const collexID = figures.metadata.collectionExerciseId;
  const Storage = localStorage;

  if (Storage.getItem(collexID) == null) {
    const data = {
      'created_at': figures.metadata.timeUpdated,
      'report': figures.report,
    };
    const stringData = JSON.stringify(data);
    Storage.setItem(collexID, stringData);
  } else {
    for (const value in figures.report) {
      if (['inProgress', 'accountsPending'].includes(value)) {
        const storedData = JSON.parse(Storage.getItem(collexID));
        let storedValue = storedData.report[value];
        const latestValue = figures.report[value];

        if (latestValue > storedValue) {
          storedValue = latestValue;
          const stringData = JSON.stringify(storedData);
          Storage.setItem(collexID, stringData);
        }
      }
    }
  }
}

function getRelativeChangeForCollex(collexID, attribute, currentValue) {
  const values = getStorageItem(collexID);
  const storedValue = values['report'][attribute];
  let relativeChange = {
    value: '',
    class: '',
  };
  if (values && attribute != 'sampleSize') {
    if (['inProgress', 'accountsPending'].includes(attribute)) {
      // relativeChange = {value: storedValue, class: 'fa fa-think-peaks'}
    } else {
      const difference = currentValue - storedValue;
      relativeChange = {
        value: Math.abs(difference),
        class: ((difference < 0) ? 'fa fa-arrow-down' : 'fa fa-arrow-up'),
      };
    }
    return relativeChange;
  } else {
    return relativeChange;
  }
}

function getStorageItem(collexID) {
  const item = localStorage.getItem(collexID);
  return ((item) ? JSON.parse(item) : null);
}

function displayResetFigureButton() {
  Pace.on('done', function() {
    $('#reset-figure-history').show();
  });
}

function resetFigureHistory() {
  const collexID = $('#collex-id').data('collex');
  const Storage = localStorage;
  if (confirm('This will remove all relative data for this collection exercise period?') && Storage.getItem(collexID)) {
    Storage.removeItem(collexID);
    callAPI(false);
  }
}

$(document).ready(() => {
    callAPI(); // eslint-disable-line
});
