/**
 * Config section
 * Update this section to change any configurations below
*/

var apiKey   = '469a1bcd8ede3e2121d54a82776ffc16',
    appUnit     = 'metric'
    endPoint = 'http://api.openweathermap.org/data/2.5/weather?units=' + appUnit + '&appid=' + apiKey,
    iconURL  = 'http://openweathermap.org/img/wn/10d@2x.png';

// END CONFIG SECTION

endPoint = 'weather.json';
var query = ''; //'&q=london';
var queryURL = endPoint + query;

$.ajax({
  url: queryURL,
  method: "GET"
})
.then(function(response) {
  console.log(response);
});
