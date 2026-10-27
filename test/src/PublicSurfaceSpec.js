import {createMap, removeMap} from '../helpers.js';

const constructors = [
  'BorderAction',
  'DeleteAction',
  'DistortAction',
  'DistortHandle',
  'DistortableCollection',
  'DistortableCollection.Edit',
  'DistortableImage.ControlBar',
  'DistortableImage.Edit',
  'DistortableImage.Keymapper',
  'DistortableImage.PopupBar',
  'DistortableImageOverlay',
  'DragAction',
  'DragHandle',
  'EditAction',
  'EditHandle',
  'ExportAction',
  'FreeRotateAction',
  'FreeRotateHandle',
  'GeolocateAction',
  'IconSet',
  'KeymapperIconSet',
  'LockAction',
  'LockHandle',
  'Map.BoxCollector',
  'Map.DoubleClickLabels',
  'OpacitiesAction',
  'OpacitiesToolbar2',
  'OpacityAction',
  'RestoreAction',
  'RotateAction',
  'RotateHandle',
  'ScaleAction',
  'ScaleHandle',
  'StackAction',
  'ToolbarIconSet',
  'UnlockAction',
];

const factories = [
  'distortHandle',
  'distortableCollection',
  'distortableCollection.edit',
  'distortableImage.controlBar',
  'distortableImage.edit',
  'distortableImage.keymapper',
  'distortableImage.popupBar',
  'distortableImageOverlay',
  'dragHandle',
  'editAction',
  'freeRotateHandle',
  'lockHandle',
  'rotateHandle',
  'scaleHandle',
];

const namespaces = ['EXIF', 'IconUtil', 'ImageUtil', 'MatrixUtil', 'TrigUtil', 'Utils'];

function lookUp(path) {
  return path.split('.').reduce((owner, key) => owner && owner[key], L);
}

function pathsNotOfType(paths, type) {
  return paths.filter((path) => typeof lookUp(path) !== type);
}

describe('Public surface', function() {
  it('Exposes every constructor on L', function() {
    expect(pathsNotOfType(constructors, 'function')).to.eql([]);
  });

  it('Exposes every factory on L', function() {
    expect(pathsNotOfType(factories, 'function')).to.eql([]);
  });

  it('Exposes every utility namespace on L', function() {
    expect(pathsNotOfType(namespaces, 'object')).to.eql([]);
  });

  it('Aliases the lower-case distortableImage namespace to DistortableImage', function() {
    expect(L.distortableImage).to.equal(L.DistortableImage);
  });

  describe('on every map', function() {
    let map;

    beforeEach(function() {
      map = createMap();
    });

    afterEach(function() {
      removeMap(map);
    });

    it('Adds the box collector handler', function() {
      expect(map.boxCollector).to.be.an.instanceof(L.Map.BoxCollector);
    });

    it('Adds the double-click labels handler', function() {
      expect(map.doubleClickLabels).to.be.an.instanceof(L.Map.DoubleClickLabels);
    });

    it('Adds the Google Mutant base layer method', function() {
      expect(map.addGoogleMutant).to.be.a('function');
    });

    it('Marks the map container with the ldi class', function() {
      expect(L.DomUtil.hasClass(map.getContainer(), 'ldi')).to.be.true;
    });
  });
});
