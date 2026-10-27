import {addLoadedOverlay, createMap, pressKey, removeMap} from '../../helpers.js';

describe('Image keymap', function() {
  let map;
  let overlay;

  beforeEach(async function() {
    map = createMap();
    overlay = await addLoadedOverlay(map);
    overlay.select();
  });

  afterEach(function() {
    removeMap(map);
  });

  describe('mode keys', function() {
    it('Switches to rotate mode when r is pressed', function() {
      pressKey('r');

      expect(overlay.editing.getMode()).to.equal('rotate');
    });

    it('Switches to free rotate mode when f is pressed', function() {
      pressKey('f');

      expect(overlay.editing.getMode()).to.equal('freeRotate');
    });

    it('Switches to scale mode when s is pressed', function() {
      pressKey('s');

      expect(overlay.editing.getMode()).to.equal('scale');
    });

    it('Switches to drag mode when D is pressed', function() {
      pressKey('D');

      expect(overlay.editing.getMode()).to.equal('drag');
    });

    it('Switches to distort mode when d is pressed', function() {
      pressKey('r');

      pressKey('d');

      expect(overlay.editing.getMode()).to.equal('distort');
    });

    it('Switches to lock mode when l is pressed', function() {
      pressKey('l');

      expect(overlay.editing.getMode()).to.equal('lock');
    });

    it('Returns to the configured mode when u is pressed on a locked image', function() {
      pressKey('l');

      pressKey('u');

      expect(overlay.editing.getMode()).to.equal('distort');
    });
  });

  describe('appearance keys', function() {
    it('Outlines the image when b is pressed', function() {
      pressKey('b');

      expect(overlay.getElement().style.outline).to.equal('red solid 1px');
    });

    it.fails('Makes the image half transparent when o is pressed', function() {
      pressKey('o');

      expect(overlay.getElement().style.opacity).to.equal('0.5');
    });
  });

  describe('selection keys', function() {
    it('Deselects the image when Escape is pressed', function() {
      pressKey('Escape');

      expect(overlay.isSelected()).to.be.false;
    });
  });

  describe('ignored presses', function() {
    it('Keeps the mode when a mode key is pressed on an unselected image', function() {
      overlay.deselect();

      pressKey('r');

      expect(overlay.editing.getMode()).to.equal('distort');
    });

    it('Keeps the mode when a mode key is pressed on an image with its toolbar suppressed', async function() {
      const quietOverlay = await addLoadedOverlay(map, {suppressToolbar: true});
      quietOverlay.select();

      pressKey('r');

      expect(quietOverlay.editing.getMode()).to.equal('distort');
    });

    it('Keeps the mode when a key with no binding is pressed', function() {
      pressKey('z');

      expect(overlay.editing.getMode()).to.equal('distort');
    });
  });
});

describe('Keyboard legend', function() {
  let map;

  beforeEach(function() {
    map = createMap();
    // Skip the init hook's auto-enable, which throws on the first legend (pinned below)
    L.DistortableImage.Keymapper.prototype._n = L.DistortableImage.Keymapper.prototype._n || 1;
    L.distortableImage.keymapper(map).enable();
  });

  afterEach(function() {
    removeMap(map);
  });

  it.fails('Builds the first legend on a page without throwing', function() {
    delete L.DistortableImage.Keymapper.prototype._n;

    expect(() => L.distortableImage.keymapper(map)).to.not.throw();
  });

  function shortcutsFor(label) {
    const rows = Array.from(map.getContainer().querySelectorAll('#ldi-keymapper tr'));
    const row = rows.find((candidate) => candidate.querySelector('span').textContent === label);
    if (!row) {
      return [];
    }
    return Array.from(row.querySelectorAll('kbd')).map((key) => key.textContent);
  }

  it('Lists s as the scale mode shortcut', function() {
    expect(shortcutsFor('Scale Mode')).to.eql(['s']);
  });

  it.fails('Lists r as the rotate mode shortcut', function() {
    expect(shortcutsFor('Rotate Mode')).to.eql(['r']);
  });

  it.fails('Lists f as the free rotate mode shortcut', function() {
    expect(shortcutsFor('Free Rotate Mode')).to.eql(['f']);
  });
});
