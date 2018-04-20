var map;
var eventList = ko.observableArray();



function initMap() {

  $.getJSON("http://api.songkick.com/api/3.0/metro_areas/26330/calendar.json?apikey=Co6kY8qQPER2gGwi", function(data) {

        //Need to add a marker property to the mapped object
        //https://stackoverflow.com/questions/33217594/adding-extra-object-property-to-knockout-mapping
            var options = {
              create: function(options) {
                //options.data.marker = ko.observable();
                 options.data.marker = new google.maps.Marker();
                return options.data;
              }
            };

    var observableData = ko.mapping.fromJS(data.resultsPage.results.event, options);
    var array = observableData();
    eventList(array);
  });

  alert(eventList().length);
  /* this function will accomplish the following:
  1) build the map
  2) iterate over the list of events in my data set and create the markers
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
  for (var i = 0; i < eventList().length; i++) {
    // Get the position from the events array.
    var position = {"lat": eventList()[i].venue.lat, "lng": eventList()[i].venue.lng};
    var title = eventList()[i].venue.displayName;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      map: map,
      animation: google.maps.Animation.DROP,
      id: i
    });

    //4. create the infoWindow before I add the marker to the array
    var contentString = '<div>This is some data ' + title + '</div>';
    var largeInfowindow = new google.maps.InfoWindow({});

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        //build the content string that will be used for the infoWindow:
        var contentString = '<h3>'+ eventList()[i].venue.displayName +'</h3>';
        //image is required by the SongKick API Terms of Use:
        contentString += '<br><img src="./img/powered-by-songkick-pink.png" width="100">';

        largeInfowindow.setContent(contentString);
        largeInfowindow.open(map, marker);
      };
    })(marker, i));

    //3. add this marker to the events array:
    eventList()[i].marker = marker;

  };

  ko.applyBindings(new ViewModel());
};


var ViewModel = function() {

  var self = this;
  self.filter = ko.observable('');


  //create filteredItems
  self.filteredItems = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      ko.utils.arrayForEach(eventList(), function(item) {
        item.marker.setVisible(true);
      });
      return eventList();
    } else {
      return ko.utils.arrayFilter(eventList(), function(item) {
        var result = (item.venue.displayName.toLowerCase().search(filter) >= 0)

        //https://stackoverflow.com/questions/45422066/set-marker-visible-with-knockout-js-ko-utils-arrayfilter
        //https://jsfiddle.net/dy70fe16/1/
        item.marker.setVisible(result);
        return result;
      });
    }
  });

};
