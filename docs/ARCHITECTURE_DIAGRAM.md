# Architecture diagram view

The Architecture view is a **2D block-and-bus schematic** derived from public
TRM block diagrams. There is no 3D scene or Three.js dependency.

## AURIX TC4Dx

Source: Infineon AURIX TC4Dx user manual v1.1, Figure 5 and chapters 1–46.

- **75 blocks**, **67 links**
- **Core layer: 44 blocks / 38 links** — CPU0–CPU5, CPUcs, SRI0/1/4/7/6/2/5/3,
  S2S, SDMA0/1, GETH0/1, HSSL, PCIe0/1, DRE, SRAM, LMU0–9, DFlash, DMU/PFI,
  PFLASH, BROM, eGTM, PPU, security and high-speed IO.
- **Peripheral layer: 29 blocks / 27 links** — FPI0/SPB and FPI1/COMPB with
  SCU, SBCU, SMU, SCR, PMS, Clock/CCU, SMIM, HSPHY, VMT, WTU, Ports, TRI,
  IR, FCE, ADC/TMADC, ERAY, QSPI, ASCLIN, I2C, MCMCAN, SENT, PSI5, PSI5-S,
  MSC and COMBCU, plus S2F/S2C bridges.
- **All layer** shows the complete schematic.

CPU blocks carry `SPB`/`COMPB` badges. Bus labels show **SRI 500 MHz**, **FPI0/SPB
100 MHz** and **FPI1/COMPB 100 MHz**. S2S/S2F/S2C are first-class bridge blocks.

## Interactions

- Click a block → role, TRM section, ID, incident links.
- Click a link → protocol, width, clock, endpoints.
- **Open internal module** dives into a nested `internal` diagram; breadcrumb and
  **Up** return.
- **Edit module** edits blocks, links, nested modules and raw JSON.
- Search, zoom, pan and Fit.
- **Load JSON / IP-XACT / CSV** brings your own architecture; **Export JSON**
  downloads the current level.

## Company coverage

| Company / SoC | Diagram |
|---|---|
| Infineon AURIX TC4Dx | 75 blocks / 67 links |
| Arm Total Compute 2024 | 26 blocks / 21 links |
| Broadcom BCM2712 | 24 blocks / 14 links |
| Samsung Exynos 2400 | 27 blocks / 16 links |
| Apple A17 Pro | 28 blocks / 16 links (public summary) |
| MediaTek Dimensity 9400 | 27 blocks / 16 links |
| TI C29x (F29H85x) | 28 blocks / 15 links |
| TI TMS320F28388D (C2000) | 26 blocks / 16 links |
| NVIDIA DRIVE Orin | 24 blocks / 15 links |
| Qualcomm Snapdragon 8 Gen 3 | 27 blocks / 16 links |
| Cerebras WSE-3 | 22 blocks / 27 links |
| AMD Pensando DPU / P4 NIC | 30 blocks / 21 links |

Screenshots: `docs/screenshots/arch2d-aurix.png`, `module-editor.png`,
`platform-*.png`.

## Limits

- It is a schematic, not a physical floorplan or pin-accurate netlist.
- NDA-only blocks are labels only; no invented registers.
- Hand-built diagrams exist for the presets above; uploaded diagrams are
  normalised through the same schema.
- No live drag-and-drop layout editor yet; editing is form/JSON based.
