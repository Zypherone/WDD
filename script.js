/**
 * Config section
 * Update this section to change any configurations below
*/

var appParam = '';

var apiKey   = '469a1bcd8ede3e2121d54a82776ffc16',
    appUnit  = 'metric',
    endPoint = 'https://api.openweathermap.org/data/2.5/{PAGE}?appid=' + apiKey,
    iconURL  = 'https://openweathermap.org/img/wn/{ICON}@2x.png';

var localCoords = '',
    search      = '';

function success(position) {
  const latitude  = position.coords.latitude;
  const longitude = position.coords.longitude;

  localCoords = '&lat=' + latitude + '&lon=' + longitude;

  getWeatherData(true); 
}

/**
 * Throw a default for geolocation error.
 */
function error() {
  search = 'New York, US';
  getWeatherData(true); 
}

if (!navigator.geolocation) {
  // Prepare a nicer error statement
  //status.textContent = 'Geolocation is not supported by your browser';
} else {
  navigator.geolocation.getCurrentPosition(success, error);
}

// END CONFIG SECTION

var queryURL = endPoint;

/**
 * Build an UV index to provide different levels of extremity
 */

var uvColorIndex = [
  /* 0 */ { green: 'low' }, 
  /* 1 */ { green: 'low' },
  /* 2 */ { green: 'low' },
  /* 3 */ { yellow: 'moderate' },
  /* 4 */ { yellow: 'moderate' },
  /* 5 */ { yellow: 'moderate' },
  /* 6 */ { orange: 'high' },
  /* 7 */ { orange: 'high' },
  /* 8 */ { red: 'very high' },
  /* 9 */ { red: 'very high' },
  /* 10 */ { red: 'very high' },
  /* 11+ */ { violet: 'extreme' }
]



var template = {
  info: {
    location: $('<h2>'),
    temperature: $('<span>')
      .attr('data-data', 'Temperature')
      .attr('data-scale', '°C'),
    humidity: $('<span>')
      .attr('data-data', 'Humidity')
      .attr('data-scale', '%'),
    windSpeed: $('<span>')
      .attr('data-data', 'Wind Speed')
      .attr('data-scale', 'kh/m'),
    uvIndex: $('<span>').attr('data-data', 'UV Index')
  },
  forecast: function() {
    return {
      info: $('<li>'),
      date: $('<span class="forecast-date">'),
      temp: $('<span>')
        .attr('data-data', 'Temp')
        .attr('data-scale', '°C'),
      humidity: $('<span>')
        .attr('data-data', 'Humd')
        .attr('data-scale', '%')
    }
  }
}

var apiCall = ['forecast', 'weather'];

/**
 * Fetch data from API.
 * @param {*} local 
 */

