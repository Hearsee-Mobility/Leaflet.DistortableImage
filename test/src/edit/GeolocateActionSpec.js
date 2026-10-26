// A JPEG at 41°49'12"N 71°24'36"W, 150m up, facing 90° true north, with orientation 6
const geotaggedImageUrl = [
  'data:image/jpeg;base64,/9j/4QDURXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAYAAIglAAQAAAABAAAAJgAAAAAACAABAAIAA',
  'AACTgAAAAACAAUAAAADAAAAjAADAAIAAAACVwAAAAAEAAUAAAADAAAApAAFAAEAAAABAAAAAAAGAAUAAAABAAAAvAAQAAIAAAACV',
  'AAAAAARAAUAAAABAAAAxAAAAAAAAAApAAAAAQAAADEAAAABAAAADAAAAAEAAABHAAAAAQAAABgAAAABAAAAJAAAAAEAAACWAAAAA',
  'QAAAFoAAAAB/9k=',
].join('');
const untaggedImageUrl = 'data:image/jpeg;base64,/9j/2Q==';

const readImageGeolocation = (imageUrl) => fetch(imageUrl)
    .then((response) => response.arrayBuffer())
    .then((imageData) => L.EXIF.readGeolocation(L.EXIF.readTags(imageData)));

const activateGeolocateFor = (imageUrl) => L.GeolocateAction.prototype.addHooks.call({
  _overlay: {getElement: () => ({src: imageUrl})},
});

describe('L.EXIF', function() {
  it('Reads a signed latitude from the image GPS tags', function() {
    return readImageGeolocation(geotaggedImageUrl).then((geolocation) => {
      expect(geolocation.latitude).to.be.closeTo(41.82, 0.0001);
    });
  });

  it('Reads a signed longitude from the image GPS tags', function() {
    return readImageGeolocation(geotaggedImageUrl).then((geolocation) => {
      expect(geolocation.longitude).to.be.closeTo(-71.41, 0.0001);
    });
  });

  it('Reads the altitude from the image GPS tags', function() {
    return readImageGeolocation(geotaggedImageUrl).then((geolocation) => {
      expect(geolocation.altitude).to.equal(150);
    });
  });

  it('Combines compass heading and orientation into an angle in radians', function() {
    return readImageGeolocation(geotaggedImageUrl).then((geolocation) => {
      expect(geolocation.angle).to.be.closeTo(-Math.PI / 2, 0.0001);
    });
  });

  it('Returns no geolocation when the image has no GPS tags', function() {
    return readImageGeolocation(untaggedImageUrl).then((geolocation) => {
      expect(geolocation).to.equal(null);
    });
  });
});

describe('L.GeolocateAction', function() {
  let consoleLog;

  beforeEach(function() {
    consoleLog = sinon.stub(console, 'log');
  });

  afterEach(function() {
    consoleLog.restore();
  });

  it('Logs the geolocation of the overlay image when activated', function() {
    return activateGeolocateFor(geotaggedImageUrl).then(() => {
      expect(consoleLog.calledWithMatch({altitude: 150})).to.equal(true);
    });
  });

  it('Logs a notice instead of throwing when the image has no EXIF data', function() {
    return activateGeolocateFor(untaggedImageUrl).then(() => {
      expect(consoleLog.calledWith('No EXIF geolocation data found')).to.equal(true);
    });
  });
});
