L.EXIF = {
  geolocationTags: ['GPSImgDirection', 'GPSImgDirectionRef', 'Orientation'],

  orientationDegrees: {3: 180, 6: -90, 8: 90},

  readTags(imageData) {
    return ExifReader.load(imageData, {
      expanded: true,
      includeTags: {exif: this.geolocationTags, gps: true},
    });
  },

  readGeolocation(tags) {
    if (!tags.gps) {
      return null;
    }

    return {
      latitude: tags.gps.Latitude,
      longitude: tags.gps.Longitude,
      altitude: tags.gps.Altitude,
      angle: this._readAngle(tags.exif || {}),
    };
  },

  _readAngle(exif) {
    let degrees = 0;

    if (exif.GPSImgDirection && exif.GPSImgDirectionRef) {
      const [numerator, denominator] = exif.GPSImgDirection.value;
      degrees += numerator / denominator - 90;
    }

    if (exif.Orientation) {
      degrees += this.orientationDegrees[exif.Orientation.value] || 0;
    }

    return (Math.PI / 180) * degrees;
  },
};
