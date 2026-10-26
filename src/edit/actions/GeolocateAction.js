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

  addHooks() {
    const image = this._overlay.getElement();

    return fetch(image.src)
      .then((response) => response.arrayBuffer())
      .then((imageData) => L.EXIF.readGeolocation(L.EXIF.readTags(imageData)))
      .catch(() => null)
      .then((geolocation) => console.log(geolocation || 'No EXIF geolocation data found'));
  },
});
