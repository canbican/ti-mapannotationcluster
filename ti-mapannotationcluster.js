var _ = require("underscore");

function ClusteredMapAnnotations(bounds, maxObjects, maxLevels, level) {
  this.maxObjects = maxObjects || 20;
  this.maxLevels = maxLevels || 4;
  this.level = level || 0;
  this.bounds = bounds;
  this.objects = [];
  this.nodes = [];
}

ClusteredMapAnnotations.prototype.split = function() {
  var nextLevel = this.level + 1;
  var subWidth = Math.round(this.bounds.width / 2);
  var subHeight = Math.round(this.bounds.height / 2);
  var latitude = Math.round(this.bounds.latitude);
  var longitude = Math.round(this.bounds.longitude);
  this.nodes = _.map([{
    latitude : latitude + subWidth,
    longitude : longitude,
    width : subWidth,
    height : subHeight
  }, {
    latitude : latitude,
    longitude : longitude,
    width : subWidth,
    height : subHeight
  }, {
    latitude : latitude,
    longitude : longitude + subHeight,
    width : subWidth,
    height : subHeight
  }, {
    latitude : latitude + subWidth,
    longitude : longitude + subHeight,
    width : subWidth,
    height : subHeight
  }], function(t) {
    return new ClusteredMapAnnotations(t, this.maxObjects, this.maxLevels, nextLevel);
  }, this);
};

ClusteredMapAnnotations.prototype.getIndex = function(pRect) {
  return _.min([{
    index : 0,
    latitude : this.bounds.latitude + this.bounds.width * 3 / 4,
    longitude : this.bounds.longitude + this.bounds.height * 3 / 4
  }, {
    index : 1,
    latitude : this.bounds.latitude + this.bounds.width * 3 / 4,
    longitude : this.bounds.longitude + this.bounds.height / 4
  }, {
    index : 2,
    latitude : this.bounds.latitude + this.bounds.width / 4,
    longitude : this.bounds.longitude + this.bounds.height * 3 / 4
  }, {
    index : 3,
    latitude : this.bounds.latitude + this.bounds.width / 4,
    longitude : this.bounds.longitude + this.bounds.height / 4
  }], function(region) {
    return Math.sqrt(Math.pow(region.latitude - pRect.latitude, 2) + Math.pow(region.longitude - pRect.longitude, 2));
  }).index;
};

ClusteredMapAnnotations.prototype.insert = function(pRect) {
  var i = 0;
  var index;
  var limitNear = Math.sqrt(Math.pow(this.bounds.height / 4, 2) + Math.pow(this.bounds.width / 4, 2));
  var tooNear = _.find(this.objects, function(objectNow) {
    var dist = Math.sqrt(Math.pow(pRect.latitude - objectNow.latitude, 2) + Math.pow(pRect.longitude - objectNow.longitude, 2));
    return (dist <= limitNear);
  });
  this.objects.push(pRect);
  if (((this.objects.length > this.maxObjects) || tooNear) && this.level < this.maxLevels) {
    if (_.isUndefined(this.nodes[0])) {
      this.split();
    }
    _.each(this.objects, function(object) {
      this.nodes[this.getIndex(object)].insert(object);
    }, this);
    this.objects = [];
  }
};
ClusteredMapAnnotations.prototype.clear = function() {

  this.objects = [];
  _.each(_.compact(this.nodes), function(node) {
    node.clear();
  });
};

exports.fill = function(configuration) {
  var lat = configuration.latitude;
  var lon = configuration.longitude;
  var latDelta = configuration.latitudeDelta;
  var lonDelta = configuration.longitudeDelta;
  var map = configuration.map;
  var points = configuration.points;
  var singleAnnotationCaller = configuration.singleAnnotationCaller || _.identity;
  var multipleAnnotationCaller = configuration.multipleAnnotationCaller || _.identity;
  var qy = lon - lonDelta / 2;
  var qx = lat - latDelta / 2;
  var qh = lonDelta;
  var qw = latDelta;
  var CMA = new ClusteredMapAnnotations({
    latitude : qx,
    longitude : qy,
    width : qw,
    height : qh,
  });
  _.each(_.filter(points, function(point) {
    return ((point.longitude) >= qy) && ((point.latitude) >= qx) && (point.longitude <= (qy + qh)) && (point.latitude <= (qx + qw));
  }), function(point) {
    CMA.insert(point);
  });
  var fillAll = function(cma, depth) {
    if ((depth < (cma.maxLevels)) || (cma.objects.length === 1)) {
      return _.reduce(cma.objects, function(memo, location) {
        var annotationSingle = singleAnnotationCaller(location);
        return memo.concat(annotationSingle);
      }, []).concat(_.reduce(_.compact(cma.nodes), function(memo, cluster) {
        return memo.concat(fillAll(cluster, depth + 1));
      }, []));
    } else if (cma.objects.length > 0) {
      var groupLoc = {
        offset : 0,
        latitude : _.reduce(cma.objects, function(memo, object) {
          return memo + object.latitude;
        }, 0) / cma.objects.length,
        longitude : _.reduce(cma.objects, function(memo, object) {
          return memo + object.longitude;
        }, 0) / cma.objects.length,
      };
      var annotationGrouped = multipleAnnotationCaller(groupLoc, cma.objects);
      return [annotationGrouped];
    } else {
      return [];
    }
  };
  return fillAll(CMA, 0);
};
