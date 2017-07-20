// This module requires ti.map module also. Add it to tiapp.xml before running:
//
// <ti:app>
//   <modules>
//     <module>ti.map</module>
//   </modules>
// </ti:app>
//
// NOTE: In order to run this on Android, you need to setup tiapp.xml as described in
// http://docs.appcelerator.com/platform/latest/#!/api/Modules.Map
//
// Basically, you need to add the following to tiapp.xml:
//
// <ti:app>
//     <android xmlns:android="http://schemas.android.com/apk/res/android">
//         <manifest>
//             <application>
//                 <meta-data android:name="com.google.android.maps.v2.API_KEY"
//                     android:value="PASTE YOUR GOOGLE MAPS API KEY HERE"/>
//             </application>
//         </manifest>
//     </android>
// </ti:app>
//

var MAC = require('ti-mapannotationcluster');
var pts = [];
var theMap = require('ti.map');

var win = Ti.UI.createWindow();
var mapView = theMap.createView({
  mapType : Map.NORMAL_TYPE
});
win.add(mapView);
win.open();

// This is the customization function for single point annotations.
var singleAnnotationCaller = function(point) {
  return theMap.createAnnotation({
    pincolor : theMap.ANNOTATION_GREEN,
    title : point.offset + ": " + point.latitude.toFixed(2) + "," + point.longitude.toFixed(2),
    latitude : point.latitude,
    longitude : point.longitude,
  });
  return point;
};

// This is the customization function for multiple point annotations.
var multipleAnnotationCaller = function(point, annotations) {
  return theMap.createAnnotation({
    pincolor : theMap.ANNOTATION_PURPLE,
    title : annotations.length + " more locations around here",
    latitude : point.latitude,
    longitude : point.longitude,
  });
  return point;
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
  pts = [];
  for (var i = 0; i < 2000; i++) {
    pts.push({
      offset : i,
      latitude : Math.random() * 180 - 90,
      longitude : Math.random() * 360 - 180,
    });
  };
  // setup the view
  mapView.addEventListener('regionChanged', regionChanged);
};

init();