var MAC = require('ti-mapannotationcluster');
var pts = [];
var theMap = require('ti.map');

// This is the customization function for single point annotations.
var singleAnnotationCaller = function(point) {
  return _.extend(point, {
    pincolor : mapView.ANNOTATION_GREEN
  }, {
    title : point.offset + ": " + point.latitude.toFixed(2) + ","
        + point.longitude.toFixed(2)
  });
};

// This is the customization function for multiple point annotations.
var multipleAnnotationCaller = function(point, annotations) {
  return _.extend(point, {
    pincolor : mapView.ANNOTATION_PURPLE
  }, {
    title : annotations.length + " more locations around here",
  });
};

// Annotations are filled when a regionChanged event is fired, so that it's
// easier to know the boundaries of the map.
var regionChanged = function(e) {
  mapView.setAnnotations(MAC.fill({
    // map module object
    map : theMap,
    // points to put in the map - only the ones that fit the view are actually
    // added
    points : pts,
    // central latitude of the map
    latitude : e.latitude,
    // central longitude of the map
    longitude : e.longitude,
    // latitude delta
    latitudeDelta : e.latitudeDelta,
    // longitude delta
    longitudeDelta : e.longitudeDelta,
    // function for customizing single point annotations - optional
    singleAnnotationCaller : singleAnnotationCaller,
    // function for customizing multiple point annotations - optional
    multipleAnnotationCaller : multipleAnnotationCaller
  }));
};

var init = function() {
  // create 2000 random points all around the globe
  pts = _.times(2000, function(n) {
    return {
      offset : n,
      latitude : Math.random() * 180 - 90,
      longitude : Math.random() * 360 - 180,
    };
  });
  // setup the view
  $.mapView.addEventListener('regionChanged', regionChanged);
};

init();