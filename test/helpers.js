/*
 * Dispatches a MouseEvent of `type` on `element`.
 * `params` takes MouseEvent init properties; see
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
 */
export function simulateEvent(element, type, params) {
  params = params || {
    bubbles: type != 'mouseleave' && type != 'mouseeenter',
    cancelable: type != 'mousemove' && type != 'mouseleave' && type != 'mouseeenter',
  };
  const event = new MouseEvent(type, params);
  return element.dispatchEvent(event);
}

/* Presses `key` on the document; the event bubbles to window, where image keymaps listen. */
export function pressKey(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', {key: key, bubbles: true}));
}

/* Clicks the map, then waits for the delayed `singleclick` the map fires once it rules out a dblclick. */
export function singleClickMap(map) {
  const singleClick = new Promise(function(resolve) {
    map.once('singleclick', function() {
      setTimeout(resolve);
    });
  });
  map.getContainer().click();
  return singleClick;
}

/*
 * Resolves once every listener for the next `load` event from an image element or a Leaflet layer
 * has run, so the overlay's own load handling finishes before the test continues.
 */
export function waitForLoad(target) {
  return new Promise(function(resolve) {
    L.DomEvent.on(target, 'load', function() {
      setTimeout(resolve);
    });
  });
}

export function rectangleCorners() {
  return [
    L.latLng(41.7934, -87.6052),
    L.latLng(41.7934, -87.5852),
    L.latLng(41.7834, -87.6052),
    L.latLng(41.7834, -87.5852),
  ];
}

/* A fixed-size map, so pixel expectations don't depend on the test viewport. Pair with `removeMap`. */
export function createMap(mapOptions) {
  const container = L.DomUtil.create('div', '', document.body);
  container.style.width = '800px';
  container.style.height = '600px';
  return L.map(container, mapOptions).setView([41.7889, -87.5952], 15);
}

/* Removes every layer, which disables editing and unbinds the window and document key listeners. */
export function removeMap(map) {
  const container = map.getContainer();
  map.remove();
  L.DomUtil.remove(container);
}

export async function addLoadedOverlay(map, options) {
  const overlay = L.distortableImageOverlay(
    '/examples/example.jpg',
    Object.assign({corners: rectangleCorners()}, options),
  ).addTo(map);
  await waitForLoad(overlay.getElement());
  return overlay;
}

export async function addLoadedCollection(map, cornerSets) {
  const collection = L.distortableCollection().addTo(map);
  const overlays = cornerSets.map(function(corners) {
    return L.distortableImageOverlay('/examples/example.jpg', {corners: corners});
  });
  overlays.forEach(function(overlay) {
    collection.addLayer(overlay);
  });
  await Promise.all(overlays.map(waitForLoad));
  return {collection: collection, overlays: overlays};
}

/* Unrounded projected pixels; Leaflet's layer points are rounded to whole pixels. */
export function cornerPixels(overlay) {
  const map = overlay._map;
  return overlay.getCorners().map(function(corner) {
    return map.project(corner);
  });
}

export function offsetsFrom(points, origin) {
  return points.map(function(point) {
    return L.point(point.x - origin.x, point.y - origin.y);
  });
}

/* Largest distance between matching points, for comparing positions without float noise. */
export function largestGap(points, expectedPoints) {
  return Math.max.apply(null, points.map(function(point, index) {
    return L.point(point).distanceTo(L.point(expectedPoints[index]));
  }));
}
