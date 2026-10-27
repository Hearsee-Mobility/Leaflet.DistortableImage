import {vi} from 'vitest';
import {simulateEvent, singleClickMap, waitForLoad} from '../../helpers.js';

describe('L.DistortableCollection.Edit', () => {
  let map;
  let overlay;
  let overlay2;
  let overlay3;
  let imgGroup;

  beforeEach(async () => {
    map = L.map(L.DomUtil.create('div', '', document.body)).setView(
      [41.7896, -87.5996],
      15
    );

    overlay = L.distortableImageOverlay('/examples/example.jpg', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.6052),
        L.latLng(41.7834, -87.5852),
      ],
    });

    overlay2 = L.distortableImageOverlay('/examples/example.jpg', {
      corners: [
        L.latLng(41.7934, -87.605),
        L.latLng(41.7934, -87.585),
        L.latLng(41.7834, -87.605),
        L.latLng(41.7834, -87.585),
      ],
    });

    overlay3 = L.distortableImageOverlay('/examples/example.jpg', {
      corners: [
        L.latLng(41.7934, -87.6054),
        L.latLng(41.7934, -87.5854),
        L.latLng(41.7834, -87.6054),
        L.latLng(41.7834, -87.5854),
      ],
    });

    imgGroup = L.distortableCollection().addTo(map);

    imgGroup.addLayer(overlay);
    imgGroup.addLayer(overlay2);
    imgGroup.addLayer(overlay3);

    /* Forces the images to load before any tests are run. */
    await Promise.all([overlay, overlay2, overlay3].map(waitForLoad));
  });

  afterEach(() => {
    imgGroup.removeLayer(overlay);
    imgGroup.removeLayer(overlay2);
    imgGroup.removeLayer(overlay3);
  });

  describe('#_decollectAll', () => {
    it('Should remove the "selected" class from all images', async () => {
      const img = overlay.getElement();
      const img2 = overlay2.getElement();

      L.DomUtil.addClass(img, 'collected');
      L.DomUtil.addClass(img2, 'collected');

      await singleClickMap(map);

      expect(L.DomUtil.getClass(img)).to.not.include('collected');
      expect(L.DomUtil.getClass(img2)).to.not.include('collected');
    });

    it('Should hide every handle on uncollected images, lock handles included', async () => {
      const edit = overlay.editing;
      const edit2 = overlay2.editing;
      const distortHandleState = [];
      const lockHandleState = [];

      // turn on lock handles for one of the DistortableImageOverlay instances.
      edit2._toggleLockMode();

      // then trigger _decollectAll
      await singleClickMap(map);

      edit._handles.distort.eachLayer((handle) => {
        const icon = handle.getElement();
        distortHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      edit2._handles.lock.eachLayer((handle) => {
        const icon = handle.getElement();
        lockHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      expect(distortHandleState).to.deep.equal(['0', '0', '0', '0']);
      // lock handles stay visible only while their image is collected
      expect(lockHandleState).to.deep.equal(['0', '0', '0', '0']);
    });

    it("Should remove an image's individual toolbar instances regardless of lock handles", async () => {
      const edit2 = overlay2.editing;

      edit2._toggleLockMode();

      // select image to initially create individual toolbar instance (single selection interface)
      overlay2.getElement().click();

      expect(edit2.toolbar).to.not.be.false;

      // then trigger _decollectAll
      await singleClickMap(map);

      expect(edit2.toolbar).to.be.false;
    });
  });

  describe('#_addToolbar', () => {
    it('is invoked on the click event that follows mousedown multi-select', () => {
      expect(map._toolbars).to.be.empty;

      // need both bc simulated `mousedown`s don't fire `click` events afterwards like regular user generated `mousedown`s.
      simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      overlay.getElement().click();

      expect(Object.keys(map._toolbars)).to.have.lengthOf(1);
    });

    it('it adds a control toolbar to the map', () => {
      expect(map._toolbars).to.be.empty;
      imgGroup.editing._addToolbar();
      expect(Object.keys(map._toolbars)).to.have.lengthOf(1);
      expect(Object.keys(map._toolbars)[0]._container).className =
        'leaflet-control';
    });

    it('does not add multiple instances of a control toolbar', () => {
      expect(map._toolbars).to.be.empty;
      imgGroup.editing._addToolbar();
      imgGroup.editing._addToolbar();
      expect(Object.keys(map._toolbars)).to.have.lengthOf(1);
    });
  });

  describe('#_removeToolbar', () => {
    beforeEach(() => {
      // multi-select the image and add the toolbar
      simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      imgGroup.editing._addToolbar();

      expect(Object.keys(map._toolbars)).to.have.lengthOf(1);
    });

    it('is invoked on map click', async () => {
      await singleClickMap(map);

      expect(map._toolbars).to.be.empty;
    });

    it('is invoked on shift + mousedown when it toggles the image *out* of multi-select', () => {
      // deselecting the image removes the control toolbar
      simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      expect(map._toolbars).to.be.empty;
    });

    it('it removes a control toolbar from the map', () => {
      imgGroup.editing._removeToolbar();
      expect(map._toolbars).to.be.empty;
    });

    it('it returns false if there was no control toolbar to remove', () => {
      expect(imgGroup.editing._removeToolbar()).to.not.be.false;
      expect(imgGroup.editing._removeToolbar()).to.be.false;
    });
  });

  describe('#_lockGroup', () => {
    beforeEach(() => {
      simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      simulateEvent(overlay3.getElement(), 'mousedown', {
        shiftKey: true,
      });

      imgGroup.editing._lockGroup();
    });

    it('it only puts the multi-selected images in lock mode', () => {
      expect(overlay.editing._mode).to.equal('lock');
      expect(overlay3.editing._mode).to.equal('lock');

      expect(overlay2.editing._mode).to.not.equal('lock');
    });

    it('does not toggle lock mode', () => {
      imgGroup.editing._lockGroup();
      expect(overlay.editing._mode).to.equal('lock');
    });

    it('prevents images in that group from being dragged', () => {
      expect(overlay.editing.dragging).to.be.undefined;
      expect(overlay3.editing.dragging).to.be.undefined;

      expect(overlay2.editing.dragging).to.be.an.instanceOf(L.Draggable);
    });
  });

  describe('#_unlockGroup', () => {
    beforeEach(() => {
      simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      simulateEvent(overlay2.getElement(), 'mousedown', {
        shiftKey: true,
      });
      simulateEvent(overlay3.getElement(), 'mousedown', {
        shiftKey: true,
      });

      imgGroup.editing._lockGroup();
      expect(overlay.editing._mode).to.equal('lock');
    });

    it('it removes the multi-selected images from lock mode', () => {
      imgGroup.editing._unlockGroup();
      expect(overlay.editing._mode).to.not.equal('lock');
    });

    it('does not toggle lock mode', () => {
      imgGroup.editing._unlockGroup();
      imgGroup.editing._unlockGroup();
      expect(overlay.editing._mode).to.not.equal('lock');
    });
  });

  describe('#_removeGroup', () => {
    beforeEach(() => {
      // multi-selects the images to add them to the feature group
      simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      simulateEvent(overlay3.getElement(), 'mousedown', {
        shiftKey: true,
      });
      window.confirm = vi.fn().mockReturnValue(true);
    });

    it('removes a collection of layers', () => {
      const layers = imgGroup.getLayers();
      expect(layers).to.include.members([overlay, overlay2, overlay3]);

      imgGroup.editing._removeGroup();

      expect(imgGroup.getLayers()).to.have.members([overlay2]);
    });

    it('removes the layers from the map on removal from group', () => {
      const id = imgGroup.getLayerId(overlay);
      const id2 = imgGroup.getLayerId(overlay2);
      const id3 = imgGroup.getLayerId(overlay3);

      expect(map._layers).to.include.all.keys(id, id2, id3);

      imgGroup.editing._removeGroup();

      expect(map._layers).to.not.have.any.keys(id, id3);
      expect(map._layers).to.include.all.keys(id2);
    });
  });
});