function getWeatherData(local) {

  var data = {};

  var param,
      complete = false;

  // Prepare api param for weather api
  apiCall.forEach(callApi);

  function callApi(page) {
    switch(page) {
      case 'weather':
      case 'forecast':
        param = (local === true ? localCoords : '&q=' + search) + '&units=metric';
      break;
    }

    callbackWeather(page);
  }

  /**
   * Make api call
   * @param {*} page 
   * @param {*} complete 
   */
  function callbackWeather(page, complete) {

    $.ajax({
      // Correct queryURI based on the api page needed to be accessed.
      url: queryURL.replace('{PAGE}', page) + param,
      method: "GET"
    })
    .then(function(response) {
    
      if (response.city) {
        // Lets get the UV index by setting new param and fetching from the API
        param = '&lat=' + response.city.coord.lat + '&lon=' + response.city.coord.lon;
        callbackWeather('uvi', true);
      }

      data[page] = response;

      if (complete === true) {
        buildWeatherData();
      }

    });

  }

  /**
   * Construct the weather dashdboard.
   */
  function buildWeatherData() {

    // Empty out existing data from dashboard
    $('#weather-detailed').empty();

    // Apply city location, name and date. Moment.js for date formatting
    template.info.location.html(
      data.weather.name +
      ', ' +
      data.weather.sys.country +
      ' (' +
        moment(data.weather.dt, 'X').format('llll') +
      ')'
    );
    
    // Apply temp and humidity
    template.info.temperature.html(data.weather.main.temp);
    template.info.humidity.html(data.weather.main.humidity);

    /**
     * Need implement a nicer rounded value with decimal placement.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
     * 
     * Apply wind speed
     */
    template.info.windSpeed.html(Math.floor(data.weather.wind.speed *1.609344));

    // Prepare icon and set.
    var imageIcon = iconURL.replace('{ICON}', data.weather.weather[0].icon);

    // Take reference of uvIdx array to apply.
    var uvIdx = Math.floor(data.uvi.value);
        uvIdx = uvIdx > 11 ? 11 : uvIdx;
    var uvColor = Object.keys(uvColorIndex[uvIdx])[0];
    
    /**
     * Build a basic template structure for the dashboard.
     */
    template.info.uvIndex
      .html('')
      .attr('data-index-color', uvColor)
      .append(
        $('<a>')
          .html(data.uvi.value)
          .attr('style', 'background-color: ' + uvColor)
          .attr('href', 'https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage')
          .attr('target', '_blank')
          .attr('title', uvColorIndex[uvIdx][uvColor])
      );

    $('#weather-detailed')
    .attr('style', 'background-image: url("' +  imageIcon + '")')
    .attr('data-main', data.weather.weather[0].main)
    .attr('data-desc', data.weather.weather[0].description)
    .append(
      template.info.location,
      template.info.temperature,
      template.info.humidity,
      template.info.windSpeed,
      template.info.uvIndex
    );

    $('#forecast-info').empty();

    // Build the five day forecast
    for(i=0;i<5;i++) {
      
      // Ensure time is calculated by 8, to make 24 hours in a day as data is provided in 3 hour blocks.
      var k = i*8;

      // Obtain forecast template
      var day = template.forecast();     

      var imageIcon = iconURL.replace('{ICON}', data.forecast.list[k].weather[0].icon);

      day.info.append(
        day.date
          .html(moment(data.forecast.list[k].dt_txt).format('ddd (DD/MM)'))
          .attr('style', 'background-image: url(' + imageIcon + ')')
          .attr('title', data.forecast.list[k].dt_txt),
        day.temp.html(data.forecast.list[k].main.temp),
        day.humidity.html(data.forecast.list[k].main.humidity),
      );

      $('#forecast-info')
        .append(day.info);
    }

    // Build History    
    buildSearchHistory(data.weather.name, data.weather.sys.country);
  }

  // Search history function
  function buildSearchHistory(city, country) {
    
    var localData = localStorage.getItem('history');
    var searchObj = localData ? JSON.parse(localData) : [];
    var searchQuery = city + ', ' + country;

    // Check if it exists in the history
    var index = searchObj.indexOf(searchQuery);
    if (index>0) {
      searchObj.slice(index, 1);
      $('#weather-history-results li')[index].remove();
    }

    // Push lasted query into object before storing.
    searchObj.push(searchQuery);

    // Set history into local storage, once data has been turned into a string.
    localStorage.setItem('history', JSON.stringify(searchObj));

    // Push history into the browser.
    var history = $('<li>').html(searchQuery);
    $('#weather-history-results').prepend(history);

  }

}

/**
 * Function to pull last history from localstorage and display to browser.
 */
function showLastHistorySearch() {

  var localData = localStorage.getItem('history');
  var searchObj = localData ? JSON.parse(localData) : [];

  searchObj.forEach(function(key) {
    var history = $('<li>').html(key);
    $('#weather-history-results').prepend(history);
  });
}

/**
 * Init the last history search.
 */
showLastHistorySearch();

/**
 * Prepare all the click events
 */

$(document).on('click', '#weather-history-results li', function() {
  search = $(this).text();
  getWeatherData();
});

// Add ability to press enter for search field.
$('#input-search').keypress(function(event){

  var keycode = (event.keyCode ? event.keyCode : event.which);

  if(keycode == '13'){
    search = $('#input-search').val();
    $('#input-search').val('');
    getWeatherData();
  }
});

$('#input-submit').on('click', function() {
  search = $('#input-search').val();
  $('#input-search').val('');
  getWeatherData();
});