// Type definitions for Leaflet.DistortableImage
// This file extends the Leaflet types to include DistortableImage functionality

import {
  ImageOverlay,
  FeatureGroup,
  LatLngBoundsExpression,
  LatLng,
  Map,
  LayerGroupOptions,
  ImageOverlayOptions,
  LeafletEvent,
  ZoomAnimEvent,
} from 'leaflet';

declare module 'leaflet' {
  // Options interfaces
  interface DistortableImageOverlayOptions extends ImageOverlayOptions {
    actions?: any[];
    cornerHandles?: boolean;
    edgeHandles?: boolean;
    rotateHandles?: boolean;
    scaleHandles?: boolean;
    suppressToolbar?: boolean;
    mode?: 'distort' | 'rotate' | 'scale' | 'translate';
    selected?: boolean;
    minScale?: number;
    maxScale?: number;
    rotation?: boolean;
  }

  interface DistortableCollectionOptions extends LayerGroupOptions {
    actions?: any[];
    editable?: boolean;
    exportOpts?: ExportOptions;
    suppressToolbar?: boolean;
  }

  interface ExportOptions {
    exportStartUrl?: string;
    collection?: boolean;
    scale?: number;
    format?: 'jpg' | 'png' | 'pdf' | 'svg';
    quality?: number;
    filename?: string;
  }

  // Event types
  interface DistortableImageEvents {
    select: LeafletEvent;
    deselect: LeafletEvent;
    'edit:enable': LeafletEvent;
    'edit:disable': LeafletEvent;
    'edit:start': LeafletEvent;
    'edit:end': LeafletEvent;
    'distort:start': LeafletEvent;
    'distort:end': LeafletEvent;
    'rotate:start': LeafletEvent;
    'rotate:end': LeafletEvent;
    'scale:start': LeafletEvent;
    'scale:end': LeafletEvent;
    'translate:start': LeafletEvent;
    'translate:end': LeafletEvent;
  }

  interface DistortableCollectionEvents {
    'collection:select': LeafletEvent;
    'collection:deselect': LeafletEvent;
    'collection:edit:enable': LeafletEvent;
    'collection:edit:disable': LeafletEvent;
  }

  // DistortableImageOverlay class
  class DistortableImageOverlay extends ImageOverlay {
    constructor(
      url: string,
      bounds: LatLngBoundsExpression,
      options?: DistortableImageOverlayOptions
    );

    // Properties
    editing: boolean;
    _bounds: L.LatLngBounds;
    _image: HTMLImageElement;
    _url: string;
    _corners: LatLng[];
    _rotationAngle: number;
    _selected: boolean;
    _collection?: DistortableCollection;

    // Methods
    addTo(map: Map): this;
    select(): this;
    deselect(): this;
    remove(): this;
    enableEdit(): this;
    disableEdit(): this;
    isEditing(): boolean;
    setCorners(corners: LatLng[]): this;
    getCorners(): LatLng[];
    setUrl(url: string): this;
    setBounds(bounds: LatLngBoundsExpression): this;
    setOpacity(opacity: number): this;
    getOpacity(): number;
    bringToFront(): this;
    bringToBack(): this;
    rotate(angle: number): this;
    scaleUniform(scale: number): this;
    exportImage(options?: ExportOptions): string;
    _reset(): void;
    _updateCorners(): void;
    _animateZoom(e: ZoomAnimEvent): void;

    // Event methods
    on(type: string, fn: Function, context?: any): this;
    off(type?: string, fn?: Function, context?: any): this;
    fire(type: string, data?: any, propagate?: boolean): this;
  }

  // DistortableCollection class
  class DistortableCollection extends FeatureGroup {
    constructor(
      layers?: DistortableImageOverlay[],
      options?: DistortableCollectionOptions
    );

    // Properties
    editing: boolean;
    _layers: {[key: string]: DistortableImageOverlay};

    // Methods
    addLayer(layer: DistortableImageOverlay): this;
    removeLayer(layer: DistortableImageOverlay): this;
    hasLayer(layer: DistortableImageOverlay): boolean;
    clearLayers(): this;
    eachLayer(
      fn: (layer: DistortableImageOverlay) => void,
      context?: any
    ): this;
    getLayers(): DistortableImageOverlay[];
    getLayerCount(): number;
    toArray(): DistortableImageOverlay[];

    // Selection methods
    selectAll(): this;
    deselectAll(): this;
    getSelected(): DistortableImageOverlay[];
    anySelected(): boolean;

    // Editing methods
    enableEdit(): this;
    disableEdit(): this;
    isEditing(): boolean;

    // Export methods
    generateExportJson(): any;

    // Event methods
    on(type: string, fn: Function, context?: any): this;
    off(type?: string, fn?: Function, context?: any): this;
    fire(type: string, data?: any, propagate?: boolean): this;
  }

  // Factory functions
  function distortableImageOverlay(
    url: string,
    bounds: LatLngBoundsExpression,
    options?: DistortableImageOverlayOptions
  ): DistortableImageOverlay;

  function distortableCollection(
    layers?: DistortableImageOverlay[],
    options?: DistortableCollectionOptions
  ): DistortableCollection;
}

// Export the interfaces for use in other TypeScript files
export {
  DistortableImageOverlayOptions,
  DistortableCollectionOptions,
  ExportOptions,
  DistortableImageEvents,
  DistortableCollectionEvents,
};
