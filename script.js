/**
 * Config section
 * Update this section to change any configurations below
*/

//uvi?lat=37.75&lon=-122.37&

var appParam = '';

var apiKey   = '469a1bcd8ede3e2121d54a82776ffc16',
    appUnit  = 'metric',
    endPoint = 'http://api.openweathermap.org/data/2.5/{PAGE}?appid=' + apiKey,
    iconURL  = 'http://openweathermap.org/img/wn/10d@2x.png';


function success(position) {
  const latitude  = position.coords.latitude;
  const longitude = position.coords.longitude;

  //status.textContent = '';
  //mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
  console.log(`Latitude: ${latitude} °, Longitude: ${longitude} °`);
}

function error() {
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
    location: $('h2'),
    temperature: $('<span>').attr('data-data', 'Temperature'),
    humidity: $('<span>').attr('data-data', 'Humidity'),
    windSpeed: $('<span>').attr('data-data', 'Wind Speed'),
    uvIndex: $('<span>').attr('data-data', 'UV Index')
  },
  forecast: function() {
    return {
      info: $('<li>'),
      date: $('<span>'),
      temp: $('<span>'),
      humidity: $('<span>')
    }
  }
}

var search = 'london';

var apiCall = ['forecast', 'weather'];

function getWeatherData() {

  

  var data = {};

  var param,
      complete = false;

  apiCall.forEach(callApi);

  function callApi(page) {

    switch(page) {
      case 'weather':
      case 'forecast':
        param = '&q=' + search + '&units=metric';
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

    //console.log(data.weather.main.temp);

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

    //console.log(Object.keys());

    var uvIdx = Math.floor(data.uvi.value);
    var uvColor = Object.keys(uvColorIndex[uvIdx])[0];
    //uvColorIndex[1].green;
    console.log(uvColor, uvColorIndex[uvIdx][uvColor]);
    
    template.info.uvIndex
      .attr('data-index-color', uvColor)
      .append(
        $('<a>')
          .html(data.uvi.value)
          .attr('style', 'background-color: ' + uvColor)
          .attr('href', 'https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage')
          .attr('target', '_blank')
          .attr('title', uvColorIndex[uvIdx][uvColor])
      );

    $('#weather-detailed').empty();

    $('#weather-detailed')
    .append(
      template.info.temperature,
      template.info.humidity,
      template.info.windSpeed,
      template.info.uvIndex
    );

    $('#forecast-info').empty();

    for(i=0;i<5;i++) {
      //console.log(i * 12);
      var k = i*8;

      //var day = template;

      var day = template.forecast();
      
      day.info.append(
        day.date.html(moment(data.forecast.list[k].dt_txt).format('ddd')),
        day.temp.html(data.forecast.list[k].main.temp),
        day.humidity.html(data.forecast.list[k].main.humidity),
      );

      $('#forecast-info')
        .append(day.info);

      /*
      console.log(moment(data.forecast.list[k].dt_txt).format('ddd'));
      console.log(data.forecast.list[k].main.temp);
      console.log(data.forecast.list[k].main.humidity);
      */

    }

  }

  console.log(data);

}

getWeatherData();
/*



$.ajax({
  url: queryURL,
  method: "GET"
})
.then(function(response) {
  var jsonResp = response; //JSON.parse(response);

  console.log(jsonResp);

  
  
});
*/