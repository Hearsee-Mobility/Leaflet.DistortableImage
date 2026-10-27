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
