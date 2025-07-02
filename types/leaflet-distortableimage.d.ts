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
  DomEvent,
  DomUtil,
} from 'leaflet';

declare module 'leaflet' {
  // Toolbar2 base types (needed for EditAction)
  namespace Toolbar2 {
    interface ActionOptions {
      toolbarIcon?: ToolbarIconOptions;
      subToolbar?: any;
    }

    interface ToolbarIconOptions {
      svg?: boolean;
      html?: string;
      className?: string;
      tooltip?: string;
      style?: string;
    }

    class Action {
      options: ActionOptions;
      toolbar: any;
      _icon: HTMLLIElement;
      _link: HTMLAnchorElement;

      constructor();
      static extend(props: any): any;
      initialize(options?: ActionOptions): void;
      enable(): void;
      
      static baseClass: string;
    }

    class Toolbar {
      options: any;
      _container: HTMLElement;
      _ul: HTMLUListElement;

      constructor(options?: any);
      static extend(props: any): any;
      appendToContainer(container: HTMLElement): void;
      _calculateDepth(): number;
      _getActionConstructor(action: any): any;
      _hide(): void;
    }

    class Control extends Toolbar {
      static extend(props: any): any;
    }

    class Popup extends Toolbar {
      static extend(props: any): any;
    }
  }

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

  interface EditActionOptions extends Toolbar2.ActionOptions {
    toolbarIcon?: EditActionToolbarIconOptions;
    subToolbar?: any;
  }

  interface EditActionToolbarIconOptions extends Toolbar2.ToolbarIconOptions {
    svg?: boolean;
    html?: string;
    className?: string;
    tooltip?: string;
    style?: string;
  }

  class EditAction extends Toolbar2.Action {
    options: EditActionOptions;
    toolbar: any;
    _icon: HTMLLIElement;
    _link: HTMLAnchorElement;
    _overlay: DistortableImageOverlay | DistortableCollection;
    _map: Map;

    constructor(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    );

    // Methods
    initialize(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    ): void;

    _createIcon(toolbar: any, container: HTMLElement, args?: any): void;

    _injectIconSet(): void;

    _enableAction(): void;

    _disableAction(): void;

    _addSubToolbar(toolbar: any, icon: HTMLElement, args?: any): void;

    // Hook methods (to be implemented by subclasses)
    addHooks?(): void;
    removeHooks?(): void;

    // Static properties
    static baseClass: string;
  }

  // Factory function
  function editAction(
    map: Map,
    overlay: DistortableImageOverlay | DistortableCollection,
    options?: EditActionOptions
  ): EditAction;

  // Global action map for keybindings
  namespace DistortableImage {
    interface ActionMap {
      [key: string]: string;
    }

    interface GroupActionMap {
      [key: string]: string;
    }

    let action_map: ActionMap;
    let group_action_map: GroupActionMap;
  }

  // BorderAction
  class BorderAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // DeleteAction
  class DeleteAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // DistortAction
  class DistortAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // DragAction
  class DragAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // ExportAction
  interface ExportActionState {
    isExporting: boolean;
    mouseLeaveSkip: boolean;
    isHooksExecuted: boolean;
    mouseEnterHandler?: (event: MouseEvent) => void;
    mouseLeaveHandler?: (event: MouseEvent) => void;
  }

  class ExportAction extends EditAction {
    isExporting: boolean;
    mouseLeaveSkip: boolean;
    isHooksExecuted: boolean;
    mouseEnterHandler?: (event: MouseEvent) => void;
    mouseLeaveHandler?: (event: MouseEvent) => void;

    constructor(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
    resetState(): void;
    attachMouseEventListeners(element: HTMLElement): void;
    detachMouseEventListeners(element: HTMLElement): void;
    handleMouseEnter(): void;
    handleMouseLeave(): void;
    renderDownloadIcon(): void;
    renderExportIcon(): void;
    renderCancelIcon(): void;
  }

  // FreeRotateAction
  class FreeRotateAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // GeolocateAction
  class GeolocateAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // LockAction
  class LockAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay | DistortableCollection,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // OpacityAction
  class OpacityAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // OpacitiesAction and related
  interface OpacitiesToolbar2Options {
    className?: string;
    filter?: () => boolean;
    actions?: OpacityLevelAction[];
    style?: string;
  }

  // Individual opacity level action (created dynamically)
  interface OpacityLevelAction extends EditAction {
    options: {
      toolbarIcon: {
        html: number;
        tooltip: string;
        className: 'leaflet-toolbar-icon-vertical';
        style: string;
      };
    };
    addHooks(): void;
  }

  class OpacitiesToolbar2 extends Toolbar2.Toolbar {
    options: OpacitiesToolbar2Options;
    _container: HTMLElement;
    _ul: HTMLUListElement;
    _disabledEvents: string[];

    constructor(options?: OpacitiesToolbar2Options);
    appendToContainer(container: HTMLElement): void;
    _calculateDepth(): number;
    _getActionConstructor(action: any): any;
  }

  class OpacitiesAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // RestoreAction
  class RestoreAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // RotateAction
  class RotateAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // ScaleAction
  class ScaleAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // StackAction
  class StackAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableImageOverlay,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // UnlockAction
  class UnlockAction extends EditAction {
    constructor(
      map: Map,
      overlay: DistortableCollection,
      options?: EditActionOptions
    );

