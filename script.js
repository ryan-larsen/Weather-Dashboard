$(document).ready(function () {

  var APIKEY = "d3c45428b267f056e0b15460332c1bf1"

  $("#searchBtn").on("click", function () {
    var searchValue = $("#searchValue").val();

    //clear input box
    $("#searchValue").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function () {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li.addClass("historyLi"));
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=" + APIKEY + "&units=imperial",
      success: function (data) {
        //create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));

          makeRow(searchValue);
        }

        //clear any old content
        $("#today").empty();

        //create html content for current weather
        var titleEl = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var cardEl = $("<div>").addClass("card");
        var windEl = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humidEl = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var tempEl = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBodyEl = $("<div>").addClass("card-body");
        var imgEl = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        //merge and add to page
        titleEl.append(imgEl);
        cardBodyEl.append(titleEl, tempEl, humidEl, windEl);
        cardEl.append(cardBodyEl);
        $("#today").append(cardEl);

        //call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=" + APIKEY + "&units=imperial",
      success: function (response) {

        //overwrite any existing content with title and empty row
        $("#forecast").html('<h4 class="mt-3">5-Day Forecast:</h4>').append('<div class="row">');

        //loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < response.list.length; i++) {
          //only look at forecasts around 3:00pm
          if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            //create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2")
            var card = $("<div>").addClass("card bg-secondary text-white")
            var body = $("<div>").addClass("card-body p-3")
            var title = $("<h5>").addClass("card-title").text(new Date(response.list[i].dt_txt).toLocaleDateString())
            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
            var p1 = $("<p>").addClass("card-text").text("Temp: " + response.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + response.list[i].main.humidity + "%");

            //merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});

// testing git push from second desktop