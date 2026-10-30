import {ImageCorners} from './corners/ImageCorners.ts';

L.DistortableImageOverlay = L.ImageOverlay.extend({
  options: {
    height: 200,
    crossOrigin: true,
    // todo: find ideal number to prevent distortions during RotateScale, and make it dynamic (remove hardcoding)
    edgeMinWidth: 50,
    editable: true,
    mode: 'distort',
    selected: false,
    interactive: true,
    tooltipText: '',
  },

  initialize(url, options) {
    L.setOptions(this, options);
    L.Utils.initTranslation.call(this);

    this.edgeMinWidth = this.options.edgeMinWidth;
    this.editable = this.options.editable;
    this._selected = this.options.selected;
    this._url = url;
    this.rotation = {};
    this._imageCorners = new ImageCorners(this.options.corners || [], this._mapProjection());

    this.interactive = this.options.interactive;
    this.tooltipText = this.options.tooltipText;
  },

  onAdd(map) {
    this._map = map;
    if (!this.getElement()) {
      this._initImage();
    }

    map.on('viewreset', this._reset, this);

    if (this.options.corners && map.options.zoomAnimation && L.Browser.any3d) {
      map.on('zoomanim', this._animateZoom, this);
    }

    // Have to wait for the image to load because need to access its w/h
    L.DomEvent.on(this.getElement(), 'load', () => {
      this.getPane().appendChild(this.getElement());
      this._initImageDimensions();

      if (this.options.rotation) {
        const units = this.options.rotation.deg >= 0 ? 'deg' : 'rad';
        this.setAngle(this.options.rotation[units], units);
      } else {
        this.rotation = {deg: 0, rad: 0};
        this._reset();
      }

      /** if there is a featureGroup, only its editable option matters */
      const eventParents = this._eventParents;
      if (eventParents) {
        this.eP = eventParents[Object.keys(eventParents)[0]];
        if (this.eP.editable) {
          this.editing.enable();
        }
      } else {
        if (this.editable) {
          this.editing.enable();
        }
        this.eP = null;
      }
      this.fire('add');
    });

    L.DomEvent.on(this.getElement(), 'click', this.select, this);
    L.DomEvent.on(
      map,
      {
        singleclickon: this._singleClickListeners,
        singleclickoff: this._resetClickListeners,
        singleclick: this._singleClick,
      },
      this,
    );

    /**
     * custom events fired from DoubleClickLabels.js. Used to differentiate
     * single / dblclick to not deselect images on map dblclick.
     */
    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.on(map, 'click', this.deselect, this);
    }

    L.DomEvent.on(this.getElement(), 'mousemove', this.activateTooltip, this);
    L.DomEvent.on(this.getElement(), 'mouseout', this.closeTooltip, this);
  },

  onRemove(map) {
    L.DomEvent.off(this.getElement(), 'click', this.select, this);
    L.DomEvent.off(
      map,
      {
        singleclickon: this._singleClickListeners,
        singleclickoff: this._resetClickListeners,
        singleclick: this._singleClick,
      },
      this,
    );
    L.DomEvent.off(map, 'click', this.deselect, this);

    if (this.editing) {
      this.editing.disable();
    }
    this.fire('remove');

    L.ImageOverlay.prototype.onRemove.call(this, map);

    L.DomEvent.on(this.getElement(), 'mouseout', this.closeTooltip, this);
    L.DomEvent.off(this.getElement(), 'mousemove', this.deactivateTooltip, this);
  },

  _initImageDimensions() {
    const map = this._map;
    const originalImageWidth = L.DomUtil.getStyle(this.getElement(), 'width');
    const originalImageHeight = L.DomUtil.getStyle(this.getElement(), 'height');
    const aspectRatio = parseInt(originalImageWidth) / parseInt(originalImageHeight);
    const imageHeight = this.options.height;
    const imageWidth = parseInt(aspectRatio * imageHeight);
    const center = map.project(map.getCenter());
    const offset = L.point(imageWidth, imageHeight).divideBy(2);
    if (!this.options.corners) {
      this._imageCorners.place([
        map.unproject(center.subtract(offset)),
        map.unproject(center.add(L.point(offset.x, -offset.y))),
        map.unproject(center.add(L.point(-offset.x, offset.y))),
        map.unproject(center.add(offset)),
      ]);
    }

    this.setBounds(L.latLngBounds(this.getCorners()));
  },

  /* Reads the map lazily, since the overlay is created before it is added to one. */
  _mapProjection() {
    const overlay = this;
    return {
      project: (latlng) => overlay._map.project(latlng),
      unproject: (point) => overlay._map.unproject(L.point(point.x, point.y)),
      get worldBounds() {
        const pixelBounds = overlay._map.getPixelWorldBounds();
        return pixelBounds ? {top: pixelBounds.min.y, bottom: pixelBounds.max.y} : null;
      },
    };
  },

  /* Fires update even when the corners were refused, which keeps the handles from flickering. */
  _commitCorners() {
    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');
    return this;
  },

  _singleClick(e) {
    if (e.type === 'singleclick') {
      this.deselect();
    } else {
      return;
    }
  },

  _singleClickListeners() {
    const map = this._map;
    L.DomEvent.off(map, 'click', this.deselect, this);
    L.DomEvent.on(map, 'singleclick', this.deselect, this);
  },

  _resetClickListeners() {
    const map = this._map;
    L.DomEvent.on(map, 'click', this.deselect, this);
    L.DomEvent.off(map, 'singleclick', this.deselect, this);
  },

  isSelected() {
    return this._selected;
  },

  deselect() {
    const edit = this.editing;
    if (!edit.enabled()) {
      return;
    }

    edit._removeToolbar();
    edit._hideMarkers();

    this._selected = false;
    this.fire('deselect');
    return this;
  },

  select(e) {
    const edit = this.editing;
    const eP = this.eP;

    if (!edit.enabled()) {
      return;
    }
    if (e) {
      L.DomEvent.stopPropagation(e);
    }

    // this ensures deselection of all other images, allowing us to keep collection group optional
    this._programmaticGrouping();

    this._selected = true;
    edit._addToolbar();
    edit._showMarkers();
    this.fire('select');

    // we run the selection logic 1st anyway because the collection group's _addToolbar method depends on it
    if (eP && eP.anyCollected()) {
      this.deselect();
      return;
    }

    return this;
  },

  _programmaticGrouping() {
    this._map.eachLayer((layer) => {
      if (layer instanceof L.DistortableImageOverlay) {
        layer.deselect();
      }
    });
  },

  setCorner(corner, latlng) {
    this._imageCorners.setCorner(corner, latlng);
    return this._commitCorners();
  },

  activateTooltip() {
    if (!this._selected) {
      this.bindTooltip(this._createTooltipContent(), {direction: 'top'}).openTooltip();
    }
  },

  _createTooltipContent() {
    const content = L.DomUtil.create('span');
    content.textContent = this.tooltipText;
    return content;
  },

  closeToolTip() {
    this.closeTooltip();
  },

  deactivateTooltip() {
    this.unbindTooltip();
  },

  getTooltipText() {
    return this.tooltipText;
  },

  setCorners(latlngObj) {
    this._imageCorners.setCorners(Object.values(latlngObj));
    return this._commitCorners();
  },

  setCornersFromPoints(pointsObj) {
    const map = this._map;
    return this.setCorners(Object.values(pointsObj).map((point) => map.layerPointToLatLng(point)));
  },

  scaleBy(scale) {
    this._imageCorners.scaleBy(scale);
    return this._commitCorners();
  },

  /* Scales from a handle, refusing to shrink an image whose top edge is already at the minimum width. */
  _scaleByHandle(scale) {
    this._imageCorners.scaleBy(scale, this.edgeMinWidth || 50);
    return this._commitCorners();
  },

  getAngle(unit = 'deg') {
    const angle = this._imageCorners.angle();

    return unit === 'deg'
      ? Math.round(L.TrigUtil.radiansToDegrees(angle))
      : L.Util.formatNum(angle, 2);
  },

  setAngle(angle, unit = 'deg') {
    const currentAngle = this.getAngle(unit);
    const angleToRotateBy = angle - currentAngle;
    this.rotateBy(angleToRotateBy, unit);

    return this;
  },

  rotateBy(angle, unit = 'deg') {
    this._imageCorners.rotateBy(unit === 'deg' ? L.TrigUtil.degreesToRadians(angle) : angle);
    return this._commitCorners();
  },

  dragBy(formerPoint, newPoint) {
    const map = this._map;
    this._moveByPixels(map.project(newPoint).subtract(map.project(formerPoint)));
    return this;
  },

  /* Returns whether the move was accepted, so a collection can retry a step refused at the world's edge. */
  _moveByPixels(offset) {
    const moved = this._imageCorners.moveBy(offset);
    this._commitCorners();
    return moved;
  },

  restore() {
    this._imageCorners.restore();
    this._commitCorners();
    this.fire('restore');

    return this;
  },

  /* Copied from Leaflet v0.7 https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199 */
  /* since L.DomUtil.getTranslateString() is deprecated in Leaflet v1.0 */
  _getTranslateString(point) {
    // on WebKit browsers (Chrome/Safari/iOS Safari/Android)
    // using translate3d instead of translate
    // makes animation smoother as it ensures HW accel is used.
    // Firefox 13 doesn't care
    // (same speed either way), Opera 12 doesn't support translate3d

    const is3d = L.Browser.webkit3d;
    const open = 'translate' + (is3d ? '3d' : '') + '(';
    const close = (is3d ? ',0' : '') + ')';

    return open + point.x + 'px,' + point.y + 'px' + close;
  },

  _reset() {
    const map = this._map;
    const image = this.getElement();
    const latLngToLayerPoint = L.bind(map.latLngToLayerPoint, map);
    const transformMatrix = this._calculateProjectiveTransform(latLngToLayerPoint);
    const topLeft = latLngToLayerPoint(this.getCorner(0));
    const warp = L.DomUtil.getMatrixString(transformMatrix);
    const translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');

    /* Set origin to the upper-left corner rather than
     * the center of the image, which is the default.
     */
    image.style[L.DomUtil.TRANSFORM + '-origin'] = '0 0 0';

    this.rotation.deg = this.getAngle();
    this.rotation.rad = this.getAngle('rad');
  },

  /*
   * Calculates the transform string that will be
   * correct *at the end* of zooming.
   * Leaflet then generates a CSS3 animation between the current transform and
   * future transform which makes the transition appear smooth.
   */
  _animateZoom(event) {
    const map = this._map;
    const image = this.getElement();
    const latLngToNewLayerPoint = function (latlng) {
      return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
    };
    const transformMatrix = this._calculateProjectiveTransform(latLngToNewLayerPoint);
    const topLeft = latLngToNewLayerPoint(this.getCorner(0));
    const warp = L.DomUtil.getMatrixString(transformMatrix);
    const translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
  },

  getCorners() {
    return this._imageCorners.current;
  },

  getCorner(i) {
    return this._imageCorners.current[i];
  },

  getCenter() {
    return this._imageCorners.center();
  },

  _calculateProjectiveTransform(latLngToCartesian) {
    /* Setting reasonable but made-up image defaults
     * allow us to place images on the map before
     * they've finished downloading. */
    const offset = latLngToCartesian(this.getCorner(0));
    const w = this.getElement().offsetWidth || 500;
    const h = this.getElement().offsetHeight || 375;
    const c = [];
    let j;
    /* Convert corners to container points (i.e. cartesian coordinates). */
    for (j = 0; j < 4; j++) {
      c.push(latLngToCartesian(this.getCorner(j))._subtract(offset));
    }

    /*
     * This matrix describes the action of
     * the CSS transform on each corner of the image.
     * It maps from the coordinate system centered
     * at the upper left corner of the image
     * to the region bounded by the latlngs in this._corners.
     * For example:
     * 0, 0, c[0].x, c[0].y
     * says that the upper-left corner of the image
     * maps to the first latlng in this._corners.
     */
    return L.MatrixUtil.general2DProjection(
      0,
      0,
      c[0].x,
      c[0].y,
      w,
      0,
      c[1].x,
      c[1].y,
      0,
      h,
      c[2].x,
      c[2].y,
      w,
      h,
      c[3].x,
      c[3].y,
    );
  },
});

Object.defineProperty(L.DistortableImageOverlay.prototype, 'edited', {
  get() {
    return this._imageCorners.isEdited();
  },
});

L.distortableImageOverlay = function (id, options) {
  return new L.DistortableImageOverlay(id, options);
};

L.Map.addInitHook(function () {
  if (!L.DomUtil.hasClass(this.getContainer(), 'ldi')) {
    L.DomUtil.addClass(this.getContainer(), 'ldi');
  }
});
