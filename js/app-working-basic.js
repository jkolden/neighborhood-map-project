// This is a constructor to create objects from each venue in my data set:
var Venue = function(data) {
  this.venue = data.venue;
  this.venueId = data.venueId;
  this.position = data.location;
  this.marker = data.marker;
};

//this is my data:
var venues = [{
    venue: "Fox Theater",
    location: {
      "lat": 37.4863286,
      "lng": -122.2296294
    },
    venueId: 2808953
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

  // Constructor builds the map object:
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 37.7749,
      lng: -122.4194
    },
    zoom: 13
  });

};


//ViewModel
var ViewModel = function() {

  const API_KEY = 'Co6kY8qQPER2gGwi'; //SongClick API Key

  var self = this;

  //array to render markers and ajax requests. Should this be an observable?
  self.attractions = ko.observableArray();

  self.filter = ko.observable('');
  var infowindow = new google.maps.InfoWindow({});

  //Instantiate objects using the Venue constructor:
  venues.forEach(function(venue) {
    self.attractions.push(new Venue(venue));
    //creates an array of "Event" objects. Note the array has the marker also.
    //kind of assuming here that the data maps 1:1 between my object and my array that holds the data.
  });


var iconBase = './img/';
var icons = {
  note: {
    icon: 'note.png'
  }
};

  //create a marker for each object in the attractions array:
  self.attractions().forEach(function(locationItem) {

    locationItem.marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: locationItem.position,
      icon: iconBase + 'marker.png'
    });

    //SongKick API for venue/concert info:
    $.getJSON("http://api.songkick.com/api/3.0/venues/" + locationItem.venueId + "/calendar.json?apikey=" + API_KEY, function(data) {

      //just return the first event for testing. We can enhance later:
      var description = data.resultsPage.results.event[0].displayName;

      locationItem.contentString = "<h3>" + locationItem.venue + " Upcoming Events:</h3>";
      locationItem.contentString += "<ul>"

      //infowindow should show three upcoming events:
      for (i = 0; i < 2; i++) {
        var href = data.resultsPage.results.event[i].uri;
        locationItem.contentString += "<li><a href=" +  data.resultsPage.results.event[i].uri + " target='_blank'>" + data.resultsPage.results.event[i].displayName + "</a></li>"
      }

      locationItem.contentString += "</ul>"

      //SongKick logo is required per API terms of use
      locationItem.contentString += '<br><img src="./img/powered-by-songkick-pink.png" width="100">';

      locationItem.infowindow = new google.maps.InfoWindow({
        content: locationItem.contentString
      });

      //listen for clicks and then execute:
      google.maps.event.addListener(locationItem.marker, 'click', function() {
        infowindow.open(map, locationItem.marker);
        infowindow.setContent(locationItem.contentString);
      });
    });

  });

  self.displayInfo = function(locationItem) {
      var marker = locationItem.marker;
      infowindow.open(map, locationItem.marker);
      infowindow.setContent(locationItem.contentString);

      //marker animation per https://developers.google.com/maps/documentation/javascript/examples/marker-animations
      if (locationItem.marker.getAnimation() !== null) {
        locationItem.marker.setAnimation(null);
      } else {
        locationItem.marker.setAnimation(google.maps.Animation.DROP);

      }
  };

  //create filteredItems
  self.filteredItems = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      ko.utils.arrayForEach(self.attractions(), function(item) {
        item.marker.setVisible(true);
      });
      return self.attractions();
    } else {
      return ko.utils.arrayFilter(self.attractions(), function(item) {
        var result = (item.venue.toLowerCase().search(filter) >= 0)

        //https://stackoverflow.com/questions/45422066/set-marker-visible-with-knockout-js-ko-utils-arrayfilter
        //https://jsfiddle.net/dy70fe16/1/
        item.marker.setVisible(result);
        return result;
      });
    }
  });
};

//Maps API callback is to initApp. This function controls execution of the app:
var initApp = function() {
  initMap();
  ko.applyBindings(new ViewModel());
};
