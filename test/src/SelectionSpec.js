import {
  addLoadedCollection,
  addLoadedOverlay,
  createMap,
  pressKey,
  rectangleCorners,
  removeMap,
  simulateEvent,
} from '../helpers.js';

function shiftPress(overlay) {
  simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
}

function shiftedCorners(longitudeShift) {
  return rectangleCorners().map((corner) => L.latLng(corner.lat, corner.lng + longitudeShift));
}

describe('Image selection', function() {
  let map;

  beforeEach(function() {
    map = createMap();
  });

  afterEach(function() {
    removeMap(map);
  });

  it('Deselects the previously selected image when another image is selected', async function() {
    const first = await addLoadedOverlay(map);
    const second = await addLoadedOverlay(map, {corners: shiftedCorners(0.03)});
    first.select();

    second.select();

    expect(first.isSelected()).to.be.false;
  });

  it('Selects nothing when editing is disabled', async function() {
    const overlay = await addLoadedOverlay(map);
    overlay.editing.disable();

    overlay.select();

    expect(overlay.isSelected()).to.be.false;
  });
});

describe('Collection selection', function() {
  let map;
  let collection;
  let first;
  let second;

  beforeEach(async function() {
    map = createMap();
    const loaded = await addLoadedCollection(map, [rectangleCorners(), shiftedCorners(0.03)]);
    collection = loaded.collection;
    first = loaded.overlays[0];
    second = loaded.overlays[1];
  });

  afterEach(function() {
    removeMap(map);
  });

  it('Collects an image when it is shift-pressed', function() {
    shiftPress(first);

    expect(collection.isCollected(first)).to.be.true;
  });

  it('Releases a collected image when it is shift-pressed again', function() {
    shiftPress(first);

    shiftPress(first);

    expect(collection.isCollected(first)).to.be.false;
  });

  it('Keeps an image unselected when it is clicked while another image is collected', function() {
    shiftPress(first);

    second.select();

    expect(second.isSelected()).to.be.false;
  });

  it('Releases every collected image when Escape is pressed', function() {
    shiftPress(first);
    shiftPress(second);

    pressKey('Escape');

    expect(collection.anyCollected()).to.be.false;
  });

  it('Keeps images collected when a key with no binding is pressed', function() {
    shiftPress(first);

    pressKey('z');

    expect(collection.anyCollected()).to.be.true;
  });

  it('Releases an image when its editing is disabled', function() {
    shiftPress(first);

    first.editing.disable();

    expect(collection.isCollected(first)).to.be.false;
  });

  it('Releases every collected image when collection editing is disabled', function() {
    shiftPress(first);
    shiftPress(second);

    collection.editing.disable();

    expect(collection.anyCollected()).to.be.false;
  });
});
