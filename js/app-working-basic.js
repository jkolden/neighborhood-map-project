// Data model:
var Venue = function(data) {
  this.venue = data.venue;
  this.venueId = data.venueId;
  this.position = data.location;
};

//this is my data: is this an object literal? yes because it's not surrounded by quotes?
//http://benalman.com/news/2010/03/theres-no-such-thing-as-a-json/
var venues = [{
    venue: "Fox Theater",
    location: {
      "lat": 37.4863286,
      "lng": -122.2296294
    },
    venueId: 2808953
  },
  {
    venue: "Redwood Room, Clift Hotel",
    location: {
      "lat": 37.7869318,
      "lng": -122.4111049
    },
    venueId: 937426
  },
  {
    venue: "Bill Graham Civic Auditorium",
    location: {
      "lat": 37.7785099,
      "lng": -122.4174684
    },
    venueId: 65
  },
  {
    venue: "Slim's",
    location: {
      "lat": 37.7715171,
      "lng": -122.413259
    },
    venueId: 1489
  },
  {
    venue: "SF Jazz",
    location: {
      "lat": 37.7762522,
      "lng": -122.4215624
    },
    venueId: 2588888
  },
  {
    venue: "Hotel Utah Saloon",
    location: {
      "lat": 37.7795638,
      "lng": -122.398023
    },
    venueId: 328
  },
  {
    venue: "The Warfield",
    location: {
      "lat": 37.7826598,
      "lng": -122.4101811
    },
    venueId: 949
  }
];

var map;

function initMap() {

  //build the map object:
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 37.7749,
      lng: -122.4194
    },
    zoom: 13
  });
  ko.applyBindings(new ViewModel());
}


//ViewModel
var ViewModel = function() {

  const API_KEY = "Co6kY8qQPER2gGwi"; //SongKick API Key
  const SONGKICK_LOGO = "<br><img src='./img/powered-by-songkick-pink.png' width='100'>";

  var self = this;

  //observable array to hold our venues. Does this need to be an observable?
  self.events = ko.observableArray();

  self.filter = ko.observable("");
  var infowindow = new google.maps.InfoWindow({});

  //populate our observable array with Venue objects NOT NECCESARY BECAUSE MY OBJECT IS ALREADY AN OBJECT?
  venues.forEach(function(venue) {
    //creates an array of "Venue" objects.
    self.events.push(new Venue(venue));
  });

  //create a marker for each object in the events array and add info window content for each marker:
  self.events().forEach(function(eventLocation) {
    eventLocation.marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: eventLocation.position,
      icon: './img/marker.png' //use a custom icon
    });

    //SongKick API for venue/concert info:
    $.getJSON("http://api.songkick.com/api/3.0/venues/" + eventLocation.venueId + "/calendar.json?apikey=" + API_KEY, function(data) {

      //display the venue name in info window:
      eventLocation.contentString = "<h3>" + eventLocation.venue + " Upcoming Events:</h3>";

      //display a list of events at the venue:
      eventLocation.contentString += "<ul>";

      var arrayLength = data.resultsPage.results.event.length;

      //only show a max of 5 events for each venue:
      var numberOfEvents = (arrayLength > 5) ? 5 : arrayLength;

      /*jslint for:true */
      for (i = 0; i < numberOfEvents; i++) {
        var href = data.resultsPage.results.event[i].uri;
        eventLocation.contentString += "<li><a href=" + data.resultsPage.results.event[i].uri + " target='_blank'>" + data.resultsPage.results.event[i].displayName + "</a></li>"
      }

      eventLocation.contentString += "</ul>";

      if (numberOfEvents = 0) {
        eventLocation.contentString += "<h4>There are no events scheduled at this time</h4>";
      }

    }).fail(function(jqxhr, textStatus, error) {
      eventLocation.contentString = "<h3>Oops! We couldn't contact the Song Kick Server!</h3>";
      //log the error for developer debug
      console.log("Error: " + error);

    }).always(function() {
      //SongKick logo is required per API terms of use
      eventLocation.contentString += SONGKICK_LOGO;

      //build the info window:
      eventLocation.infowindow = new google.maps.InfoWindow({
        content: eventLocation.contentString
      });

      //add the event listener:
      google.maps.event.addListener(eventLocation.marker, "click", function() {
        infowindow.open(map, eventLocation.marker);
        infowindow.setContent(eventLocation.contentString);

        //marker should animate on click per project rubric. I don't like the user experience but here it is:
        eventLocation.marker.setAnimation(google.maps.Animation.DROP);
      });

    });

  });

  //this blog post was helpful in understanding how this function should work:
  //https://www.samatkins.me/building-map-project.html
  self.displayInfo = function(eventLocation) {
    var marker = eventLocation.marker;
    infowindow.open(map, eventLocation.marker);
    infowindow.setContent(eventLocation.contentString);

    //marker animation per https://developers.google.com/maps/documentation/javascript/examples/marker-animations
    if (eventLocation.marker.getAnimation() !== null) {
      eventLocation.marker.setAnimation(null);
    } else {
      eventLocation.marker.setAnimation(google.maps.Animation.DROP);
    }
  };

  /*
  create filteredItems
  This post was helpful:
  https://stackoverflow.com/questions/45422066/set-marker-visible-with-knockout-js-ko-utils-arrayfilter
  */
  self.filteredItems = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      ko.utils.arrayForEach(self.events(), function(item) {
        item.marker.setVisible(true);
      });
      return self.events();
    } else {
      return ko.utils.arrayFilter(self.events(), function(item) {
        var result = (item.venue.toLowerCase().search(filter) >= 0)
        item.marker.setVisible(result);
        return result;
      });
    }
  });
}
