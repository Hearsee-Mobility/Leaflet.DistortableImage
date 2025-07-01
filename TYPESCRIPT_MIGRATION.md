# TypeScript Migration Guide

This document outlines the TypeScript conversion process for the Leaflet.DistortableImage project.

## Migration Approach

We're using a **gradual migration approach** that allows both JavaScript and TypeScript files to coexist during the transition period. This approach minimizes breaking changes while providing immediate TypeScript benefits.

## What's Been Done

### 1. TypeScript Configuration

- Added `tsconfig.json` with relaxed settings to allow JavaScript files
- Updated `package.json` with TypeScript dependencies:
  - `typescript@^5.0.0`
  - `@types/leaflet@^1.9.12`
  - `@typescript-eslint/eslint-plugin@^6.0.0`
  - `@typescript-eslint/parser@^6.0.0`

### 2. Type Definitions

- Created comprehensive type definitions in `types/` directory:
  - `types/leaflet-distortableimage.d.ts` - Main plugin types
  - `types/external-modules.d.ts` - External dependency types

### 3. Build System Updates

- Updated Vite configuration to handle TypeScript entry point
- Added TypeScript build script: `npm run build:types`
- Updated Node.js engine requirement to `>=16.0.0`

### 4. Entry Point Migration

- Converted `src/index.js` to `src/index.ts`
- Updated imports to reference `.js` files (for now)

## Type Definitions Available

### DistortableImageOverlay

```typescript
interface DistortableImageOverlayOptions extends ImageOverlayOptions {
  height?: number;
  crossOrigin?: boolean | string;
  edgeMinWidth?: number;
  editable?: boolean;
  mode?: 'distort' | 'drag' | 'rotate' | 'scale' | 'freeRotate' | 'lock';
  selected?: boolean;
  interactive?: boolean;
  tooltipText?: string;
  corners?: LatLng[];
  rotation?: {
    deg?: number;
    rad?: number;
  };
}
```

### DistortableCollection

```typescript
interface DistortableCollectionOptions {
  editable?: boolean;
  exportOpts?: {
    exportStartUrl?: string;
    exportUrl?: string;
  };
}
```

## Usage Examples

### TypeScript Usage

```typescript
import L from 'leaflet';
import '@hearsee-mobility/leaflet-distortableimage';

const map = L.map('map').setView([51.505, -0.09], 13);

const overlay = L.distortableImageOverlay('path/to/image.jpg', {
  height: 200,
  editable: true,
  mode: 'distort',
}).addTo(map);

// TypeScript will provide intellisense and type checking
overlay.setAngle(45, 'deg');
overlay.select();
```

### JavaScript Usage (Unchanged)

```javascript
// Existing JavaScript code continues to work without changes
const overlay = L.distortableImageOverlay('path/to/image.jpg', {
  height: 200,
  editable: true,
}).addTo(map);
```

## Development Workflow

### Building the Project

```bash
# Install dependencies
npm install

# Build TypeScript types
npm run build:types

# Build the entire project
npm run build

# Development server
npm run dev
```

### Running Tests

```bash
# Run tests (still uses existing test setup)
npm test

# Run linter (now includes TypeScript checking)
npm run linter
```

## Next Steps for Full Migration

### Phase 1: Utility Files (Recommended first)

- Convert utility files in `src/util/` to TypeScript
- These are typically simpler and have fewer dependencies

### Phase 2: Core Components

- Convert `DistortableImageOverlay.js` to TypeScript
- Convert `DistortableCollection.js` to TypeScript

### Phase 3: Edit System

- Convert edit handles and actions
- Convert toolbars and controls

### Phase 4: Final Cleanup

- Remove JavaScript files once TypeScript equivalents are complete
- Update imports to remove `.js` extensions
- Enable stricter TypeScript settings

## File Conversion Template

When converting a JavaScript file to TypeScript:

1. Rename `.js` to `.ts`
2. Add type annotations for parameters and return values
3. Add interface definitions for options objects
4. Update the entry point import to reference the new `.ts` file

Example conversion:

```typescript
// Before (JavaScript)
initialize(url, options) {
  L.setOptions(this, options);
  this._url = url;
}

// After (TypeScript)
initialize(url: string, options?: DistortableImageOverlayOptions) {
  L.setOptions(this, options);
  this._url = url;
}
```

## Benefits

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Intellisense and auto-completion
3. **Self-Documenting Code**: Types serve as documentation
4. **Easier Refactoring**: Safe renaming and restructuring
5. **Better Developer Experience**: Enhanced debugging and development tools

## Backwards Compatibility

- All existing JavaScript code continues to work
- No breaking changes to the public API
- Gradual migration allows for testing at each step
- Can be used in both TypeScript and JavaScript projects
