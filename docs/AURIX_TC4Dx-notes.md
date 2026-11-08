# Infineon AURIX™ TC4Dx — source analysis & 3D hierarchy

**Source document:** `/home/rajesh/Downloads/aurix.pdf`
**Title:** *AURIX™ TC4Dx user manual*, v1.1, 2025-06-26
**Pages:** 9,015 · **Architecture:** TriCore™ 1.8, up to 500 MHz, 28 nm eFlash

This note records what was extracted from the TRM PDF and how it maps into the
SiliconPulse 3D drill-down model (`src/data/infineonAurix.ts`).

---

## 1. What the PDF says (source-of-truth highlights)

| Domain | Extracted fact | TRM reference |
|---|---|---|
| CPU | CPU0–CPU5 + CPUcs (6+1 instances), TC1.8, up to 500 MHz, lockstep, FPU, virtualization | §4.1–4.2, §4.6 |
| PPU | Vector AI accelerator with `PPU.VMEM` (128 KB) and `PPU.CSM` (512 KB); chapter is NDA-only | §13, address map |
| Interconnect | 8 × SRI crossbars (SRI0–SRI7) at 500 MHz, 64-bit; FPI0 SPB and FPI1 COMPB at 100 MHz | §3, §6, §7 |
| NVM | PFLASH0–5 + PFLASHcs = 21 MB; DFLASH0/1 / EEPROM = 1.1 MB; UCB/CFS; BROM 64 KB; DMU/PFI | §5.1–5.2 |
| SRAM | LMU0–LMU9 = 10 × 512 KB; CPUx DSPR 240 KB + PSPR 64 KB + DLMU 512 KB | §10, address map |
| SDMA | Two lockstep DMA controllers with 16 resource partitions, CRC32 and timestamps | §9.1 |
| Ethernet | GETH0/GETH1, 10M/100M/1G/2.5G/5G, TSN/AVB, XGMAC + bridge | §14.1–14.2 |
| PCIe | Gen3 x1 at 8 GT/s, root complex or endpoint, 4+4 DMA channels | §19.1 |
| HSSL | HSSL/HSCT serial link, up to 320 MBaud | §17.1 |
| Clocks | SYSPLL0 → fSRI 500 MHz; PERPLL1–3; MCCU/PCCU/DCCU; fSPB = 100 MHz | §32.1–32.3 |
| eGTM | eGTM v4.1; ATOM/TOM/TIM, DTM/CDTM, CMU/TBU/ICM, CCM/SPE/MON/CMP | §44.1–44.2 |
| ADC | TMADC[0:7], FCC[0:9], DSADC[0:9], EXMOD[0:7], CDSP[0:17] | §45.1, resource table |
| CAN / CAN-XL | MCMCAN (6 nodes), CAN-XL ISO 11898-1:2024, 2048-byte payload, 20 Mbit/s | §21.1, §22.1 |
| FlexRay | ERAY 2.1, 10 Mbit/s, 128 message buffers, 8 KB message RAM | §23.1 |
| Serial / sensor | ASCLIN/LIN/SPI (up to 28), SENT 15 channels, PSI5/PSI5-S, MSC, QSPI, xSPI, SDMMC, I2C | §18, §24–§31 |
| Safety | SMU_SAFE0/1 + SMU_CS + SMU_STDBY, SCU/ERU, IR (2048 SRNs), WTU, FCE, PMS/SMM, SCR | §35, §40–§43, §36–§39 |

The TC4Dx block diagram (Figure 5) and the per-chapter feature lists were used to
name and group the clusters; the system address map (§2.2) supplied the memory
ranges shown in the TRM tab.

---

## 2. Hierarchy created in the app

