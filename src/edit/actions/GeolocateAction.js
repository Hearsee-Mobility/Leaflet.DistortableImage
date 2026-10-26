L.GeolocateAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    const edit = overlay.editing;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'explore',
      tooltip: overlay.options.translation.geolocateImage,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  async addHooks() {
    const image = this._overlay.getElement();
    let imageData;

    try {
      imageData = await L.EXIF.fetchMetadata(image.src);
    } catch (error) {
      console.log('Could not load image for geolocation:', error.message);
      return;
    }

    console.log(this._readGeolocation(imageData) || 'No EXIF geolocation data found');
  },

  _readGeolocation(imageData) {
    try {
      return L.EXIF.readGeolocation(L.EXIF.readTags(imageData));
    } catch (error) {
      return null;
    }
  },
});
