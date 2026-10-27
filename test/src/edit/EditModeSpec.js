import {addLoadedOverlay, createMap, pressKey, removeMap} from '../../helpers.js';

describe('Image edit modes', function() {
  let map;

  beforeEach(function() {
    map = createMap();
  });

  afterEach(function() {
    removeMap(map);
  });

  describe('locking', function() {
    it('Stops dragging the image when it enters lock mode', async function() {
      const overlay = await addLoadedOverlay(map);

      overlay.editing.setMode('lock');

      expect(overlay.editing.dragging).to.be.undefined;
    });

    it('Resumes dragging the image when it leaves lock mode', async function() {
      const overlay = await addLoadedOverlay(map);
      overlay.editing.setMode('lock');

      overlay.editing.setMode('distort');

      expect(overlay.editing.dragging).to.be.ok;
    });

    it('Returns to the configured mode when a locked image is unlocked', async function() {
      const overlay = await addLoadedOverlay(map, {mode: 'rotate'});
      overlay.select();
      overlay.editing.setMode('lock');

      pressKey('u');

      expect(overlay.editing.getMode()).to.equal('rotate');
    });

    it('Leaves no mode when an image configured to start locked is unlocked', async function() {
      const overlay = await addLoadedOverlay(map, {mode: 'lock'});
      overlay.select();

      pressKey('u');

      expect(overlay.editing.getMode()).to.equal('');
    });
  });

  describe('cycling', function() {
    it('Wraps to the first mode when moving past the last mode', async function() {
      const overlay = await addLoadedOverlay(map);
      overlay.editing.setMode('lock');

      overlay.editing.nextMode();

      expect(overlay.editing.getMode()).to.equal('drag');
    });

    it('Reports no mode while editing is disabled', async function() {
      const overlay = await addLoadedOverlay(map);

      overlay.editing.disable();

      expect(overlay.editing.getMode()).to.be.undefined;
    });
  });

  describe('changing tools', function() {
    it('Falls back to the first mode when the active mode tool is removed', async function() {
      const overlay = await addLoadedOverlay(map);

      overlay.editing.removeTool(L.DistortAction);

      expect(overlay.editing.getMode()).to.equal('drag');
    });

    it('Leaves no mode when the only mode tool is removed', async function() {
      const overlay = await addLoadedOverlay(map, {actions: [L.DistortAction]});

      overlay.editing.removeTool(L.DistortAction);

      expect(overlay.editing.getMode()).to.equal('');
    });

    it('Offers a mode once its tool is added', async function() {
      const overlay = await addLoadedOverlay(map, {actions: [L.DistortAction]});

      overlay.editing.addTool(L.RotateAction);

      expect(overlay.editing.hasMode('rotate')).to.be.true;
    });

    it('Ignores a tool that is already present', async function() {
      const overlay = await addLoadedOverlay(map, {actions: [L.DistortAction]});

      overlay.editing.addTool(L.DistortAction);

      expect(overlay.editing.editActions).to.eql([L.DistortAction]);
    });
  });
});
