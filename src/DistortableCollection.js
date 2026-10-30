const arr = [];
L.DistortableCollection = L.FeatureGroup.extend({
  options: {
    editable: true,
    exportOpts: {
      exportStartUrl: '//export.mapknitter.org/export',
      statusUrl: '//export.mapknitter.org',
      exportUrl: 'http://export.mapknitter.org/',
    },
  },

  initialize(options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, options);
    L.Utils.initTranslation.call(this);

    this.editable = this.options.editable;
  },

  onAdd(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    if (this.editable) {
      this.editing.enable();
    }

    /**
     * although we have a DistortableCollection.Edit class that handles collection events to keep our code managable,
     * events that need to be added on individual images are kept here to do so through `layeradd`.
     */
    this.on('layeradd', this._addEvents, this);
    this.on('layerremove', this._removeEvents, this);
  },

  onRemove() {
    if (this.editing) {
      this.editing.disable();
    }
    this.off('layeradd', this._addEvents, this);
    this.off('layerremove', this._removeEvents, this);
  },

  _addEvents(e) {
    const layer = e.layer;

    L.DomEvent.on(
      layer,
      {
        dragstart: this._dragStartMultiple,
        drag: this._dragMultiple,
      },
      this,
    );

    L.DomEvent.on(
      layer.getElement(),
      {
        mousedown: this._deselectOthers,
        /* Enable longpress for multi select for touch devices. */
        contextmenu: this._longPressMultiSelect,
      },
      this,
    );
  },

  _removeEvents(e) {
    const layer = e.layer;

    L.DomEvent.off(
      layer,
      {
        dragstart: this._dragStartMultiple,
        drag: this._dragMultiple,
      },
      this,
    );

    L.DomEvent.off(
      layer.getElement(),
      {
        mousedown: this._deselectOthers,
        contextmenu: this._longPressMultiSelect,
      },
      this,
    );
  },

  _longPressMultiSelect(e) {
    if (!this.editable) {
      return;
    }

    e.preventDefault();

    this.eachLayer((layer) => {
      const edit = layer.editing;
      if (layer.getElement() === e.target && edit.enabled()) {
        L.DomUtil.toggleClass(layer.getElement(), 'collected');
        if (this.anyCollected()) {
          layer.deselect();
          this.editing._addToolbar();
        } else {
          this.editing._removeToolbar();
        }
      }
    });
  },

  isCollected(overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'collected');
  },

  anyCollected() {
    const layerArr = this.getLayers();
    return layerArr.some(this.isCollected.bind(this));
  },

  _toggleCollected(e, layer) {
    if (e.shiftKey) {
      /* conditional prevents disabled images from flickering multi-select mode */
      if (layer.editing.enabled()) {
        L.DomUtil.toggleClass(e.target, 'collected');
        // re-order layers by _leaflet_id to match their display order in UI
        // add new layer to right position and avoid repitition
        const newArr = arr.every((each) => {
          return each._leaflet_id !== layer._leaflet_id;
        });
        if (newArr) {
          arr.push(layer);
        } else {
          arr.splice(arr.indexOf(layer), 1);
        }
      }
    }

    if (this.anyCollected()) {
      layer.deselect();
    } else {
      this.editing._removeToolbar();
    }
  },

  _deselectOthers(e) {
    if (!this.editable) {
      return;
    }

    this.eachLayer((layer) => {
      if (layer.getElement() !== e.target) {
        layer.deselect();
      } else {
        this._toggleCollected(e, layer);
      }
    });

    if (e) {
      L.DomEvent.stopPropagation(e);
    }
  },

  _dragStartMultiple(e) {
    const overlay = e.target;

    if (!this.isCollected(overlay)) {
      return;
    }

    this._dragStartTopLeft = this._map.latLngToLayerPoint(overlay.getCorner(0));
    this.eachLayer((layer) => {
      layer._groupDragOffset = L.point(0, 0);
      layer.deselect();
    });
  },

  _dragMultiple(e) {
    const overlay = e.target;

    if (!this.isCollected(overlay)) {
      return;
    }

    const topLeft = this._map.latLngToLayerPoint(overlay.getCorner(0));
    this._moveCollectedBy(topLeft.subtract(this._dragStartTopLeft), overlay);
  },

  _toRemove() {
    const layerArr = this.getLayers();

    return layerArr.filter((layer) => {
      const mode = layer.editing._mode;
      return this.isCollected(layer) && mode !== 'lock';
    });
  },

  _toMove(overlay) {
    const layerArr = this.getLayers();

    return layerArr.filter((layer) => {
      const mode = layer.editing._mode;
      return layer !== overlay && this.isCollected(layer) && mode !== 'lock';
    });
  },

  /* Each layer tracks how far it has followed, so a step it refused at the world's edge isn't lost. */
  _moveCollectedBy(offsetSinceDragStart, overlay) {
    this._toMove(overlay).forEach((layer) => {
      if (layer._moveByPixels(offsetSinceDragStart.subtract(layer._groupDragOffset))) {
        layer._groupDragOffset = offsetSinceDragStart;
      }
    });
  },

  _getAvgCmPerPixel(imgs) {
    const reduce = imgs.reduce(function (sum, img) {
      return sum + img.cm_per_pixel;
    }, 0);
    return reduce / imgs.length;
  },

  // connects to JSON file and fetches JSON data therein from remote source
  async fetchRemoteJson(url) {
    let index = 0;
    const imgCollectionProps = [];

    try {
      const response = await axios.get(url);
      if (response.data.hasOwnProperty('avg_cm_per_pixel')) {
        if (response.data.collection.length > 1) {
          response.data.collection.forEach((data) => {
            imgCollectionProps[index] = data;
            index++;
          });
          return {
            avg_cm_per_pixel: response.data.avg_cm_per_pixel,
            imgCollectionProps,
          };
        }
        imgCollectionProps[index] = response.data.collection;

        return {
          avg_cm_per_pixel: response.data.avg_cm_per_pixel,
          imgCollectionProps,
        };
      } else {
        if (response.data.length > 1) {
          response.data.forEach((data) => {
            imgCollectionProps[index] = data;
            index++;
          });
          return {
            imgCollectionProps,
          };
        }
        imgCollectionProps[index] = response.data;

        return {
          imgCollectionProps,
        };
      }
    } catch (err) {
      console.log('err', err);
    }
  },

  // expects url in this format: https://archive.org/download/mkl-1/mkl-1.json
  async recreateImagesFromJsonUrl(url) {
    let imageCollectionObj = {};

    if (url) {
      imageCollectionObj = await this.fetchRemoteJson(url);
      return imageCollectionObj;
    }

    return imageCollectionObj;
  },

  generateExportJson(allImages = false) {
    const json = {};
    json.images = [];

    this.eachLayer(function (layer) {
      if (allImages || this.isCollected(layer)) {
        const sections = layer._image.src.split('/');
        const filename = sections[sections.length - 1];
        const zc = layer.getCorners();

        const corners = [
          {lat: zc[0].lat, lon: zc[0].lng || zc[0].lon},
          {lat: zc[1].lat, lon: zc[1].lng || zc[1].lon},
          {lat: zc[3].lat, lon: zc[3].lng || zc[3].lon},
          {lat: zc[2].lat, lon: zc[2].lng || zc[2].lon},
        ];

        json.images.push({
          id: layer._leaflet_id,
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          tooltipText: layer.getTooltipText(),
          image_file_name: filename,
          nodes: corners,
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer),
        });
      }
    }, this);

    json.images = json.images.reverse();
    json.avg_cm_per_pixel = this._getAvgCmPerPixel(json.images);
    return json;
  },
});

L.distortableCollection = function (id, options) {
  return new L.DistortableCollection(id, options);
};
