# ViaSight

**Road + vision.** ViaSight is an AI operations platform that detects potholes from road imagery, ranks them by confidence and severity, and maps them for repair crews and city operators.

Built for fast field-to-dashboard workflows: upload a road photo, run computer vision detection, persist a geospatial record, and act from a live Kampala coverage map.

---

## The problem

Urban roads degrade faster than inspection teams can walk them. Potholes cause vehicle damage, congestion, and safety risk—especially in rapidly growing cities. Manual surveys are slow, subjective, and rarely produce structured data that repair teams can prioritize.

ViaSight closes that gap with **vision → confidence → severity → map → dispatch**.

---

## What ViaSight does

| Capability | Description |
|---|---|
| **Detect** | Run hosted computer vision on road photos via the **Roboflow** inference API; bounding boxes and confidence scores appear on the image. |
| **Score** | Convert model confidence into severity buckets operators can act on (`low` / `moderate`–`medium` / `high`). |
| **Map** | Plot every detection on an interactive **Mapbox** basemap (Leaflet) centered on Kampala coverage. |
| **Operate** | Browse detections, events, repair queues, and rollup reports from a single authenticated dashboard. |
| **Persist** | Store records in **Supabase** (Postgres) with RLS-backed access for signed-in operators. |

### Operator journey

1. **Sign in** with Supabase Auth.
2. Open **Overview** — map + detection list + detail panel (collapsible for map focus).
3. Open **Detect** — upload a road photo → Roboflow inference → review boxes & confidence → **Save pin**.
4. The new pin appears on the map and in **Events** / **Repairs** / **Reports** with severity and confidence.
5. Use **Live map** for a map-first view; **Settings** for connection status and data refresh.

```text
Photo upload ──► Roboflow HTTP detect ──► Boxes + confidence
                                              │
                                              ▼
                                    Severity bucket + geotag
                                              │
                                              ▼
                              Supabase (potholes / datasets)
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                   Leaflet+Mapbox         Events table         Repair queue
```

---

## Tech stack

| Layer | Technology | Role |
|---|---|---|
| App | **Vite**, **React 19**, **TypeScript**, **Tailwind CSS** | Fast SPA for the ops dashboard |
| Routing | **React Router** | Overview, Live map, Detect, Events, Repairs, Reports, Settings, Sign-in |
| Maps | **Leaflet** + **react-leaflet** + **Mapbox** light tiles | Interactive geospatial coverage |
| Vision | **Roboflow** hosted detect API | Pothole bounding boxes & confidence |
| Backend | **Supabase** (Postgres, Auth, Row Level Security) | Auth, storage of detections, datasets |
| Icons / UI | **Lucide React**, IBM Plex Sans | Clear enterprise ops chrome |
| Deploy target | Static hosting (e.g. Vercel / Netlify) | Single frontend build, no custom server |

### Computer vision (Roboflow)

ViaSight calls Roboflow’s hosted HTTP inference endpoint with a base64 road image:

- Model id / version are configured via environment variables.
- Predictions return center `(x, y)`, `width`, `height`, `confidence`, and class label.
- Boxes are drawn on a canvas overlay for operator review.
- Confidence drives severity classification before the record is written to Supabase.

Configure:

```env
VITE_ROBOFLOW_API_KEY=...
VITE_ROBOFLOW_MODEL=your-pothole-model
VITE_ROBOFLOW_VERSION=1
```

### Maps (Mapbox)

The dashboard uses Mapbox **light-v11** raster tiles through Leaflet for a clean operations basemap. Without a token the app can fall back to OpenStreetMap tiles for local development.

```env
VITE_MAPBOX_TOKEN=pk....
```

### Data platform (Supabase)

- **Auth** — email/password sign-in; protected application routes.
- **Postgres** — `datasets` and `potholes` tables (see [`supabase/schema.sql`](supabase/schema.sql)).
- **RLS** — authenticated operators can read detections and insert new pins from Detect.
- Core fields on each pothole: `latitude`, `longitude`, `confidence`, `severity`, `status`, dimensions, road/district metadata, timestamps, and JSON `metadata` (e.g. detection boxes).

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

