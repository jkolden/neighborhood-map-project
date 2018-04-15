// Class to represent a row in the venue grid - this prbably isn't needed since our list won't be editable?
function venue(name) {
  var self = this;
  self.name = name;
}


var ViewModel = function() {

  var self = this;

  self.filter = ko.observable('');
  self.items = ko.observableArray([
  {"name": "Fillmore", "lat": 37.783926, "lng": -122.433072},
  {"name": "The Masonic", "lat": 37.791198, "lng": -122.412982},
  {"name": "SF Jazz", "lat": 37.776395, "lng": -122.421527},
  {"name": "Davies Hall", "lat": 37.777612, "lng": -122.420623}

    //not sure if we should go this route but each of these DOES need to be selectable so I'm not sure
    //new venue("Filmore West"),
    //new venue("The Masonic")
  ]);

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
};

ko.applyBindings(new ViewModel());
