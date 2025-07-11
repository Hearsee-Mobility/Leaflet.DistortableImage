describe('L.DistortableCollection.Edit', () => {
  let map;
  let overlay;
  let overlay2;
  let overlay3;
  let imgGroup;

  beforeEach((done) => {
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
    L.DomEvent.on(overlay3, 'load', () => {
      done();
    });
  });

  afterEach(() => {
    imgGroup.removeLayer(overlay);
    imgGroup.removeLayer(overlay2);
    imgGroup.removeLayer(overlay3);
  });

  describe('#_decollectAll', () => {
    it('Should remove the "selected" class from all images', () => {
      const img = overlay.getElement();
      const img2 = overlay2.getElement();

      L.DomUtil.addClass(img, 'collected');
      L.DomUtil.addClass(img2, 'collected');

      map.getContainer().click();

      // we deselect after 3ms to confirm the click wasn't a dblclick
      setTimeout(() => {
        expect(L.DomUtil.getClass(img)).to.not.include('collected');
        expect(L.DomUtil.getClass(img2)).to.not.include('collected');
      }, 3000);
    });

    it("Should hide all images handles unless they're lock handles", () => {
      const edit = overlay.editing;
      const edit2 = overlay2.editing;
      const distortHandleState = [];
      const lockHandleState = [];

      // turn on lock handles for one of the DistortableImageOverlay instances.
      edit2._toggleLockMode();

      // then trigger _decollectAll
      map.getContainer().click();

      setTimeout(() => {
        edit._handles.distort.eachLayer((handle) => {
          const icon = handle.getElement();
          distortHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
        });

        edit2._handles.lock.eachLayer((handle) => {
          const icon = handle.getElement();
          lockHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
        });

        expect(distortHandleState).to.deep.equal(['0', '0', '0', '0']);
        // opacity for lockHandles is unset because we never altered it to hide it as part of deselection
        expect(lockHandleState).to.deep.equal(['', '', '', '']);
      }, 3000);
    });

    it("Should remove an image's individual toolbar instances regardless of lock handles", () => {
      const edit2 = overlay2.editing;

      edit2._toggleLockMode();

      // select image to initially create individual toolbar instance (single selection interface)
      overlay2.getElement().click();

      expect(edit2.toolbar).to.not.be.false;

      // then trigger _decollectAll
      map.getContainer().click();

      setTimeout(() => {
        expect(edit2.toolbar).to.be.false;
      }, 3000);
    });
  });

  describe('#_addToolbar', () => {
    it('is invoked on the click event that follows mousedown multi-select', () => {
      expect(map._toolbars).to.be.empty;

      // need both bc simulated `mousedown`s don't fire `click` events afterwards like regular user generated `mousedown`s.
      chai.simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
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
      chai.simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      imgGroup.editing._addToolbar();

      expect(Object.keys(map._toolbars)).to.have.lengthOf(1);
    });

    it('is invoked on map click', () => {
      map.getContainer().click();
      setTimeout(() => {
        expect(map._toolbars).to.be.empty;
      }, 3000);
    });

    it('is invoked on shift + mousedown when it toggles the image *out* of multi-select', () => {
      // deselecting the image removes the control toolbar
      chai.simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
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
      chai.simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      chai.simulateEvent(overlay3.getElement(), 'mousedown', {
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
      chai.simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      chai.simulateEvent(overlay2.getElement(), 'mousedown', {
        shiftKey: true,
      });
      chai.simulateEvent(overlay3.getElement(), 'mousedown', {
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
      chai.simulateEvent(overlay.getElement(), 'mousedown', {shiftKey: true});
      chai.simulateEvent(overlay3.getElement(), 'mousedown', {
        shiftKey: true,
      });
      window.confirm = sinon.spy();
    });

    it('removes a collection of layers', () => {
      const layers = imgGroup.getLayers();
      expect(layers).to.include.members([overlay, overlay2, overlay3]);

      imgGroup.editing._removeGroup();

      expect(layers).to.not.have.members([overlay, overlay3]);
      expect(layers).to.include.members([overlay2]);
    });

    it('removes the layers from the map on removal from group', () => {
      const id = imgGroup.getLayerId(overlay);
      const id2 = imgGroup.getLayerId(overlay2);
      const id3 = imgGroup.getLayerId(overlay3);

      expect(map._layers).to.include.all.keys(id, id2, id3);

      imgGroup.editing._removeGroup();

      expect(map._layers).to.not.have.all.keys(id, id3);
      expect(map._layers).to.include.all.keys(id2);
    });
  });
});