```
Infineon_AURIX_TC4Dx                         L0 (SoC)
├── Safe_Realtime_Compute                    L1  CPU0–5, CPUcs, PPU
│   ├── CPU0 … CPU5                          L2  (CPU0 has L3 internals)
│   ├── CPUcs / PPU                          L2
│   └── CPU0 → CORE, PMI, DMI, PCACHE, DCACHE, SFR/CSFR, STM, LS_CMP   L3
├── NVM_Subsystem                            L1  PFLASH0-2, PFLASH3-5+cs, DFLASH, UCB/CFS, BROM, DMU/PFI
├── eGTM_v4_Timer                            L1  ATOM/TOM/TIM, DTM, CMU/TBU, CCM/SPE
├── SRI_FPI_Interconnect                     L1  SRI0/1…SRI6/7, FPI0 SPB, FPI1 COMPB
├── Safety_Clock_Control                     L1  SMU, SCU/ERU, IR, WTU, FCE, PMS/SMM, PLL/CCU, SCR
├── High_Speed_Interfaces                    L1  GETH0/1, PCIe0/1, HSSL/HSCT, HSPHY
│   └── GETH0 → HOST_IF, BRIDGE, XGMAC0/1, HSPHY, ECC/SAFE   L2 → L3
├── LMU_SDMA_Memory                          L1  LMU0-1, 2-3, 4-6, 7-9, SDMA0/1
├── Automotive_Comms                         L1  MCMCAN, CANXL, ERAY, ASCLIN, SENSOR IF, STORAGE IF, DRE
└── ADC_Analog_Cluster                       L1  TMADC0-7, DSADC, FCC, CDSP, EXMOD
```

**Counts:** 115 module nodes, 72 interconnect/CDC connections, **7 clock domains,
6 reset domains, 7 power domains**, and 7 memory-map ranges. Eight IPs have L3 microarchitecture
groups (CPU0, GETH0, SRI0/1, MCMCAN, ATOM, LMU0/1, TMADC0/1, PFLASH0-2).

Key nodes carry a `docRef` (e.g. `§4.1–4.2`, `§45.1`) that is displayed in the
right-hand inspector so a reviewer can jump back to the TRM chapter.

---

## 3. Rendering / navigation fixes

The original scene mixed **absolute** child coordinates with a rig that rendered
only one hierarchy level, so drilled-down blocks sat off the die plate and the
camera stayed framed for the whole 48 × 38 mm SoC.

Changes made:

1. **Local coordinates** — every `ModuleNode.position` is now local to its parent
   (`y = height/2`, so blocks sit on the die surface). Existing TI/NVIDIA nested
   nodes were converted too.
2. **Level re-centring** — `src/utils/hierarchy.ts` computes the level bounding
   box and centres it on the origin, so the substrate, camera and traces share one
   origin.
3. **Camera fit per level** — distance is derived from the level radius (and the
   canvas aspect ratio). Entering a 13 × 9 subsystem now zooms to that die instead
   of keeping the 55-unit top-level camera.
4. **Port-anchored traces** — `InterconnectTrace3D` starts/ends at the actual
   perimeter pin (normal + offset) and scales the arch/radius to the level.
5. **Discoverability** — a persistent `LevelNavigator` panel lists the current
   sub-blocks with open buttons; breadcrumb + `↑` button in the top bar; `Enter`
   opens the selected module, `Esc`/`Backspace` goes up; double-click or the
   per-block `OPEN n` chip also drills. TRM/deliverables/PRD/requirements
   "View in 3D" actions now drill to the correct ancestor level.
6. **Label strategy** — short die markings (`CPU`, `NVM`, `SRI`, `eGTM`, …) on the
   top floorplan, compact names at sub-module level, full tooltip on hover; no
   overlapping label soup at L3.
7. **Inspector layout fix** — the drawer had been collapsing to 1 px because the
   canvas was `w-full` and the drawer could shrink; it is now `shrink-0` + the
   canvas uses `min-w-0`.

### Architectural / microarchitectural layer

- The floorplan was rearranged to follow the TRM topology: **CPU at top-centre,
  SRI fabric in the centre, NVM top-left, eGTM top-right, safety left, HSIO right,
  comm bottom-left, LMU/SDMA bottom-centre, ADC bottom-right**.
- Clusters carry a **die marking + role subtitle** (`CPU · 6× TC1.8 + PPU`,
  `NVM · 21 MB Flash`, `SRI · SRI/FPI Fabric`, …) and the CPU master gets a gold frame.
- L2 IPs use type-specific markings: memory banks, crossbar lattices, bridge
  beams, CPU core tiles, analog rings, security diamonds and peripheral pin rails.
  A legend is rendered bottom-right.
