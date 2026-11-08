# SiliconPulse Platform — public SoC/IP knowledge, IP-XACT and program tracking

This is the platform layer built on top of the 3D SoC explorer.

**Scale:** 11 companies · 12 public SoC presets · 436 hierarchy nodes · 25 reusable
IP definitions · 49 curated spec sections · 6 cross-vendor bindings · 6 seeded
change requests · 5 architecture decisions · 5 latest SoC sheets. All data is public or explicitly
marked as a public summary / illustrative binding.

---

## 1. Product pillars

| Pillar | What it does | Where |
|---|---|---|
| **SoC catalog** | Browse 9 vendor/architecture profiles, load any SoC into the 3D explorer, see public-data confidence. | Platform → SoC Catalog |
| **Spec query** | Query a block, section number or keyword. Returns a summary + section + source URL + “Open IP in 3D”. | Platform → Spec Query |
| **Cross-reference** | Reusable IP registry, vendor/usage graph, verified vs illustrative cross-vendor bindings. | Platform → Cross-Reference |
| **Integration JSON** | Recursive SoC JSON with instances, bridges, buses, domains, specs and tracker links; download one SoC or all specs. | Platform → Integration JSON |
| **IP-XACT** | Import 1685-2014 component XML, inspect bus interfaces/memory maps, assemble a custom SoC, export any catalog SoC. | Platform → IP-XACT |
| **Program tracker** | Change requests, architecture decision records and per-IP RTL/DV/timing gates linked to modules and spec sections. | Platform → Program Tracker |

---

## 2. Companies and public-data policy

The catalog covers:

| Company | SoC used as public reference | Public-data confidence |
|---|---|---|
| Arm | Total Compute 2024 reference solution (licensable CSS, not a shipped die) | high |
| Broadcom | BCM2712 (Raspberry Pi 5) | high |
| Samsung | Exynos 2400 | medium |
| Apple | A17 Pro | low — public block names only |
| TI | TMS320F28388D (C2000) + C29x (F29H85x) | high |
| NVIDIA | Drive Orin | medium |
| Qualcomm | Snapdragon 8 Gen 3 | medium |
| Infineon | AURIX TC4Dx (9,015-page TRM) | high |
| Cerebras | WSE-3 | medium |
| MediaTek | Dimensity 9400 | medium |
| TI (second preset) | C29x (F29H85x) | medium |
| AMD | Pensando DPU / P4 programmable NIC | medium |

The UI never presents a proprietary block map as fact. Apple and any other
undocumented units are explicitly labelled **public summary**; unknown/estimated
values are marked. Cross-vendor bindings carry a **verified** flag.

### Illustrative binding (not a supply-chain claim)

`Apple A17 Pro → TI power-management macro` is included as an **unverified,
illustrative** binding to demonstrate the feature. Replace it with the actual
BOM / IP-XACT vendor extension before using the platform for procurement.

---

## 3. Spec query

Open **Platform → Spec Query**. Query examples:

- `SRI arbiter`
- `§45.1`
- `power domain`
- `PCIe`
- `Cortex-X4`
- `CMA`

Results merge:

1. **Curated spec sections** — summaries written from public TRMs, datasheets,
   whitepapers or vendor pages. These carry a `TRM` / `DATASHEET` /
   `WHITEPAPER` / `VENDOR` badge and a source link.
2. **Module summaries** — generated from the public architecture model
   (`displayName`, `description`, clock domains, category) when no curated
   section exists. These are clearly a summary, not a licensed TRM.

Clicking **Open IP** loads that company and drills to the exact module, including
microarchitecture blocks such as the SRI arbiter.

---

## 4. Cross-reference graph

25 reusable IP definitions link vendors to SoC blocks:

- Arm Cortex-X4 / A720 / A520 across Arm, Samsung and Qualcomm
- Arm Cortex-A76 in Broadcom BCM2712
- AMD RDNA 3 in Samsung Xclipse 940 (verified)
- Arm Mali-G720, Ethos-U85, CMN-700 in Arm TCS24
- Apple Neural Engine / Secure Enclave (public summary)
- Qualcomm Adreno / Hexagon, NVIDIA Ampere / NVDLA
- Infineon TriCore / PPU, TI C28x / CLA, Cerebras SLAC, AMD P4 pipeline

Clicking a company chip loads the SoC and opens the relevant block.

---

## 5. Integration JSON

Open **Platform → Integration JSON**.

The generator emits `socpulse.integration.v1`:

