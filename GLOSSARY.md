# Leaflet.DistortableImage

A Leaflet plugin for placing raster images on a map and stretching, rotating, and scaling them until they line up with the ground.

## Placement

**Image overlay**:
A raster image placed on the map and pinned there by its corners.
_Avoid_: layer, picture, distortable

**Corners**:
The four map positions an image overlay is pinned to, always ordered top-left, top-right, bottom-left, bottom-right.
_Avoid_: bounds, quad, points

**Original corners**:
The corners an image overlay was first placed with; restoring an image overlay returns it to them.
_Avoid_: initial dimensions, default position

**Angle**:
How far an image overlay is turned, measured along its top edge.
_Avoid_: rotation, bearing, azimuth

**Edited**:
Describes an image overlay whose corners differ from its original corners.
_Avoid_: dirty, modified, changed

## Editing

**Tool**:
Something a person can do to an image overlay or collection, offered on its toolbar and optionally bound to a key.
_Avoid_: action, button, control

**Mode**:
A tool that stays active and decides what dragging an image overlay's handles does, such as distort, rotate, scale, or lock.
_Avoid_: edit type, state

**Command**:
A tool that acts once when used, such as toggling transparency, stacking, or deleting.
_Avoid_: one-shot action, operation

**Keymap**:
The keys an image overlay responds to, drawn only from the tools it offers.
_Avoid_: action map, shortcuts, bindings

**Legend**:
The on-screen list of an image overlay's keymap.
_Avoid_: help panel, key guide

## Selection

**Collection**:
A set of image overlays that can be edited together once collected.
_Avoid_: group, layer group

**Selected**:
Describes the single image overlay on a map whose own toolbar and handles are showing.
_Avoid_: active, focused

**Collected**:
Describes an image overlay picked into its collection's working set, kept in the order it was picked. An image overlay is never selected and collected at once.
_Avoid_: multi-selected, grouped, checked
