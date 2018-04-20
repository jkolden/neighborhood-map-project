// This is the model of my data:
var Event = function(data) {
  this.venue = data.venue;
  this.location = data.location;
  this.artist = data.artist;
  this.marker = data.marker;
};

//this is my data that *would* be coming from the API:
var events = [{
  venue: "Fox Theater",
  location: {"lat": 37.7795638, "lng": -122.398023},
  artist: "King Krule"
},
{
  venue: "Kuumbwa Jazz Center",
  location: {"lat": 37.8078474, "lng": -122.2699981},
  artist: "Pat Metheny and Brad Mehldau"
},
{
  venue: "SF Jazz",
  location: {"lat": 37.7763626, "lng": -122.4215479},
  artist: "Def Leppard"
}];

var map;

function initMap() {
  /* this function needs to:
  1) build the map
  2) iterate over the list of events and create the markers
  3) add the markers to the events array
  4) create the infoWindow as well (not sure where I get the data for this)
     - maybe this is where knockout mapping comes in because my object is pretty complex?
  */

  // Constructor builds the map object:
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 37.7749,
      lng: -122.4194
    },
    zoom: 13
  });

  //2. create the markers
  for (var i = 0; i < events.length; i++) {
    // Get the position from the events array.
    var position = events[i].location;
    var title = locations[i].venue;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      map: map,
      animation: google.maps.Animation.DROP,
      id: i
    });
    //3. add this marker to the events array:
    events[i].marker = marker;
  };

  ko.applyBindings(new ViewModel());
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

        var position = {
          "lat": self.items()[i].venue.lat,
          "lng": self.items()[i].venue.lng
        };
        var title = self.items()[i].venue.displayName;

        // Create a marker per location, and put into markers array.
        var contentString = '<div>This is some data ' + title + '</div>';
        var largeInfowindow = new google.maps.InfoWindow({});

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
            //update the performance array with all performances at the venue:
            self.performances(self.items()[i].performance);

            //build the content string that will be used for the infoWindow:
            var contentString = '<h3>' + self.items()[i].venue.displayName + '</h3>';
            contentString += '<h4>' + self.items()[i].displayName + '</h4>';

            //some venues have multiple artists/performances per night, so we loop over the performance array to display them all:
            for (var j = 0; j < self.performances().length; j++) {

            //link to the SongKick site is required by the SongKick API Terms of Use:
              contentString += '<div> Artist ' + (j + 1) + ': ' + '<a href=' + self.performances()[j].artist.uri + ' target="_Blank">' + self.performances()[j].displayName + '</a></div>';
            };

            //image is required by the SongKick API Terms of Use:
            contentString += '<br><img src="./img/powered-by-songkick-pink.png" width="100">';

            largeInfowindow.setContent(contentString);
            largeInfowindow.open(map, marker);
          }
        })(marker, i));

        //add the markers to the marker array:
        markers.push(marker);
        var bounds = new google.maps.LatLngBounds();

        bounds.extend(markers[i].position);
      }
      // Extend the boundaries of the map for each marker
      map.fitBounds(bounds);

    });
  };

  self.filter = ko.observable('');

  var stringStartsWith = function(string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
      return false;
    return string.substring(0, startsWith.length) === startsWith;
  };

  //https://stackoverflow.com/questions/45461834/filtering-table-using-knockout-js
  self.filteredItems = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      return self.items();
    } else {
      return ko.utils.arrayFilter(self.items(), function(item) {
        return stringStartsWith(item.venue.displayName.toLowerCase(), filter) ||
          stringStartsWith(item.performance[0].artist.displayName.toLowerCase(), filter);
      });
    }
  }, this);

};


ko.applyBindings(new ViewModel());
