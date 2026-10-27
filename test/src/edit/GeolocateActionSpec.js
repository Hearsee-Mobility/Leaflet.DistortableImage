import {vi} from 'vitest';

// A JPEG at 41°49'12"N 71°24'36"W, 150m up, facing 90° true north, with orientation 6
const geotaggedImageUrl = [
  'data:image/jpeg;base64,/9j/4QDURXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAYAAIglAAQAAAABAAAAJgAAAAAACAABAAIAA',
  'AACTgAAAAACAAUAAAADAAAAjAADAAIAAAACVwAAAAAEAAUAAAADAAAApAAFAAEAAAABAAAAAAAGAAUAAAABAAAAvAAQAAIAAAACV',
  'AAAAAARAAUAAAABAAAAxAAAAAAAAAApAAAAAQAAADEAAAABAAAADAAAAAEAAABHAAAAAQAAABgAAAABAAAAJAAAAAEAAACWAAAAA',
  'QAAAFoAAAAB/9k=',
].join('');
const untaggedImageUrl = 'data:image/jpeg;base64,/9j/2Q==';

const readImageGeolocation = (imageUrl) => L.EXIF.fetchMetadata(imageUrl)
    .then((imageData) => L.EXIF.readGeolocation(L.EXIF.readTags(imageData)));

const activateGeolocateFor = (imageUrl) => {
  const action = Object.create(L.GeolocateAction.prototype);
  action._overlay = {getElement: () => ({src: imageUrl})};
  return action.addHooks();
};

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

  it('Returns no geolocation when the GPS tags have no coordinates', function() {
    expect(L.EXIF.readGeolocation({gps: {Altitude: 150}})).to.equal(null);
  });

  it('Reads only the metadata prefix of a large image', function() {
    return L.EXIF.fetchMetadata('/examples/large.jpg').then((imageData) => {
      expect(imageData.byteLength).to.equal(L.EXIF.metadataPrefixBytes);
    });
  });

  it('Reads the whole image when it is smaller than the metadata prefix', function() {
    return L.EXIF.fetchMetadata(untaggedImageUrl).then((imageData) => {
      expect(imageData.byteLength).to.equal(4);
    });
  });
});

describe('L.GeolocateAction', function() {
  let consoleLog;

  beforeEach(function() {
    consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(function() {
    consoleLog.mockRestore();
  });

  it('Logs the geolocation of the overlay image when activated', function() {
    return activateGeolocateFor(geotaggedImageUrl).then(() => {
      expect(consoleLog).toHaveBeenCalledWith(expect.objectContaining({altitude: 150}));
    });
  });

  it('Logs a load failure when the image request fails', function() {
    return activateGeolocateFor('/examples/missing.jpg').then(() => {
      expect(consoleLog).toHaveBeenCalledWith('Could not load image for geolocation:', 'HTTP 404');
    });
  });

  it('Logs a notice instead of throwing when the image has no EXIF data', function() {
    return activateGeolocateFor(untaggedImageUrl).then(() => {
      expect(consoleLog).toHaveBeenCalledWith('No EXIF geolocation data found');
    });
  });
});
