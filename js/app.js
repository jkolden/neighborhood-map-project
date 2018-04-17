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

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    //infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}

var ViewModel = function() {

  var self = this;
  self.items = ko.observableArray([]);
  self.performances = ko.observableArray([]);

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
      var contentString = '<div>This is some data '+ title  + '</div>';
      var largeInfowindow = new google.maps.InfoWindow({
      });

//same issue as this guy:
//https://stackoverflow.com/questions/19784953/google-map-api-infowindow-in-foreach-loop
//https://stackoverflow.com/questions/32798480/assign-infowindow-for-each-marker-in-google-maps

      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });

      //same issue as this guy:
      //https://stackoverflow.com/questions/32798480/assign-infowindow-for-each-marker-in-google-maps

       google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          self.performances(self.items()[i].performance);
          var contentString = '<h3>' + self.items()[i].venue.displayName + '</h3>';
          contentString += '<h4>' + self.items()[i].displayName + '</h4>'
          for (var j = 0; j <  self.performances().length; j++) {
          contentString += '<div> Artist ' + (j+1) + ': ' + '<a href=' + self.performances()[j].artist.uri + ' target="_Blank">' + self.performances()[j].displayName + '</a></div>';
        };
        contentString += '<br><img src="./img/powered-by-songkick-pink.png" width="100">';
            largeInfowindow.setContent(contentString);
            largeInfowindow.open(map, marker);
        }
    })(marker, i));

      // Push the marker to our array of markers.
      markers.push(marker);



      //bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    //map.fitBounds(bounds);

  });
};


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
