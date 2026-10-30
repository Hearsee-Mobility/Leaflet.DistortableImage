export interface PixelPoint {
  x: number;
  y: number;
}

/** Pixel y of the world's top and bottom edges, or null when the world has no edges. */
export interface WorldBounds {
  top: number;
  bottom: number;
}

export interface CornerProjection<Position> {
  project(position: Position): PixelPoint;
  unproject(point: PixelPoint): Position;
  readonly worldBounds: WorldBounds | null;
}

// Fractions of the world's height a corner may not reach, matching the plugin's original zoom-0 limits.
const topMargin = 2 / 256;
const bottomMargin = 255 / 256;
// Above the noise a project/unproject round trip leaves at high zoom, far below a visible pixel.
const sameSpotTolerance = 1e-6;

/**
 * Owns where an image overlay's corners are and every way they may change.
 * Corners are ordered top-left, top-right, bottom-left, bottom-right.
 */
export class ImageCorners<Position> {
  private readonly originalCorners: Position[];
  private readonly currentCorners: Position[];
  private edited = false;

  constructor(
    corners: Position[],
    private readonly projection: CornerProjection<Position>,
  ) {
    this.originalCorners = [...corners];
    this.currentCorners = [...corners];
  }

  /** The live corners; the same array is kept and updated across edits. */
  get current(): Position[] {
    return this.currentCorners;
  }

  place(corners: Position[]): void {
    this.originalCorners.splice(0, this.originalCorners.length, ...corners);
    this.currentCorners.splice(0, this.currentCorners.length, ...corners);
    this.edited = false;
  }

  /** Settled when the corners change, so it can be read without a projection. */
  isEdited(): boolean {
    return this.edited;
  }

  setCorners(corners: Position[]): boolean {
    return this.commit(corners);
  }

  setCorner(index: number, position: Position): boolean {
    const corners = [...this.currentCorners];
    corners[index] = position;
    return this.commit(corners);
  }

  moveBy(offset: PixelPoint): boolean {
    return this.commitPixels(this.cornerPixels().map((point) => add(point, offset)));
  }

  scaleBy(factor: number, minimumEdge = 0): boolean {
    if (factor === 0) {
      return false;
    }

    const [topLeft, topRight] = this.cornerPixels();
    const appliedFactor =
      factor < 1 && distanceBetween(topLeft, topRight) <= minimumEdge ? 1 : factor;
    const center = this.centerPixel();

    return this.commitPixels(
      this.cornerPixels().map((point) =>
        add(center, scale(subtract(point, center), appliedFactor)),
      ),
    );
  }

  /** Turns clockwise on screen for positive radians. */
  rotateBy(radians: number): boolean {
    const center = this.centerPixel();
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    return this.commitPixels(
      this.cornerPixels().map((point) => {
        const offset = subtract(point, center);
        return add(center, {
          x: cosine * offset.x - sine * offset.y,
          y: sine * offset.x + cosine * offset.y,
        });
      }),
    );
  }

  restore(): void {
    this.currentCorners.splice(0, this.currentCorners.length, ...this.originalCorners);
    this.edited = false;
  }

  center(): Position {
    return this.projection.unproject(this.centerPixel());
  }

  /**
   * Radians in [0, 2π) along the top edge, flipped by half a turn when the image is mirrored.
   * Measured on whole pixels, as the CSS transform it once came from was, so reported angles stay put.
   */
  angle(): number {
    const [topLeft, topRight, bottomLeft] = this.cornerPixels().map(roundToWholePixel);
    const topEdge = subtract(topRight, topLeft);
    const leftEdge = subtract(bottomLeft, topLeft);
    let radians = Math.atan2(topEdge.y, topEdge.x);

    if (cross(topEdge, leftEdge) < 0) {
      radians += radians < 0 ? Math.PI : -Math.PI;
    }

    return radians < 0 ? radians + 2 * Math.PI : radians;
  }

  private commitPixels(points: PixelPoint[]): boolean {
    return this.commit(points.map((point) => this.projection.unproject(point)));
  }

  private commit(corners: Position[]): boolean {
    if (corners.some((corner) => this.isPastWorldEdge(corner))) {
      return false;
    }

    this.currentCorners.splice(0, this.currentCorners.length, ...corners);
    this.edited = this.differsFromOriginal();
    return true;
  }

  private differsFromOriginal(): boolean {
    return this.currentCorners.some(
      (corner, index) =>
        distanceBetween(this.toPixels(corner), this.toPixels(this.originalCorners[index])) >
        sameSpotTolerance,
    );
  }

  private isPastWorldEdge(position: Position): boolean {
    const worldBounds = this.projection.worldBounds;
    if (!worldBounds) {
      return false;
    }

    const heightFraction =
      (this.toPixels(position).y - worldBounds.top) / (worldBounds.bottom - worldBounds.top);
    return heightFraction < topMargin || heightFraction >= bottomMargin;
  }

  private cornerPixels(): PixelPoint[] {
    return this.currentCorners.map((corner) => this.toPixels(corner));
  }

  private centerPixel(): PixelPoint {
    const pixels = this.cornerPixels();
    return scale(
      pixels.reduce((total, point) => add(total, point), {x: 0, y: 0}),
      1 / pixels.length,
    );
  }

  private toPixels(position: Position): PixelPoint {
    return this.projection.project(position);
  }
}

function add(first: PixelPoint, second: PixelPoint): PixelPoint {
  return {x: first.x + second.x, y: first.y + second.y};
}

function subtract(first: PixelPoint, second: PixelPoint): PixelPoint {
  return {x: first.x - second.x, y: first.y - second.y};
}

function scale(point: PixelPoint, factor: number): PixelPoint {
  return {x: point.x * factor, y: point.y * factor};
}

function roundToWholePixel(point: PixelPoint): PixelPoint {
  return {x: Math.round(point.x), y: Math.round(point.y)};
}

function cross(first: PixelPoint, second: PixelPoint): number {
  return first.x * second.y - first.y * second.x;
}

function distanceBetween(first: PixelPoint, second: PixelPoint): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
