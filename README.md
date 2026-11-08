# SiliconPulse 3D

An interactive SoC/IP architecture explorer, public spec knowledge base, IP-XACT
workbench and program tracker.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Views

- **Architecture 3D** — spec-derived block/bus diagram rendered in 3D (orbit,
  select, focused links) with a 2D schematic toggle, core/peripheral layers and
  TRM references. Hand-built for all 11 SoC presets, and **bring-your-own** via
  `diagram.json`, IP-XACT XML or CSV.
- **Platform** — 11-company / 12-SoC catalog, spec query, cross-vendor IP graph,
  integration JSON, IP-XACT import/export + custom SoC assembly, and change-request / ADR / RTL-DV tracking.
- **TRM Specs & Memory** — memory map, clocks, domains and subsystem hierarchy.
- **CDC/RDC Matrix**, **Deliverables**, **PRD**, **Customer PRD Cascade**.

## Bring your own SoC

In **Architecture 3D**, click **Load JSON / IP-XACT / CSV**:

- upload a `diagram.json` matching `public/examples/diagram.schema.json`
- upload one or more IP-XACT components
- upload a CSV block/wire netlist

The diagram validates, renders in 3D/2D, and stays in your browser. **Export JSON**
downloads the current diagram. See [docs/DIAGRAM_IMPORT.md](docs/DIAGRAM_IMPORT.md).

## Desktop

Run as a native desktop window: `npm run desktop`. Build a Linux AppImage:
`npm run package:linux`. See [docs/DESKTOP.md](docs/DESKTOP.md).

## Deploy

Use the included GitHub Actions workflow or any static host. See [docs/DEPLOY.md](docs/DEPLOY.md).

## Data

- `src/data/infineonAurix.ts` — AURIX TC4Dx hierarchy from the public 9,015-page
  user manual (v1.1, 2025-06-26).
- `src/data/extendedCompanies.ts` — Arm Total Compute 2024, Broadcom BCM2712,
  Samsung Exynos 2400 and Apple A17 Pro public summaries.
- `src/data/diagrams/` — spec-derived architecture diagrams and auto fallback.
- `src/data/platformData.ts` — company/SoC profiles, 49 curated spec sections,
  25 reusable IP definitions, cross-vendor bindings, latest five SoC sheets,
  seeded CRs and ADRs.

Import formats and examples: [docs/DIAGRAM_IMPORT.md](docs/DIAGRAM_IMPORT.md).

Public-data policy: proprietary details are never presented as fact; Apple and
other undocumented blocks are labelled public summaries, and cross-vendor
bindings carry a `verified` flag. See [docs/PLATFORM.md](docs/PLATFORM.md) and
[docs/AURIX_TC4Dx-notes.md](docs/AURIX_TC4Dx-notes.md).

## Notes / limits

- Front-end only; CR/ADR and custom SoC state use `localStorage`.
- IP-XACT support is a practical 1685-2014 subset, not a full schema validator.
- The 3D layout is architectural, not a physical floorplan/package model.
