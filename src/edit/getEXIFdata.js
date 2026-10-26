L.EXIF = {
  geolocationTags: ['GPSImgDirection', 'GPSImgDirectionRef', 'Orientation'],

  orientationDegrees: {3: 180, 6: -90, 8: 90},

  // JPEG EXIF segments sit near the start of the file and are capped at 64 KiB
  metadataPrefixBytes: 128 * 1024,

  async fetchMetadata(source) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const prefix = new Uint8Array(this.metadataPrefixBytes);
    let filledLength = 0;

    while (filledLength < prefix.length) {
      const {done, value} = await reader.read();
      if (done) {
        return prefix.buffer.slice(0, filledLength);
      }
      const chunk = value.subarray(0, prefix.length - filledLength);
      prefix.set(chunk, filledLength);
      filledLength += chunk.length;
    }

    reader.cancel();
    return prefix.buffer;
  },

  readTags(imageData) {
    return ExifReader.load(imageData, {
      expanded: true,
      includeTags: {exif: this.geolocationTags, gps: true},
    });
  },

  readGeolocation(tags) {
    const gps = tags.gps;
    if (!gps || typeof gps.Latitude !== 'number' || typeof gps.Longitude !== 'number') {
      return null;
    }

    return {
      latitude: gps.Latitude,
      longitude: gps.Longitude,
      altitude: gps.Altitude,
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
