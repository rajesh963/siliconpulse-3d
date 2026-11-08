# Architecture view (3D + 2D)

The Architecture view is the single SoC view. It renders the **spec-derived
block-and-bus diagram in 3D** (default) with a 2D schematic toggle, replacing the
old cluster-level 3D explorer.

Every company now has a hand-built diagram. The old 9-cluster navigation model and
`src/components/3d/` were removed.

## AURIX TC4Dx result

Source: Infineon AURIX TC4Dx user manual v1.1, **Figure 5** and chapters 1–46.

- **75 blocks**, **67 links**
- **Core layer: 44 blocks / 38 links** — CPU0–CPU5, CPUcs, SRI0/1/4/7/6/2/5/3,
  S2S, SDMA0/1, GETH0/1, HSSL, PCIe0/1, DRE, SRAM, LMU0–9, DFlash, DMU/PFI,
  PFLASH, BROM, eGTM, PPU, security and high-speed IO.
- **Peripheral layer: 29 blocks / 27 links** — FPI0/SPB and FPI1/COMPB with
  SCU, SBCU, SMU, SCR, PMS, Clock/CCU, SMIM, HSPHY, VMT, WTU, Ports, TRI,
  IR, FCE, ADC/TMADC, ERAY, QSPI, ASCLIN, I2C, MCMCAN, SENT, PSI5, PSI5-S,
  MSC and COMBCU, plus the S2F/S2C bridges.
- **All layer** shows the complete schematic; use zoom/pan.

Every CPU carries `SPB`/`COMPB` badges. The bus labels show the actual clock
domains: SRI 500 MHz, FPI0/SPB 100 MHz, FPI1/COMPB 100 MHz. S2S / S2F / S2C
bridges are first-class blocks, not one generic “bridge” box.

Screenshots: `docs/screenshots/arch3d-aurix.png` (3D), `arch3d-aurix-select.png` (selection), `arch2d-aurix.png` (2D).

## 3D renderer

`src/components/diagram/BlockDiagram3D.tsx` converts the 2D diagram into a 3D die:

- **Buses become busbars**: SRI/FPI/NoC lines are rendered as raised busbars.
- **Taps are segmented** at bus and block edges so links land on the bar instead of
  disappearing underneath it (`src/utils/blockDiagram3d.ts`).
- **Block archetypes**: CPU tiles get core rings, memories get bank grooves,
  crossbars get a lattice, bridges get a bridge spine, security gets a diamond,
  accelerators get tiles, IO gets pin rails, buses get a flat busbar.
- **Labels** are HTML overlays on the front face of each block; clicking a label or
  the block selects it.
- **Selection** dims unrelated blocks/links and highlights incident links in amber.
- **Camera presets** ISO / TOP / FRONT; the camera auto-fits the footprint.
- **Orbit** with drag, wheel zoom, and empty-space click to clear.

The 2D toggle keeps the original schematic with Core / Peripherals / All layers,
search, zoom/pan and the wire inspector.

## Company coverage

| Company / SoC | Diagram |
|---|---|
| Infineon AURIX TC4Dx | 75 blocks / 67 links (spec Figure 5) |
| Arm Total Compute 2024 | 26 blocks / 21 links |
| Broadcom BCM2712 | 24 blocks / 14 links |
| Samsung Exynos 2400 | 27 blocks / 16 links |
| Apple A17 Pro | 28 blocks / 16 links (public summary) |
| MediaTek Dimensity 9400 | 27 blocks / 16 links |
| TI C29x (F29H85x) | 28 blocks / 15 links (VBUSM/VBUSP/AXI-APB) |
| TI TMS320F28388D (C2000) | 26 blocks / 16 links |
| NVIDIA DRIVE Orin | 24 blocks / 15 links |
| Qualcomm Snapdragon 8 Gen 3 | 27 blocks / 16 links |
| Cerebras WSE-3 | 22 blocks / 27 links (wafer-scale array) |
| AMD Pensando DPU / P4 NIC | 30 blocks / 21 links (P4 parser/MAU/deparser) |

Screenshots: `docs/screenshots/arch3d-*.png`, `arch2d-aurix.png`, `nested-module-view.png`, `module-editor.png`.

## Bring your own architecture

Use **Load JSON / IP-XACT / CSV** in the Architecture header:

- `diagram.json` validated against `public/examples/diagram.schema.json`
- IP-XACT components mapped to blocks and inferred links
- CSV block/wire netlists

The uploaded diagram renders in 3D/2D, persists in the browser, and can be
exported again. See [DIAGRAM_IMPORT.md](DIAGRAM_IMPORT.md).

## Interactions

- Click a block → side panel with role, TRM section, ID, incident links.
- Click a link → protocol, width, clock and endpoints.
- `Open related 3D IP` jumps into the corresponding 3D hierarchy.
- Search filters/highlights blocks.
- Core / Peripherals / All layer switch.
- Wheel or ± zoom; drag to pan; Fit resets.
- Deep link: `?chip=infineon&view=diagram`.

## Data model

`src/types/diagram.ts` defines:

```ts
ArchitectureDiagram {
  id, companyId, socId, title, subtitle, source,
  width, height,
  groups: DiagramGroup[],
  blocks: DiagramBlock[],   // id, label, kind, x/y/w/h, specRef, moduleId, badges
  wires: DiagramWire[]      // id, orthogonal points, busType, width, clock, from/to
}
```

AURIX data lives in `src/data/diagrams/aurixTC4Dx.ts`.
`src/data/diagrams/index.ts` is the registry:

- `infineon` → the hand-built Figure 5 schematic.
- every other company → an auto-generated cluster/bus diagram until its public
  block diagram is encoded.

The integration JSON export now includes the diagram under `architecture`, so
the 2D view, 3D hierarchy and JSON are one model.

## Why this matters

The previous top-level view showed nine clusters and hid the actual buses,
bridges, peripheral split and CPU SPB/COMPB views. That is fine as a navigation
summary, but it is not an architecture diagram. This view exposes:

- CPU → SRI → memory/IO paths
- S2S vs S2F vs S2C bridge boundaries
- FPI0/SPB vs FPI1/COMPB peripheral partitioning
- memory/NVM/security/eGTM/PPU placement
- clock-domain labels at the bus level

## Limits

- It is a schematic, not a physical floorplan or pin-accurate netlist.
- NDA-only blocks (CSBCU/CSCU/CSS/CSRM, LETH, HSPHY, PPU internals) are shown as
  labeled public-summary blocks; no invented registers or bus widths.
- The AURIX diagram is the first hand-built one. Other companies currently use the
  auto-generated fallback; add their public figures to the registry as the next
  step.

## Next step

1. Pin-level interfaces and port anchoring.
2. Clock/reset/power domain overlays on the same schematic.
3. Check-engine annotations: CDC/RDC findings drawn on the exact wire/block.
4. Hand-built diagrams for the top five latest SoCs.
