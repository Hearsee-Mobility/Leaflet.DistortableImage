import {vi} from 'vitest';
import {
  addLoadedOverlay,
  cornerPixels,
  createMap,
  largestGap,
  offsetsFrom,
  rectangleCorners,
  removeMap,
} from '../helpers.js';

const halfPixel = 0.5;

describe('Overlay corners', function() {
  let map;
  let overlay;

  beforeEach(async function() {
    map = createMap();
    overlay = await addLoadedOverlay(map);
  });

  afterEach(function() {
    removeMap(map);
  });

  function offsetsFromCenter() {
    return offsetsFrom(cornerPixels(overlay), map.project(overlay.getCenter()));
  }

  async function dragOnSimpleMap() {
    const simpleMap = createMap({crs: L.CRS.Simple});
    const simpleOverlay = await addLoadedOverlay(simpleMap);
    const before = cornerPixels(simpleOverlay);
    const start = simpleMap.project(simpleOverlay.getCenter());

    simpleOverlay.dragBy(
      simpleMap.unproject(start),
      simpleMap.unproject(start.add([40, -25])),
    );

    const after = cornerPixels(simpleOverlay);
    removeMap(simpleMap);
    return largestGap(after, before);
  }

  describe('dragging', function() {
    it('Moves every corner by the drag offset when dragged', function() {
      const expected = cornerPixels(overlay).map((point) => point.add([40, -25]));
      const start = map.project(overlay.getCenter());

      overlay.dragBy(map.unproject(start), map.unproject(start.add([40, -25])));

      expect(largestGap(cornerPixels(overlay), expected)).to.be.below(halfPixel);
    });

    it('Moves the image when dragged on a map with a simple coordinate system', async function() {
      expect(await dragOnSimpleMap()).to.be.above(halfPixel);
    });
  });

  describe('scaling', function() {
    it('Doubles each corner\'s distance from the center when scaled by two', function() {
      const expected = offsetsFromCenter().map((offset) => offset.multiplyBy(2));

      overlay.scaleBy(2);

      expect(largestGap(offsetsFromCenter(), expected)).to.be.below(halfPixel);
    });

    it('Keeps the center in place when scaled', function() {
      const center = overlay.getCenter();

      overlay.scaleBy(2);

      expect(overlay.getCenter()).to.be.closeToLatLng(center);
    });

    it('Leaves the corners unchanged when scaled by zero', function() {
      const before = cornerPixels(overlay);

      overlay.scaleBy(0);

      expect(largestGap(cornerPixels(overlay), before)).to.equal(0);
    });
  });

  describe('rotating', function() {
    function quarterTurnClockwise(offsets) {
      return offsets.map((offset) => L.point(-offset.y, offset.x));
    }

    it('Turns each corner a quarter turn about the center when rotated by 90 degrees', function() {
      const expected = quarterTurnClockwise(offsetsFromCenter());

      overlay.rotateBy(90);

      expect(largestGap(offsetsFromCenter(), expected)).to.be.below(halfPixel);
    });

    it('Reads the angle as radians when the unit is rad', function() {
      const expected = quarterTurnClockwise(offsetsFromCenter());

      overlay.rotateBy(Math.PI / 2, 'rad');

      expect(largestGap(offsetsFromCenter(), expected)).to.be.below(halfPixel);
    });

    it('Returns every corner to where it started when rotated a full turn', function() {
      const before = cornerPixels(overlay);

      overlay.rotateBy(360);

      expect(largestGap(cornerPixels(overlay), before)).to.be.below(halfPixel);
    });

    it('Reports the angle the image was rotated by', function() {
      overlay.rotateBy(30);

      expect(overlay.getAngle()).to.equal(30);
    });

    it('Sets an absolute angle regardless of the current rotation', function() {
      overlay.rotateBy(30);

      overlay.setAngle(45);

      expect(overlay.getAngle()).to.equal(45);
    });
  });

  describe('committing new corners', function() {
    it('Fires an update event when the corners change', function() {
      const onUpdate = vi.fn();
      overlay.on('update', onUpdate);

      overlay.scaleBy(2);

      expect(onUpdate).toHaveBeenCalled();
    });

    it('Marks the image as edited when the corners change', function() {
      overlay.scaleBy(2);

      expect(overlay.edited).to.be.true;
    });

    it('Shares one corners array between reads and edits', function() {
      const corners = overlay.getCorners();

      overlay.scaleBy(2);

      expect(overlay.getCorners()).to.equal(corners);
    });

    it('Ignores new corners when one would pass the top of the map', function() {
      const before = cornerPixels(overlay);
      const corners = rectangleCorners();
      corners[0] = L.latLng(89, corners[0].lng);

      overlay.setCorners(corners);

      expect(largestGap(cornerPixels(overlay), before)).to.equal(0);
    });

    it('Ignores a single corner moved past the top of the map', function() {
      const before = cornerPixels(overlay);

      overlay.setCorner(0, L.latLng(89, overlay.getCorner(0).lng));

      expect(largestGap(cornerPixels(overlay), before)).to.equal(0);
    });
  });

  describe('restoring', function() {
    it('Returns every corner to where it started when restored after edits', async function() {
      const unplacedOverlay = await addLoadedOverlay(map, {corners: undefined});
      const before = cornerPixels(unplacedOverlay);
      unplacedOverlay.scaleBy(2);
      unplacedOverlay.rotateBy(30);

      unplacedOverlay.restore();

      expect(largestGap(cornerPixels(unplacedOverlay), before)).to.be.below(halfPixel);
    });

    it('Returns every corner to the corners it was given when restored after edits', function() {
      const before = cornerPixels(overlay);
      overlay.scaleBy(2);

      overlay.restore();

      expect(largestGap(cornerPixels(overlay), before)).to.be.below(halfPixel);
    });

    it('Reads as unedited before it is added to a map', function() {
      const unaddedOverlay = L.distortableImageOverlay('/examples/example.jpg', {corners: rectangleCorners()});

      expect(unaddedOverlay.edited).to.be.false;
    });

    it('Still reports an edit after it is removed from the map', function() {
      overlay.scaleBy(2);

      overlay.remove();

      expect(overlay.edited).to.be.true;
    });

    it('Clears the edited flag when restored', function() {
      overlay.scaleBy(2);

      overlay.restore();

      expect(overlay.edited).to.be.false;
    });

    it('Fires a restore event when restored', function() {
      const onRestore = vi.fn();
      overlay.on('restore', onRestore);

      overlay.restore();

      expect(onRestore).toHaveBeenCalled();
    });
  });
});
