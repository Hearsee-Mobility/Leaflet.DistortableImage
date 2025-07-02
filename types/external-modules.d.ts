// Type definitions for external dependencies

declare module 'leaflet-toolbar' {
  namespace L {
    class Toolbar {
      static extend(props: any): any;
    }

    namespace Toolbar {
      class Control {
        static extend(props: any): any;
      }

      class Popup {
        static extend(props: any): any;
      }
    }

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
        _overlay: DistortableImageOverlay | DistortableCollection;
        _map: Map;

        constructor();
        static extend(props: any): any;
        initialize(options?: ActionOptions): void;
        enable(): void;

        static baseClass: string;
      }
    }
  }
}

declare module 'webgl-distort' {
  export default class WebGLDistort {
    constructor(canvas: HTMLCanvasElement);
    distort(image: HTMLImageElement, corners: number[][]): void;
  }
}

declare module 'glfx' {
  interface Canvas {
    draw(texture: any): Canvas;
    perspective(before: number[], after: number[]): Canvas;
    update(): Canvas;
    getPixelArray(): Uint8Array;
  }

  interface Texture {
    destroy(): void;
  }

  function canvas(): Canvas;
  function texture(image: HTMLImageElement | HTMLCanvasElement): Texture;
}

declare module 'exif-js' {
  interface ExifData {
    [key: string]: any;
    Orientation?: number;
  }

  export function getData(
    image: HTMLImageElement,
    callback: (this: HTMLImageElement) => void
  ): void;
  export function getTag(image: HTMLImageElement, tag: string): any;
  export function getAllTags(image: HTMLImageElement): ExifData;
}
