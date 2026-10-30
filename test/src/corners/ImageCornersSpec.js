import {ImageCorners} from '../../../src/corners/ImageCorners.ts';

const world = {top: 0, bottom: 2560};

/* Positions are {lat, lng}; north is up, so pixel y runs opposite to latitude. */
function flatProjection(worldBounds = world) {
  return {
    project: (position) => ({x: position.lng, y: -position.lat}),
    unproject: (point) => ({lat: -point.y, lng: point.x}),
    worldBounds: worldBounds,
  };
}

function at(x, y) {
  return {lat: -y, lng: x};
}

function rectangle() {
  return [at(1000, 1000), at(1100, 1000), at(1000, 1050), at(1100, 1050)];
}

function pixelsOf(imageCorners, projection = flatProjection()) {
  return imageCorners.current.map((position) => {
    const point = projection.project(position);
    return [Math.round(point.x * 1e6) / 1e6, Math.round(point.y * 1e6) / 1e6];
  });
}

function createCorners(corners = rectangle(), worldBounds = world) {
  return new ImageCorners(corners, flatProjection(worldBounds));
}

describe('Image corners', function() {
  describe('moving', function() {
    it('Moves every corner by the offset when moved', function() {
      const imageCorners = createCorners();

      imageCorners.moveBy({x: 40, y: -25});

      expect(pixelsOf(imageCorners)).to.deep.equal([[1040, 975], [1140, 975], [1040, 1025], [1140, 1025]]);
    });

    it('Leaves the corners in place when a move would carry one past the top of the world', function() {
      const imageCorners = createCorners();

      imageCorners.moveBy({x: 0, y: -990});

      expect(pixelsOf(imageCorners)).to.deep.equal(pixelsOf(createCorners()));
    });

    it('Reports a move past the top of the world as refused', function() {
      const imageCorners = createCorners();

      expect(imageCorners.moveBy({x: 0, y: -990})).to.be.false;
    });

    it('Leaves the corners in place when a move would carry one into the bottom edge of the world', function() {
      const imageCorners = createCorners();

      imageCorners.moveBy({x: 0, y: 1500});

      expect(pixelsOf(imageCorners)).to.deep.equal(pixelsOf(createCorners()));
    });

    it('Moves anywhere when the world has no edges', function() {
      const imageCorners = createCorners(rectangle(), null);

      imageCorners.moveBy({x: 0, y: -5000});

      expect(pixelsOf(imageCorners)[0]).to.deep.equal([1000, -4000]);
    });
  });

  describe('setting corners', function() {
    it('Replaces every corner when given four new ones', function() {
      const imageCorners = createCorners();

      imageCorners.setCorners([at(0, 100), at(50, 100), at(0, 150), at(50, 150)]);

      expect(pixelsOf(imageCorners)).to.deep.equal([[0, 100], [50, 100], [0, 150], [50, 150]]);
    });

    it('Moves only the named corner when one corner is set', function() {
      const imageCorners = createCorners();

      imageCorners.setCorner(3, at(1200, 1080));

      expect(pixelsOf(imageCorners)).to.deep.equal([[1000, 1000], [1100, 1000], [1000, 1050], [1200, 1080]]);
    });

    it('Leaves the corners in place when a single corner is set past the top of the world', function() {
      const imageCorners = createCorners();

      imageCorners.setCorner(0, at(1000, 5));

      expect(pixelsOf(imageCorners)).to.deep.equal(pixelsOf(createCorners()));
    });
  });

  describe('scaling', function() {
    it('Doubles each corner\'s distance from the center when scaled by two', function() {
      const imageCorners = createCorners();

      imageCorners.scaleBy(2);

      expect(pixelsOf(imageCorners)).to.deep.equal([[950, 975], [1150, 975], [950, 1075], [1150, 1075]]);
    });

    it('Leaves the corners in place when scaled by zero', function() {
      const imageCorners = createCorners();

      imageCorners.scaleBy(0);

      expect(pixelsOf(imageCorners)).to.deep.equal(pixelsOf(createCorners()));
    });

    it('Refuses to shrink when the top edge is already at the minimum edge length', function() {
      const imageCorners = createCorners();

      imageCorners.scaleBy(0.5, 100);

      expect(pixelsOf(imageCorners)).to.deep.equal(pixelsOf(createCorners()));
    });

    it('Shrinks when the top edge is longer than the minimum edge length', function() {
      const imageCorners = createCorners();

      imageCorners.scaleBy(0.5, 99);

      expect(pixelsOf(imageCorners)[0]).to.deep.equal([1025, 1012.5]);
    });

    it('Grows when the top edge is already at the minimum edge length', function() {
      const imageCorners = createCorners();

      imageCorners.scaleBy(2, 100);

      expect(pixelsOf(imageCorners)[0]).to.deep.equal([950, 975]);
    });
  });

  describe('rotating', function() {
    it('Turns each corner a quarter turn clockwise about the center when rotated by a quarter turn', function() {
      const imageCorners = createCorners();

      imageCorners.rotateBy(Math.PI / 2);

      expect(pixelsOf(imageCorners)).to.deep.equal([[1075, 975], [1075, 1075], [1025, 975], [1025, 1075]]);
    });
  });

  describe('angle', function() {
    it('Reads an upright image as unrotated', function() {
      expect(createCorners().angle()).to.equal(0);
    });

    it('Reads the angle the image was rotated by', function() {
      const imageCorners = createCorners();

      imageCorners.rotateBy(Math.PI / 6);

      expect(imageCorners.angle()).to.be.closeTo(Math.PI / 6, 0.02);
    });

    it('Measures the angle between whole pixels', function() {
      const nearlyUpright = createCorners([at(1000, 1000), at(1100, 1000.4), at(1000, 1050), at(1100, 1050)]);

      expect(nearlyUpright.angle()).to.equal(0);
    });

    it('Reads a counterclockwise turn as the remainder of a full turn', function() {
      const imageCorners = createCorners();

      imageCorners.rotateBy(-Math.PI / 6);

      expect(imageCorners.angle()).to.be.closeTo((11 * Math.PI) / 6, 0.02);
    });

    it('Reads a horizontally mirrored image as unrotated', function() {
      const mirrored = createCorners([at(1100, 1000), at(1000, 1000), at(1100, 1050), at(1000, 1050)]);

      expect(mirrored.angle()).to.be.closeTo(0, 1e-9);
    });
  });

  describe('center', function() {
    it('Places the center at the average of the corners', function() {
      expect(createCorners().center()).to.deep.equal(at(1050, 1025));
    });
  });

  describe('restoring', function() {
    it('Returns every corner to the original corners when restored after edits', function() {
      const imageCorners = createCorners();
      imageCorners.scaleBy(2);
      imageCorners.rotateBy(1);

      imageCorners.restore();

      expect(pixelsOf(imageCorners)).to.deep.equal(pixelsOf(createCorners()));
    });

    it('Leaves the caller\'s corners untouched when the corners are edited', function() {
      const given = rectangle();
      const imageCorners = createCorners(given);

      imageCorners.scaleBy(2);

      expect(given).to.deep.equal(rectangle());
    });

    it('Returns to newly placed corners when restored after placing', function() {
      const imageCorners = createCorners([]);
      imageCorners.place(rectangle());
      imageCorners.scaleBy(2);

      imageCorners.restore();

      expect(pixelsOf(imageCorners)).to.deep.equal(pixelsOf(createCorners()));
    });
  });

  describe('edited', function() {
    it('Reads as unedited before any change', function() {
      expect(createCorners().isEdited()).to.be.false;
    });

    it('Reads as edited once the corners change', function() {
      const imageCorners = createCorners();

      imageCorners.moveBy({x: 1, y: 0});

      expect(imageCorners.isEdited()).to.be.true;
    });

    it('Reads as unedited after restoring', function() {
      const imageCorners = createCorners();
      imageCorners.moveBy({x: 1, y: 0});

      imageCorners.restore();

      expect(imageCorners.isEdited()).to.be.false;
    });

    it('Reads as unedited after a change that leaves the corners where they were', function() {
      const imageCorners = createCorners();

      imageCorners.scaleBy(0.5, 100);

      expect(imageCorners.isEdited()).to.be.false;
    });

    it('Reports an edit without consulting the projection once the change is made', function() {
      const projection = flatProjection();
      const imageCorners = new ImageCorners(rectangle(), projection);
      imageCorners.moveBy({x: 1, y: 0});
      projection.project = () => {
        throw new Error('No map');
      };

      expect(imageCorners.isEdited()).to.be.true;
    });

    it('Reads as unedited after a refused change', function() {
      const imageCorners = createCorners();

      imageCorners.moveBy({x: 0, y: -990});

      expect(imageCorners.isEdited()).to.be.false;
    });
  });

  describe('current corners', function() {
    it('Keeps one corners array across edits', function() {
      const imageCorners = createCorners();
      const current = imageCorners.current;

      imageCorners.scaleBy(2);

      expect(imageCorners.current).to.equal(current);
    });
  });
});
