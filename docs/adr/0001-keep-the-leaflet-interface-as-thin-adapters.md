# Keep the `L.*` interface stable as thin adapters over internal modules

Every class, factory, and namespace the plugin hangs on `L` is pinned by `PublicSurfaceSpec` and used by downstream apps such as Hearsee-Web, so it stays stable outside a deliberate major release. New logic lives in internal TypeScript ES modules imported by `src/index.ts`, and the `L.X.extend` classes shrink to adapters that translate Leaflet calls into those modules. A near-empty `L` class is intentional; don't fold logic back into it.

## Consequences

- Behaviour changes ship only as fixes for pinned bugs; anything else that breaks callers waits for a major version.
- Tests target the internal modules' interfaces, while specs that go through `L` remain as the downstream safety net.
