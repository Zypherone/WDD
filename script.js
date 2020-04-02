/**
 * Config section
 * Update this section to change any configurations below
*/

//uvi?lat=37.75&lon=-122.37&

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

  //console.log(`Latitude: ${latitude} °, Longitude: ${longitude} °`);
}

function error() {
  search = 'New York';
  getWeatherData(true); 
  //status.textContent = 'Unable to retrieve your location';
}

if (!navigator.geolocation) {
  //status.textContent = 'Geolocation is not supported by your browser';
} else {
  //status.textContent = 'Locating…';
  navigator.geolocation.getCurrentPosition(success, error);
}

// END CONFIG SECTION

//endPoint = 'https://raw.githubusercontent.com/Zypherone/WDD/master/weather.json';
//var query = '&q=london';
var queryURL = endPoint;// + query;

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
    temperature: $('<span>').attr('data-data', 'Temperature'),
    humidity: $('<span>').attr('data-data', 'Humidity'),
    windSpeed: $('<span>').attr('data-data', 'Wind Speed'),
    uvIndex: $('<span>').attr('data-data', 'UV Index')
  },
  forecast: function() {
    return {
      info: $('<li>'),
      date: $('<span>'),
      temp: $('<span>').attr('data-data', 'Temp'),
      humidity: $('<span>').attr('data-data', 'Humd')
    }
  }
}

var apiCall = ['forecast', 'weather'];

function getWeatherData(local) {

  var data = {};

  var param,
      complete = false;

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

  function callbackWeather(page, complete) {

    $.ajax({
      url: queryURL.replace('{PAGE}', page) + param,
      method: "GET"
    })
    .then(function(response) {
    
      if (response.city) {
        param = '&lat=' + response.city.coord.lat + '&lon=' + response.city.coord.lon;
        callbackWeather('uvi', true);
      }

      data[page] = response;

      if (complete === true) {
        buildWeatherData();
      }

    });

  }

  function buildWeatherData() {

    $('#weather-detailed').empty();

    template.info.location.html(
      data.weather.name +
      ', ' +
      data.weather.sys.country +
      ' (' +
      moment(data.uvi.date_iso).format('llll') +
      ')'
    );
    
    template.info.temperature.html(data.weather.main.temp + '&#8451;');
    template.info.humidity.html(data.weather.main.humidity);
    template.info.windSpeed.html(data.weather.wind.speed);

    var imageIcon = iconURL.replace('{ICON}', data.weather.weather[0].icon);

    var history = $('<li>')
      .html(
        data.weather.name +
        ', ' +
        data.weather.sys.country
      );

    $('#weather-history-results').prepend(history);

    var uvIdx = Math.floor(data.uvi.value);
    var uvColor = Object.keys(uvColorIndex[uvIdx])[0];
    
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

    for(i=0;i<5;i++) {
      
      var k = i*8;

      var day = template.forecast();
      
      day.info.append(
        day.date.html(moment(data.forecast.list[k].dt_txt).format('ddd (DD/MM)')),
        day.temp.html(data.forecast.list[k].main.temp),
        day.humidity.html(data.forecast.list[k].main.humidity),
      );

      $('#forecast-info')
        .append(day.info);
    }

  }

}

$(document).on('click', '#weather-history-results li', function() {
  search = $(this).text();
  getWeatherData();
});

$('#input-search').keypress(function(event){

  var keycode = (event.keyCode ? event.keyCode : event.which);

  if(keycode == '13'){
    search = $('#input-search').val();
    getWeatherData();
  }
});

$('#input-submit').on('click', function() {
  search = $('#input-search').val();
  getWeatherData();
});