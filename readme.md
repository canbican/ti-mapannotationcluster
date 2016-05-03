# ti-mapannotationcluster

This is a titanium commonjs module for displaying large amounts of markers on the map. Markers that are close to each other are displayed as one annotation and can be unfolded by zooming in. It is also possible to customize clustered markers.

It uses a quadtree approach, so the complexity of clustering is linear. This makes it easy to deal with large amounts of data. The module also takes care of markers that are outside the boundaries of view.

![screenshot](https://raw.githubusercontent.com/canbican/ti-mapannotationcluster/master/sc.png)

## Quick Start

In `tiapp.xml`, add the `ti.map` module.

In `alloy.js`, require the map module:

```
Alloy.Globals.Map = require('ti.map');
```

Create your view:

```
<Alloy>
  <Window class="container" id="container">
    <View id="mapView" module="ti.map" onRegionchanged="regionChanged" method="createView"/>
  </Window>
</Alloy>
```

In your controller, define the module and the `regionChanged` function:

```
var CMA = require('ti-mapannotationcluster');

var regionChanged = function(e) {
  $.mapView.setAnnotations(CMA.fill({
    map : Alloy.Globals.Map,
    points : pts,
    latitude : e.latitude,
    longitude : e.longitude,
    latitudeDelta : e.latitudeDelta,
    longitudeDelta : e.longitudeDelta,
    singleAnnotationCaller : singleAnnotationCaller,
    multipleAnnotationCaller : multipleAnnotationCaller
  }));
};
```

`singleAnnotationCaller` and `multipleAnnotationCaller` are optional, but if you don't use them, all markers will look the same. So, also define them in the controller:

```
var singleAnnotationCaller = function(point) {
  return _.extend(point, {
    pincolor : Alloy.Globals.Map.ANNOTATION_GREEN
  }, {
    title : point.offset + ": " + point.latitude.toFixed(2) + ","
        + point.longitude.toFixed(2)
  });
};

var multipleAnnotationCaller = function(point, annotations) {
  return _.extend(point, {
    pincolor : Alloy.Globals.Map.ANNOTATION_PURPLE,
    title : annotations.length + " more locations around here",
  });
};
```

The `point` argument is the object that will be passed to the `createAnnotation` function, so you can use all of its properties for modification, and the `annotations` argument is the array of markers that are represented by this annotation.
