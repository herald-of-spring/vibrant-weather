var hour = moment().format("HH");
var h = "";
//set up hero banner depending on time of day
if (hour >= 5 && hour < 12) {
  $("#day").text("Good Morning.");
  $(".hero").css("background-image", "linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%), url('./images/morning.jpg')");
  h = "daytime";
}
else if (hour >= 12 && hour < 20) {
  $("#day").text("Good Afternoon.");
  $(".hero").css("background-image", "linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%), url('./images/afternoon.jpg')");
  h = "afternoon";
}
else {
  $("#day").text("Good Evening.");
  $(".hero").css("background-image", "linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%), url('./images/evening.jpg')");
  h = "evening";
}
$("#time").text(moment().format("MMMM Do, YYYY"));

//loads recent searches
var recent = null;
function loadRecent() {
  recent = JSON.parse(localStorage.getItem("recent"));
  if (recent != null) {
    $("#recents-visibility").attr("class", "d-block mt-4");
    $("#recents-content").empty();
    for (place of recent) {
      displayLocation($("#recents-content"), place.loc, place.lat, place.lon);
    }
    $("#search").children().eq(0).attr("placeholder", recent[0].loc);    //search bar placeholder updates as you search
  }
}
loadRecent();    //displays last session at page load

//displays encoded location at the jquery site
function displayLocation(site, loc, lat, lon) {
  site.append($("<div>").addClass("border rounded btn-fit px-2 py-1 m-2 o-80 simple-animate " + h).attr("data-lat", lat).attr("data-lon", lon).text(loc)
    .on("click", function() {
      saveRecent({
        loc: $(this).text(),
        lat: $(this).attr("data-lat"),
        lon: $(this).attr("data-lon"),
      });
      loadRecent();
      buildPanels($(this).attr("data-lat"), $(this).attr("data-lon"));
    })
  );
}

//saves location into localStorage, up to a max of 6
function saveRecent(location) {
  if (recent === null) {
    recent = []
  }
  for (i in recent) {    //scans for duplicates and removes them
    if (recent[i].loc == location.loc) {
      recent.splice(i, 1);
      break;
    }
  }
  if (recent.length === 6) {
    recent.pop();
  }
  recent.unshift(location);
  localStorage.setItem("recent", JSON.stringify(recent));
}

//fetch api using query as location name
var units = "metric";
function performSearch(query) {
  units = document.activeElement['value'];
  if (units != "imperial" && units != "metric") {
    units = "metric";    //default units
  }
  if (query == "") {
    return;
  }
  var api = "https://api.openweathermap.org/geo/1.0/direct?q=" + query + "&limit=4&appid=f10dee4e5f98ef01270eea76982c3d06";
  fetch(api).then(function (response) {
    if (response.status == 200) {
      return response.json();
    }
    else {
      return null;
    }
  }).then(function (data) {
    if (data != null) {
      var place = data[0].name;
      if (data[0].state != undefined) {
        place += ", " + data[0].state;
      }
      place += ", " + data[0].country;
      saveRecent({
        loc: place,
        lat: data[0].lat,
        lon: data[0].lon,
      });
      loadRecent();
      buildPanels(data[0].lat, data[0].lon);
      displayAlternates(data);
    }
    else {
      $("#error-msg").attr("class", "d-block");
    }
  });
}

//fetch weather information using converted lat and lon
function buildPanels(lat, lon) {
  var api = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=" + units + "&cnt=40&appid=f10dee4e5f98ef01270eea76982c3d06";
  fetch(api).then(function (response) {
    if (response.status == 200) {
      return response.json();
    }
    else {
      return null;
    }
  }).then(function (data) {
    if (data != null) {
      $("#day").attr("class", "d-none");
      $("#time").attr("class", "d-none");
      $("#error-msg").attr("class", "d-none");
      $("#result-visibility").attr("class", "d-block mt-4");
      $("#place-name").text(recent[0].loc);
      $("#result-content").empty();
      var localMax = -1;
      var localMin = 1000;
      var avgpop = 0;
      for (i in data.list) {
        localMax = Math.max(localMax, data.list[i].main.temp_max);
        localMin = Math.min(localMin, data.list[i].main.temp_min);
        avgpop += data.list[i].pop;
        if (i % 8 == 7) {    //3 hour intervals so triggers every 8 loops aka 24 hours
          $("#result-content").append(newPanel(i / 8, avgpop / 8, localMax, localMin, data.list[i].weather[0].main, data.list[i].weather[0].id));
          localMax = -1;
          localMin = 1000;
          avgpop = 0;
        }
      }
    }
  });
}

//main builder for the panels
function newPanel(day, precip, max, min, weather, id) {
  var icon = $("<i>");
  var background = "";
  var temp = "°C";
  if (units == "imperial") {
    temp = "°F";
  }
  if (id < 300) {
    icon.addClass("fa-solid fa-cloud-bolt");
    background = "b-cloud-bolt";
  }
  else if (id < 600) {
    icon.addClass("fa-solid fa-cloud-showers-heavy");
    background = "b-cloud-showers-heavy";
  }
  else if (id < 700) {
    icon.addClass("fa-solid fa-snowflake");
    background = "b-snowflake";
  }
  else if (id < 763) {
    icon.addClass("fa-solid fa-smog");
    background = "b-smog";
  }
  else if (id == 771) {
    icon.addClass("fa-solid fa-wind");
    background = "b-wind";
  }
  else if (id == 781) {
    icon.addClass("fa-solid fa-tornado");
    background = "b-tornado";
  }
  else if (id == 800) {
    icon.addClass("fa-solid fa-sun");
    background = "b-sun";
  }
  else if (id == 801 || id == 802) {
    icon.addClass("fa-solid fa-cloud-sun");
    background = "b-cloud-sun";
  }
  else if (id == 803 || id == 804) {
    icon.addClass("fa-solid fa-cloud");
    background = "b-cloud";
  }
  return $("<div>").addClass("border border-dark day-panel simple-animate p-1 d-flex flex-column justify-content-between align-items-center " + background).append(
    $("<strong>").addClass("text-center").text(moment().add(day, "days").format("MMM DD"))).append(
    $("<i>").addClass("fa-solid fa-droplet show-on-hover").text(" " + Math.floor(parseInt(precip) * 100) + "%")).append(
    $("<div>").append(
      $("<i>").addClass("fa-solid fa-caret-up d-block").text(" " + max + temp)).append(
      $("<i>").addClass("fa-solid fa-caret-down").text(" " + min + temp))).append(
    $("<strong>").addClass("text-center show-on-hover").text(weather)).append(
    icon
  );
}

//for cities with the same search names but in different places
function displayAlternates(data) {
  if (data.length > 1) {
    $("#alternates-visibility").attr("class", "d-block mt-4");
    $("#alternates-content").empty();
    for (i = 1; i < data.length; i++) {
      var place = data[i].name;
      if (data[i].state != undefined) {
        place += ", " + data[i].state;
      }
      place += ", " + data[i].country;
      displayLocation($("#alternates-content"), place, data[i].lat, data[i].lon);
    }
  }
  else {
    $("#alternates-visibility").attr("class", "d-none");
  }
}

$("#search").on("submit", function(event) {
  event.preventDefault();
  performSearch($("#search").children().eq(0).val());
});