# Bring your own architecture

The Architecture view can load a user-supplied block-and-bus diagram at runtime.
No code change and no rebuild are required.

## UI flow

1. Open **Architecture**.
2. Click **Load JSON / IP-XACT / CSV**.
3. Choose one of:
   - `diagram.json`
   - one or more IP-XACT 1685-2014 XML components
   - a CSV block/wire netlist
4. Validate the draft and click **Load diagram**.
5. The uploaded diagram renders in 2D. It is stored in `localStorage`
   for the current SoC.
6. **Export JSON** downloads the current diagram, including built-in ones.
7. **Clear upload** restores the built-in diagram.

The upload is scoped to the current chip preset. Switching presets clears it.

## diagram.json

Schema: `public/examples/diagram.schema.json`

Minimal:

```json
{
  "title": "My SoC",
  "blocks": [
    { "id": "cpu0", "label": "CPU0", "kind": "cpu", "x": 60, "y": 80, "w": 180, "h": 90 },
    { "id": "noc", "label": "NoC", "kind": "bus", "x": 60, "y": 260, "w": 800, "h": 16 },
    { "id": "ddr", "label": "DDR", "kind": "memory", "x": 360, "y": 80, "w": 180, "h": 90 }
  ],
  "wires": [
    { "id": "w0", "from": "cpu0", "to": "noc", "busType": "AXI4", "width": 64, "clock": "F_CPU" },
    { "id": "w1", "from": "ddr", "to": "noc", "busType": "AXI4", "width": 64, "clock": "F_MEM" }
  ]
}
```

- `blocks[]` is required.
- `wires[]` may give explicit `points` (`[[x,y], ...]`) or just `from`/`to`; the
  importer routes an orthogonal path between block centers when points are absent.
- `kind` affects the diagram glyph: `cpu`, `bus`, `crossbar`, `bridge`, `memory`,
  `peripheral`, `accelerator`, `io`, `security`, `clock`, `debug`.
- `groups` are optional dashed frames.
- `moduleId` is optional; if present, **Open IP in Platform** can jump to it.
- Width/height are derived from the blocks if omitted.

Full example: `public/examples/simple-soc-diagram.json`.

## Nested modules (json of json)

Any block may carry its own `internal` diagram:

```json
{
  "id": "cpu0",
  "label": "CPU0",
  "kind": "cpu",
  "x": 60, "y": 80, "w": 180, "h": 90,
  "internal": {
    "title": "CPU0 internals",
    "blocks": [
      { "id": "fetch", "label": "Fetch", "kind": "cpu", "x": 60, "y": 80, "w": 140, "h": 80 },
      { "id": "decode", "label": "Decode", "kind": "cpu", "x": 240, "y": 80, "w": 140, "h": 80 }
    ],
    "wires": [
      { "id": "f_d", "from": "fetch", "to": "decode", "busType": "uop", "width": 128 }
    ]
  }
}
```

- Click a block with an internal module → **Open internal module**.
- Breadcrumb shows `Root / CPU0 / …`; **Up** returns.
- Each level is a full diagram and can itself contain nested modules.
- **Edit module** edits the current level; nested modules are preserved.

## Module editor

**Architecture → Edit module** opens a three-tab editor:

- **Blocks** — edit label, kind, specRef, x/y/w/h, details; add/delete; add an
  internal module.
- **Links** — edit from/to, bus type, width, clock; add/delete.
- **JSON** — paste/apply the full nested JSON.

**Save module** normalizes and writes the edited level back to the parent.
`localStorage` stores the resulting root diagram.

The sample `simple-soc-diagram.json` includes a nested CPU example so you can try
click → dive → edit immediately.

## CSV format

One row per block or wire. Header:

```csv
type,id,label,kind,x,y,w,h,from,to,busType,width,clock,specRef
```

Example:

```csv
type,id,label,kind,x,y,w,h,from,to,busType,width,clock,specRef
block,cpu,CPU,cpu,60,80,180,90,,,,,
block,noc,NoC,bus,60,260,800,16,,,,,
block,ddr,DDR,memory,380,80,180,90,,,,,
wire,w0,CPU to NoC,,,,,,cpu,noc,AXI4,64,F_CPU,
```

- `type` is `block`, `wire` or `group`.
- Wires with no `points` route from `from` to `to`.
- `points` may be `x:y;x:y`.
- `badges` uses `|` (for example `SPB|COMPB`).

Example: `public/examples/simple-soc.csv`.

## IP-XACT mapping

Two entry points:

1. **Architecture → Load JSON / IP-XACT / CSV → IP-XACT** for an immediate draft.
2. **Platform → IP-XACT → Map to diagram** after parsing/adding components.

Upload one or more `ipxact:component` XML files.

Current mapping:

- each component becomes a block
- component name → label
- vendor/version → sublabel
- bus interfaces → badges and wire metadata
- master/slave bus interfaces with matching `busType` → inferred wire
- memory maps are kept in the block details, not rendered
- components are laid out in a 4-column grid

This is deliberately a **draft**: it cannot infer bridges that are absent from the
IP-XACT, and it does not place components physically. It is a starting point, not
a sign-off netlist.

Examples: `public/examples/simple_cpu.xml`, `public/examples/simple_dma.xml`.

## GitHub / distribution

The app is a static frontend:

```bash
npm install
npm run build
# serve dist/
```

Anyone can run it and upload their own `diagram.json` at runtime. No backend is
required for the upload. Uploaded diagrams stay in that browser's
`localStorage`; they are not sent anywhere.

For a public deployment, host `dist/` on any static host. If the diagram is
sensitive, remember that the app is client-side: the file stays in the browser,
but the hosting provider still serves the app itself.

## What this does not do yet

- It does **not** parse a PDF/DOCX spec into a diagram.
- IP-XACT import does **not** validate protocol compatibility or vendor
  extensions.
- CSV import does not validate electrical correctness.
- There is no multi-user editing, version history or audit trail.
- Live drag-and-drop layout editing is not implemented yet. The diagram schema and import layer are the foundation for that editor.

The schema and import layer are the foundation for those features. A future
spec-to-diagram pipeline would produce this same `diagram.json` with citations,
confidence scores and human review before applying it.