- Eight key IPs now drill to **L3 microarchitecture**, e.g. SRI initiator/arbiter/
  target/S2S/EDC, MCMCAN X_CAN/message RAM/CRE/DMA/host, ATOM timebase/channels/
  ARU/DTM/ADC triggers, LMU APU/SRAM/ECC/RMW, TMADC trigger/sample/SAR/FIFO/cal,
  PFLASH PFI/RWB/bank/ECC/RLS, CPU0 CORE/PMI/DMI/caches/lockstep, GETH0 host/
  bridge/XGMAC/HSPHY.

### Clock / reset / power domains

Domain membership is carried by every node (`clockDomains`, `resetDomains`,
`powerDomains`) and inherited down the hierarchy so microarch blocks stay in the
same power/reset group as their parent IP:

| Domain | Supply / role | Members |
|---|---|---|
| `PD_CORE` | EVRC VDD 0.8 V | CPUs, PPU, SRI, LMU, eGTM, safety logic |
| `PD_NVM` | VDDP3NVM | PFLASH, DFLASH/EEPROM, UCB, BROM, DMU |
| `PD_ADC` | VDDM | TMADC, DSADC, FCC, CDSP, EXMOD |
| `PD_PAD` | VDDEXT | CAN/CAN-XL, ASCLIN, QSPI, SENT, PSI5, MSC, DRE |
| `PD_HSIO` | VDDPHPHY / VDDHSIF | GETH, PCIe, HSSL/HSCT, HSPHY, xSPI |
| `PD_STANDBY` | VDDEVRSB | SCR, RTC, standby RAM, PMS0/1/2 |
| `PD_PMS` | VDD3PMS | PMS/SMM, EVRC, PLL/CCU |

- **COLOR** can be switched to `Clock domain`, `Reset domain` or `Power domain`.
- **LENS** (or any row in the domain legend) isolates a single domain: member
  blocks and their traces stay bright, everything else dims. If the domain has no
  member at the current level (e.g. `PD_STANDBY` at the top floorplan), the app
  automatically opens the parent level containing the first member.
- Clock / reset / power chips in the inspector and the TRM **Domain Map** tab are
  clickable and feed the same lens. Reset domains now include power-on, system,
  safety, standby, debug and kernel resets.

### Interaction / domain views

- **Colour by CLUSTER / CLOCK / CDC** in the second toolbar row. Clock mode colours
  blocks by their primary clock domain and traces by the source clock; CDC mode
  colours blocks by worst port/link status.
- Selecting a block dims all unrelated blocks and traces (focus mode) and the
  inspector lists every incident link with its endpoints, widths and clock crossing.
- The navigator header shows the architecture level and counts for the current
  level: links, cross-clock links and CDC violations.
- Click empty space or press **Esc** to clear the focus; hover any block for its full
  display name.

---

## 4. How to navigate & deep links

Use the left **SUBMODULE NAV** panel (arrow button), double-click a 3D block,
press **Enter** on a selected block, or use the breadcrumb / **↑** button and
**Esc** to go up. The Infineon preset is now the app default.

The app reads `?chip=` and `?module=` on load and keeps the URL in sync:

- `/?chip=infineon&module=inf_soc_top` — AURIX top-level floorplan
- `/?chip=infineon&module=inf_cluster_compute` — 6× TriCore + PPU
- `/?chip=infineon&module=inf_cpu0` — CPU0 internals (CORE/PMI/DMI/caches)
- `/?chip=infineon&module=inf_cluster_comm` — CAN-XL / FlexRay / sensor IFs
- `/?chip=infineon&module=inf_mcmcan` — MCMCAN microarchitecture (X_CAN / RAM / CRE / DMA)
- `/?chip=infineon&module=inf_sri_compute` — SRI crossbar microarchitecture (init/arbiter/target/S2S/EDC)
- `/?chip=infineon&module=inf_pflash_low` — PFLASH memory-macro internals
- `/?chip=ti&module=ti_subsys_c28x` — TI nested drill-down regression check

Screenshots: `docs/screenshots/` (top-level, clock/reset/power domains, domain lens, TRM domain map, focus mode, compute/CPU0/microarch views).