- company + SoC identity, process, public-data confidence and sources
- clock / reset / power domain tables
- recursive block tree down to level 3 (`blocks[].children[]`)
- `instances` and `instanceCount` for every block (e.g. `LMU0/1` → 2, `CDSP0-17` → 18, `SRI0/1` → 2)
- first-class **bridges[]** with kind (`S2S`, `S2F`, `S2C`, `AXI_TO_APB`, `VBUSM`, `VBUSP`), parent and incident links
- `buses[]` derived from the connection graph (protocol, width, cross-clock counts)
- full `connections[]`, memory map, specs, reusable IP refs, vendor bindings and tracker items

Actions:

- **SoC JSON** downloads one company/SoC integration file.
- **All specs + SoCs** downloads the complete bundle (all companies, all specs, IP
  registry, bindings, seeded CRs/ADRs, latest five SoC sheets).
- **Block tree** is interactive: click a node to open that exact IP/sub-IP in 3D.
- **Bridge instances** panel opens a bridge block directly.

This is the machine-readable contract for integration; the 3D explorer is a view
over the same hierarchy.

## 6. IP-XACT integration

### Import

- Choose an `.xml` file (1685-2014 style, prefixed or unprefixed).
- The parser extracts component identity, bus interfaces, memory maps and ports.
- **Add to custom SoC** stores the component in `localStorage`.

### Custom assembly

- Add one or more imported components.
- Give the custom SoC a name and click **Build & load 3D**.
- Components are laid out in a 3×3 floorplan, ports are derived from bus
  interfaces, and master→slave connections are inferred.
- The custom SoC is persisted and appears in the chip preset selector as
  `Custom - IP-XACT assembly`; `?chip=custom` deep-links to it.

### Export

- Every catalog SoC can be exported as an IP-XACT component.
- `busInterfaces` come from the interconnect model and `memoryMaps` from the
  TRM memory-map ranges; clock/reset/power domains are preserved as comments.

**Limitations:** vendor extensions are not yet round-tripped; the importer is a
practical 1685-2014 subset, not a full schema validator. Normalize vendor bus
names before tape-out sign-off.

---

## 7. Program tracker

### Change requests
Seeded CRs cover real issues, e.g. eGTM ATOM IRQ synchronization, SMU NMI
reset-domain crossing, Xclipse GPU↔NoC FIFO depth, PCIe reference-clock power
sequencing and ANE SRAM DVFS ordering. Each CR carries:

`company · target module · discipline (arch/RTL/DV/PD/safety/fw) · severity ·
status · owner · linked spec section · history`

Create a new CR from **New CR**; change its status with the inline selector. New
CRs and status changes persist in `localStorage`.

### Architecture decisions
Seeded ADRs cover the Arm CMN-700 choice, AURIX SRI hub, Apple public-summary
policy, IP-XACT exchange format and verified-binding policy. Create new ADRs with
context, decision and consequences.

### RTL / DV gates
Per-IP matrix of RTL frozen, lint, CDC, formal, UPF, timing and DV coverage for
presets that carry deliverable data (Infineon, TI, NVIDIA and others). Each row
opens the IP in 3D.

---

## 8. Architecture of the front end

```
src/
  components/
    platform/          PlatformWorkspace + Catalog/SpecQuery/CrossRef/IpXact/Tracker
    3d/                3D scene, module archetypes, traces, substrate
    ui/                TopNav, inspector, level navigator, domain legend
    trm/               TRM memory map / clock / domain / hierarchy views
  data/
    socCatalog.ts      Unified CompanySoCEntry catalog (9 SoCs)
    infineonAurix.ts   TC4Dx hierarchy, domains, 72 connections
    extendedCompanies  Arm/Broadcom/Samsung/Apple public summaries
    platformData.ts    profiles, specs, IP registry, bindings, CRs, ADRs
  utils/
    hierarchy.ts       drill-down, centering, domain lookup
    ipxact.ts          IP-XACT parse / build / export
```

State is local; there is no backend. In production, replace `localStorage` with a
database + auth and index the licensed TRMs server-side.

Screenshots: `docs/screenshots/platform-*.png` and the AURIX/TI bridge views.

---

## 9. Known limits / next step

- Public data only; Apple is deliberately coarse and some supply-chain bindings
  are illustrative.
- IP-XACT import covers component/bus/memory/port subsets, not full vendor
  extensions or schema validation.
- Cross-reference graph is a curated seed, not an exhaustive industry database.
- Bridge instances are explicit for AURIX SRI and TI C29x VBUS; other SoCs use generic bridge nodes until their public bus topology is encoded.
- Tracker is local-first; no multi-user audit trail or Jira/GitHub sync yet.
- The 3D layout is architectural, not a physical floorplan or package model.
