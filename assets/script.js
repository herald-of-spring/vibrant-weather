// var api = "api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + lon + "&units=" + units + "&cnt=5appid=f10dee4e5f98ef01270eea76982c3d06";
console.log(moment.unix(1569002733).format("MMM Do, YYYY, hh:mm:ss"));
var hour = moment().format("HH");
//set up hero banner depending on time of day
if (hour >= 5 && hour < 12) {
  $("#day").text("Good Morning.");
  $(".hero").css("background-image", "linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%), url('./images/morning.jpg')");
}
else if (hour >= 12 && hour < 20) {
  $("#day").text("Good Afternoon.");
  $(".hero").css("background-image", "linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%), url('./images/afternoon.jpg')");
}
else {
  $("#day").text("Good Evening.");
  $(".hero").css("background-image", "linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%), url('./images/evening.jpg')");
}
$("#time").text(moment().format("MMMM Do, YYYY"));

//loads recent searches
var recent = null;
function loadRecent() {
  var read = localStorage.getItem("recent");
  if (read != null) {
    recent = read.split(",");
    $("#recents-visibility").attr("class", "d-block");
    $("#recents-content").text("");
    for (place of recent) {
      displayLocation($("#recents-content"), place);
    }
  }
}
loadRecent();    //displays last session at page load

//displays encoded location at the jquery site
function displayLocation(site, loc) {
  var loc = loc.replace(/~/g, ", ");
  site.append($("<div>").addClass("border rounded purple-fit px-2 py-1 m-2 o-80 simple-animate").text(loc));
}

//saves location into localStorage, up to a max of 6
function saveRecent(loc) {
  if (recent === null) {
    recent = []
  }
  else if (recent.length === 6) {
    recent.shift();
  }
  recent.push(loc);
  localStorage.setItem("recent", recent);
}

//fetch api using query as location name
function populatePanels(query) {
  var api = "http://api.openweathermap.org/geo/1.0/direct?q=" + query + "&limit=5&appid=f10dee4e5f98ef01270eea76982c3d06";
  fetch(api).then(function (response) {
    if (response.status == 200) {
      $("#day").attr("class", "d-none");
      $("#time").attr("class", "d-none");
      $("#error-msg").attr("class", "d-none");
      $("#result-visibility").attr("class", "d-block");
      return response.json();
    }
    else {
      $("#error-msg").attr("class", "d-block");
      return null;
    }
  })
  .then(function (data) {
    if (data != null) {
      console.log(data);
      var place = data[0].name;
      if (data[0].state != undefined) {
        place += "~" + data[0].state;
      }
      place += "~" + data[0].country;
      saveRecent(place);
      loadRecent();
      // buildPanels(data);
      displayAlternates(data);
    }
  });
}

$("#search").on("submit", function(event) {
  event.preventDefault();
  populatePanels($("#search").children().eq(0).val());
});

$(".day-panel").hover(function() {    //mouseenter
  $(this).children().eq(1).fadeIn(100);
  $(this).children().eq(3).fadeIn(100);
}, function() {    //mouseleave
  $(this).children().eq(1).fadeOut(100);
  $(this).children().eq(3).fadeOut(100);
})