    initialize(
      map: Map,
      overlay: DistortableCollection,
      options?: EditActionOptions
    ): void;
    addHooks(): void;
  }

  // Factory functions for all actions
  function borderAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): BorderAction;
  function deleteAction(
    map: Map,
    overlay: DistortableImageOverlay | DistortableCollection,
    options?: EditActionOptions
  ): DeleteAction;
  function distortAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): DistortAction;
  function dragAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): DragAction;
  function exportAction(
    map: Map,
    overlay: DistortableImageOverlay | DistortableCollection,
    options?: EditActionOptions
  ): ExportAction;
  function freeRotateAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): FreeRotateAction;
  function geolocateAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): GeolocateAction;
  function lockAction(
    map: Map,
    overlay: DistortableImageOverlay | DistortableCollection,
    options?: EditActionOptions
  ): LockAction;
  function opacityAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): OpacityAction;
  function opacitiesAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): OpacitiesAction;
  function restoreAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): RestoreAction;
  function rotateAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): RotateAction;
  function scaleAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): ScaleAction;
  function stackAction(
    map: Map,
    overlay: DistortableImageOverlay,
    options?: EditActionOptions
  ): StackAction;
  function unlockAction(
    map: Map,
    overlay: DistortableCollection,
    options?: EditActionOptions
  ): UnlockAction;

  // Utility types for action arrays (commonly used in options)
  type SingleImageActions = (
    | typeof BorderAction
    | typeof DeleteAction
    | typeof DistortAction
    | typeof DragAction
    | typeof ExportAction
    | typeof FreeRotateAction
    | typeof GeolocateAction
    | typeof LockAction
    | typeof OpacityAction
    | typeof OpacitiesAction
    | typeof RestoreAction
    | typeof RotateAction
    | typeof ScaleAction
    | typeof StackAction
  )[];

  type CollectionActions = (
    | typeof DeleteAction
    | typeof ExportAction
    | typeof LockAction
    | typeof UnlockAction
  )[];

  // Extend the existing interfaces to include actions arrays
  interface DistortableImageOverlayOptions {
    actions?: SingleImageActions;
  }

  interface DistortableCollectionOptions {
    actions?: CollectionActions;
  }

  // IconUtil interface (used by many actions)
  namespace IconUtil {
    function toggleXlink(element: HTMLElement, from: string, to?: string): void;
    function toggleTitle(element: HTMLElement, from: string, to: string): void;
    function addClassToSvg(element: HTMLElement, className: string): void;
    function create(iconHtml: string): string;
  }

  // Utils interface (used by RestoreAction)
  namespace Utils {
    function getNestedVal(obj: any, ...keys: string[]): any;
  }

  // EXIF function type (used by GeolocateAction)
  function EXIF(image: HTMLImageElement): () => void;

  // OpacitiesAction specific types
  namespace OpacitiesAction {
    // Default opacity levels: [100, 80, 60, 40, 20, 0]
    type OpacityLevel = 0 | 20 | 40 | 60 | 80 | 100;
    
    interface OpacityLevelActionConstructor {
      new(): OpacityLevelAction;
      extend(props: any): OpacityLevelActionConstructor;
    }

    // CSS StyleSheet types for the subtoolbar styling
    interface SubtoolbarStyles {
      readonly leafletToolbarIconVertical: string;
      readonly leafletToolbar1FirstChild: string;
    }
  }

  // ToolbarIconSet interface (used by EditAction._injectIconSet)
  class ToolbarIconSet {
    constructor();
    render(): string;
  }
}

// Additional external module declarations for EXIF
declare const EXIF: {
  getData(image: HTMLImageElement, callback: () => void): void;
};

// Type guards for distinguishing between overlay types
export type DistortableOverlay =
  | L.DistortableImageOverlay
  | L.DistortableCollection;

export interface ActionConstructor<T extends L.EditAction = L.EditAction> {
  new (
    map: L.Map,
    overlay: DistortableOverlay,
    options?: L.EditActionOptions
  ): T;
  baseClass: string;
  extend(props: any): ActionConstructor<T>;
}

// Action type unions for easier working with action arrays
export type ImageAction =
  | L.BorderAction
  | L.DeleteAction
  | L.DistortAction
  | L.DragAction
  | L.ExportAction
  | L.FreeRotateAction
  | L.GeolocateAction
  | L.LockAction
  | L.OpacityAction
  | L.OpacitiesAction
  | L.RestoreAction
  | L.RotateAction
  | L.ScaleAction
  | L.StackAction;

export type CollectionAction =
  | L.DeleteAction
  | L.ExportAction
  | L.LockAction
  | L.UnlockAction;

export type AnyAction = ImageAction | CollectionAction;

// Export the interfaces for use in other TypeScript files
export {
  DistortableImageOverlayOptions,
  DistortableCollectionOptions,
  EditActionOptions,
  ExportOptions,
  DistortableImageEvents,
  DistortableCollectionEvents,
  DistortableImage,
  EditActionToolbarIconOptions,
  OpacitiesToolbar2Options,
  OpacityLevelAction,
};
