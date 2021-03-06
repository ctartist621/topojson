var minHeap = require("./min-heap");

module.exports = function(topology, minArea) {
  var heap = minHeap(),
      maxArea = 0,
      triangle,
      N = 0,
      M = 0;

  topology.arcs.forEach(function(arc) {
    var triangles = [];

    arc.forEach(transformAbsolute()); // TODO projection

    for (var i = 1, n = arc.length - 1; i < n; ++i) {
      triangle = arc.slice(i - 1, i + 2);
      triangle[1].area = area(triangle);
      triangles.push(triangle);
      heap.push(triangle);
    }

    // Always keep the arc endpoints!
    arc[0].area = arc[n].area = Infinity;

    N += n + 1;

    for (var i = 0, n = triangles.length; i < n; ++i) {
      triangle = triangles[i];
      triangle.previous = triangles[i - 1];
      triangle.next = triangles[i + 1];
    }
  });

  while (triangle = heap.pop()) {
    var previous = triangle.previous,
        next = triangle.next;

    // If the area of the current point is less than that of the previous point
    // to be eliminated, use the latter's area instead. This ensures that the
    // current point cannot be eliminated without eliminating previously-
    // eliminated points.
    if (triangle[1].area < maxArea) triangle[1].area = maxArea;
    else maxArea = triangle[1].area;

    if (previous) {
      previous.next = next;
      previous[2] = triangle[2];
      update(previous);
    }

    if (next) {
      next.previous = previous;
      next[0] = triangle[0];
      update(next);
    }
  }

  topology.arcs = topology.arcs.map(function(arc) {
    return arc.filter(function(point, i) {
      return point.area >= minArea;
    });
  });

  topology.arcs.forEach(function(arc) {
    arc.forEach(transformRelative());
    M += arc.length;
  });

  function update(triangle) {
    heap.remove(triangle);
    triangle[1].area = area(triangle);
    heap.push(triangle);
  }

  console.info("retained " + M + " / " + N + " points (" + Math.round((M / N) * 100) + "%)")

  return topology;
};

function area(t) {
  return Math.abs((t[0][0] - t[2][0]) * (t[1][1] - t[0][1]) - (t[0][0] - t[1][0]) * (t[2][1] - t[0][1]));
}

function transformAbsolute() {
  var x0 = 0,
      y0 = 0;
  return function(point, i) {
    point[0] = (x0 += point[0]);
    point[1] = (y0 += point[1]);
  };
}

function transformRelative() {
  var x0 = 0,
      y0 = 0;
  return function(point, i) {
    var x1 = point[0],
        y1 = point[1];
    point[0] = x1 - x0;
    point[1] = y1 - y0;
    x0 = x1;
    y0 = y1;
  };
}
