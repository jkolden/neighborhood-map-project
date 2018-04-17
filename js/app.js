// Class to represent a row in the venue grid - this prbably isn't needed since our list won't be editable?
function venue(name) {
  var self = this;
  self.name = name;
}

var map;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
   map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 13
  });
};

var ViewModel = function() {

  var self = this;
  self.items = ko.observableArray([]);

  self.loadUserData = function() {

  //good tututorial on loading server-side data here: https://code.tutsplus.com/tutorials/accessing-external-data--net-31306
  $.getJSON("http://api.songkick.com/api/3.0/metro_areas/26330/calendar.json?apikey=Co6kY8qQPER2gGwi", function(data) {
    self.items(data.resultsPage.results.event);

    // The following group uses the location array to create an array of markers on initialize.
    var markers = [];

    for (var i = 0; i < self.items().length; i++) {
      // Get the position from the location array.
      var position = {"lat": self.items()[i].venue.lat, "lng": self.items()[i].venue.lng};
      var title = self.items()[i].venue.displayName;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });
      // Push the marker to our array of markers.
      markers.push(marker);
      //bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    //map.fitBounds(bounds);

  });
}


  self.filter = ko.observable('');


/*
  //I was on the wrong track with this so I used this as a reference:
  //https://stackoverflow.com/questions/31188583/filter-table-contents
  self.filteredItems = ko.computed(function() {
    var filter = self.filter();
    if (!filter) {
      return self.items();
    }
    return self.items().filter(function(i) {
      return i.indexOf(filter) > -1;
    });
  });
  */
};


ko.applyBindings(new ViewModel());
