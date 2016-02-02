var timeData = {},
    timeData2 = {},
    arr = [],
    arr2 = [],
    sideCounter = 0,
    queryCounter = 1,
    offset = 0,
    dateArr = [];

// build a set of elements with a container and two internal elements
function buildEl (elContainer, el1, el2) {
  elContainer.append(el1, el2)
  return elContainer;
}

// rgb gradient generation based on min and max from data set
function rgb (value, minValue, maxValue) {
  var ratio = 2 * (value - minValue) / (maxValue - minValue),
  b = Math.floor(Math.max( 0, 255 * (1 - ratio))),
  r = Math.floor(Math.max( 0, 255 * (ratio - 1))),
  g = 255 - b - r;
  return ( "rgb("+ r + ", " + g + ", " + b + ")")
}

for (var i = 0; i < 7; i++) {
  // create two objects to store two sets with each weekday and every hour of the day
  timeData[i] = {};
  timeData2[i] = {};
  for (var j = 0; j < 24; j++) {
    timeData[i][j] = 0;
    timeData2[i][j] = 0;
    // create a container and two internal tile divs and append it to the dom
    var $tdEl = $("<td/>", {
          "class": "day"
        }),
        $frontDiv = $("<div/>", {
          "class": "front-div d"+i+"t"+j
        }),
        $backDiv = $("<div/>", {
          "class": "back-div d"+i+"t"+j,
        }),
        $el = buildEl ($tdEl, $frontDiv, $backDiv);
        $(".day"+i).append($el);
  }
}

function getData (offsetAmount) {
  var query,
      timeDataObject,
      tileSide1,
      tileSide2,
      arraySelection,
      max,
      min;
  // update the sideCounter
  sideCounter +=1;
  // set the side of the tile to manipulate and which array and object containing time data to access
  sideCounter % 2 ? (
    timeDataObject=timeData,
    tileSide1 = ".front-div",
    tileSide2 = ".back-div",
    arraySelection = arr
  ) : (
    timeDataObject=timeData2,
    tileSide1 = ".back-div",
    tileSide2 = ".front-div",
    arraySelection = arr2
  );

  // alter url query depending on whether or not results need to be offset
  if (offsetAmount > 0) {
    query = "https://data.seattle.gov/resource/3k2p-39jp.json?$select=event_clearance_date&$where=within_circle(incident_location,%2047.595420,%20-122.331602,%201609.34) AND event_clearance_date > '2015-1-01T00:00:00'&$limit=2500&$offset="+offsetAmount;
  }
  else {
    query = "https://data.seattle.gov/resource/3k2p-39jp.json?$select=event_clearance_date&$where=within_circle(incident_location,%2047.595420,%20-122.331602,%201609.34) AND event_clearance_date > '2015-1-01T00:00:00'&$limit=2500";
  }
  // make the ajax request
  $.get( query , function (data) {

  }).done(function (data) {
    data.forEach(function (event, index){
      /* iterate over each result and create a JS date object to get the day of the week and hour of the day. 
      Day and hour are zero indexed. Assign each value to the previously determined storage object.
      Create new property object or set value to 0 if necessary
      */
      var date = new Date(event.event_clearance_date),
          day = date.getUTCDay(),
          hour = date.getUTCHours();
          dateArr.push(date);
      if (timeDataObject[day]) { 
        // timeDataObject = the object storing the time and day data
        if (timeDataObject[day][hour]) {
          timeDataObject[day][hour] = timeDataObject[day][hour] + 1;
        }
        else {
          timeDataObject[day][hour] = 1;
        }
      }
      else {
        timeDataObject[day] = {};
        timeDataObject[day][hour] = 1;
      }
    });

    // check for min or max in an array. arrayEnd = 1 for max and = 0 for min
    function calcExtremes (arr) {
        max = Math.max(...arr);
        min = Math.min(...arr);
    }

    //clear the min/max array
    arraySelection.length = 0;

    //add each value into an array to check for min and max
    Object.keys(timeDataObject).forEach(function (dayData) {
      Object.keys(timeDataObject[dayData]).forEach(function (hourData, index) {
        arraySelection.push(timeDataObject[dayData][hourData]);
        if ( (index + 1) == Object.keys(timeDataObject[dayData]).length ) {
          // find and assign max and min values in array
          calcExtremes(arraySelection);
        }
      });
    });


    Object.keys(timeDataObject).forEach(function (dayData) {
        Object.keys(timeDataObject[dayData]).forEach(function (hourData) {
          // iterate through each data point in the objects and add the proper text, animation and color
          var selector1 = ".d" + dayData + "t" + hourData + tileSide1,
              selector2 = ".d" + dayData + "t" + hourData + tileSide2,
              color = rgb( timeDataObject[dayData][hourData], min, max );
          $(selector1).text(timeDataObject[dayData][hourData]).css({"animation": "spinFront .4s " + (((hourData/10) + 0.3) + (dayData/10)) +"s both", "background":  color});
          $(selector2).css({"animation": "spinBack .4s " + (((hourData/10) + 0.3) + (dayData/10)) +"s both"});
        });
    });

  })
}

$(document).ready(function () {
  getData(0);
});


$(".next-time").click(function () {
  offset += 2500;
  queryCounter += 1;
  if (queryCounter > 1 ) {
    $(".prev-time").show();
  }
  getData(offset);
});

$(".prev-time").click(function () {
  offset -= 2500;
  queryCounter -= 1;
  if (queryCounter == 1 ) {
    $(".prev-time").hide();
  }
  getData(offset);
});