---

## Data model (potholes)

| Field | Purpose |
|---|---|
| `confidence` | Model score `0…1` from Roboflow (or calibrated upload pipeline) |
| `severity` | `low` · `moderate` · `high` · `patch` (UI maps moderate → medium) |
| `status` | `detected` · `verified` · `assigned` · `in_progress` · `repaired` · `rejected` |
| `latitude` / `longitude` | Map pin |
| `width_m` / `length_m` / `depth_m` / `area_sqm` | Geometry estimates for repair planning |
| `road_name` / `district` | Human-readable location |
| `detection_method` | e.g. `ai_vision`, `upload` |
| `metadata` | Extensible JSON (bounding boxes, source, etc.) |

**Severity from confidence (product rule):**

- `< 0.75` → low  
- `< 0.9` → medium / moderate  
- `≥ 0.9` → high  

---

## Application surfaces

- **Overview** — three-pane ops console: detection feed, Mapbox map, detail drawer (confidence, severity, alerts, road camera panel).
- **Live map** — map-first coverage with detail on demand.
- **Detect** — upload → Roboflow → canvas overlay → save to Supabase.
- **Events** — chronological table of detections with status, severity, confidence.
- **Repairs** — priority queue biased toward higher severity / in-progress work.
- **Reports** — totals, verified counts, average confidence, severity mix.
- **Settings** — account, Supabase / Mapbox / Roboflow connection status, refresh.

Panels (sidebar, list, detail) collapse so operators can focus the map during briefings.

---

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project with [`supabase/schema.sql`](supabase/schema.sql) applied
- Roboflow account + pothole detection model
- Mapbox public token

### Install

```bash
npm install
cp .env.example .env
# fill VITE_SUPABASE_*, VITE_MAPBOX_TOKEN, VITE_ROBOFLOW_*
npm run dev
```

Open the printed local URL, sign in with an Auth user from your Supabase project, and explore Overview → Detect → map.

### Build

```bash
npm run build
npm run preview
```

### Schema

Apply [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor (or via `psql`) to create `datasets`, `potholes`, indexes, and RLS policies.

Optional maintainer scripts under `scripts/` help restore or validate environments (require service-role / DB credentials locally; never commit secrets).

---

## Environment variables

See [`.env.example`](.env.example):

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Publishable / anon key for the SPA |
| `VITE_MAPBOX_TOKEN` | Recommended | Mapbox access token for light basemap |
| `VITE_ROBOFLOW_API_KEY` | Recommended | Roboflow API key for hosted detect |
| `VITE_ROBOFLOW_MODEL` | Recommended | Roboflow model id |
| `VITE_ROBOFLOW_VERSION` | Recommended | Model version |

---

## Project layout

```text
src/
  auth/           Supabase Auth provider + route guard
  components/     Map, list, detail, sidebar, page chrome
  context/        Shared pothole query state
  hooks/          Panel layout + data hooks
  lib/            Supabase client, Roboflow client, mappers
  pages/          Overview, Map, Detect, Events, Repairs, Reports, Settings, Sign-in
  types/          App + database types
supabase/
  schema.sql      Postgres schema + RLS
```

---

## Security notes

- Do not commit `.env` or service-role / database passwords.
- The browser only receives the Supabase publishable key and Mapbox / Roboflow client credentials intended for front-end use.
- Row Level Security restricts table access to authenticated operators.

---

## Roadmap

- Deeper Roboflow model fine-tuning on local road conditions  
- Fleet / dashcam batch ingest  
- Dispatch integrations and repair SLA tracking  
- Mobile capture companion  
- Public open-data exports for civic partners  

---

## License

Proprietary for hackathon submission unless otherwise stated by the authors. Contact the team for usage terms.
