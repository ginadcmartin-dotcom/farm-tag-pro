## Overview

DA farmer-to-parcel tagging system. Two surfaces, one Lovable project:

- **Web Dispatcher / Admin** — desktop app for creating job orders (polygon or location code), assigning surveyors, setting due dates, and configuring the dynamic surveyor form.
- **Mobile Surveyor App (Capacitor → Android/iOS)** — same React app wrapped natively, map-first with bottom-sheet tagging.

## Visual Direction (Locked)

Mantine-inspired **Precision GIS utility** (chosen direction v3):

- Tokens: `--color-primary: #228be6`, neutral grays (`#f8f9fa` bg, `#dee2e6` borders, `#212529` text, `#868e96` muted), white surfaces.
- Type: Inter (UI), JetBrains Mono (IDs, codes, coordinates).
- Radius: `md` (6px). Subtle borders + small shadows, no heavy elevation.
- Components feel like Mantine: AppShell, Table, Card, Badge, SegmentedControl, NumberInput, MultiSelect, Drawer, Notification.
- Motion: bottom-sheet slide-up, soft fade on parcel-count updates, progress fills. Nothing flashy.

Composition we'll port verbatim from the mockup:
- Surveyor screen = full-bleed map + floating zoom/locate buttons (top-right) + parcel tooltip card + overdue chip overlay + bottom-sheet tagging form + 3-tab bottom nav (Job Orders / Explorer / Profile).
- Dispatcher = list-left / map-right split with Mantine-style table.
- Admin Field Config = config list left / live preview right with drag handles.

## Core Rules

- One parcel → many farmers; one farmer → many parcels.
- Each tag carries a **tenure status** (Owner, Tenant, Leaseholder, Tiller, Caretaker, Other — admin-editable).
- Surveyor can only tag parcels inside their assigned job-order area.
- Farmer identifier: **RSBSA ID** primary, **name search** fallback.
- Every job order has an **estimated completion / due date**; overdue jobs flagged in both surfaces.
- Surveyor tagging form = fixed core fields + **admin-defined custom fields** rendered at runtime.

## Roles

| Role | Capabilities |
|---|---|
| Admin | Users, roles, tenure types, parcel API config, **field configuration**, farmer master |
| Dispatcher | Create/assign job orders, due dates, monitor progress |
| Surveyor | View assigned jobs, map, tag farmer↔parcel with tenure + custom fields, optional photo |
| Farmer viewer | Read-only list/map of own parcels |

Auth: Lovable Cloud email/password + Google. Roles in `user_roles` with `has_role()` security-definer fn.

## Mobile Surveyor (Capacitor)

- Same React app, wrapped with **Capacitor** for Android (APK/AAB) and iOS.
- Native plugins: Geolocation (locate me FAB), Camera (photo evidence per tag), Network status (synced indicator), Preferences/Filesystem (cache job data), Push (later).
- `/app/*` routes are mobile-first; render full-screen in the native shell. Dispatcher/Admin routes stay web-only.
- Build: `npx cap add android|ios` → `npx cap sync` after each web build. README documents the local/CI build.
- Works as a responsive PWA in-browser for testing until native is built.

## Dynamic Field Configuration

Admin defines extra fields the surveyor fills. Stored in DB; form renders from config at runtime.

**`field_definitions`** — `id, key, label, help_text, field_type (text|number|date|boolean|single_select|multi_select|photo|gps), options jsonb, required, min, max, regex, scope (farmer_parcel_tag for v1), applies_to_tenure[], display_order, active, created_by, timestamps`.

**Storage**: tag rows carry `custom_values jsonb` keyed by `field_definitions.key`. Server-side validator re-checks values against active definitions on insert/update.

**Admin UI**: drag-to-reorder list + add/edit modal + live preview pane mirroring the surveyor's tagging sheet.

**Surveyor UI**: tagging bottom-sheet renders core fields (farmer, tenure) then dynamically maps each active definition to the right control with validation messages.

## Data Model (Lovable Cloud / Postgres)

- `profiles` (id → auth.users, full_name, contact)
- `user_roles` (user_id, role)
- `tenure_types` (code, label, active)
- `farmers` (id, rsbsa_id unique, full_name, birthdate, address, contact)
- `parcels` (id, external_parcel_id, location_code, barangay, municipality, province, area_sqm, geometry_geojson, source, last_synced_at)
- `job_orders` (id, code, title, dispatcher_id, surveyor_id, status, area_geometry_geojson, location_code, parcel_count, **due_date date**, **estimated_completion_at timestamptz**, completed_at, created_at)
- `job_order_parcels` (job_order_id, parcel_id)
- `field_definitions` (above)
- `farmer_parcel_tags` (id, farmer_id, parcel_id, tenure_code, job_order_id, tagged_by, tagged_at, lat, lng, notes, **custom_values jsonb**) — UNIQUE (farmer_id, parcel_id, tenure_code)
- `tag_photos` (id, tag_id, storage_path, field_key)
- `audit_log` (actor, action, entity, entity_id, payload, at)

RLS + explicit `GRANT`s on every table. Surveyor write-policies scoped via `job_order_parcels` membership through a security-definer fn. Field definitions readable by all authenticated users, writable by admin only.

## External Parcel API

Server-side adapter (`createServerFn`):
- `fetchParcelsInBoundingBox(geojson)`
- `fetchParcelByLocationCode(code)`

On job-order creation, returned parcels upsert into `parcels` and link via `job_order_parcels`; dispatcher sees live count before saving. Secrets: `PARCEL_API_BASE_URL`, `PARCEL_API_KEY`. Ships with a **stub** returning seeded sample parcels.

## Maps (Google Maps Platform connector)

- Dispatcher: Maps JS API + Drawing library for polygons; geocoding via gateway for location-code lookup; live parcel-count badge.
- Surveyor: Maps JS API rendering area + parcels color-coded (untagged / partial / full); tap → tagging sheet; "Locate me" via Capacitor Geolocation.

## Helpful Extras Baked In

- **Overdue badges** + sort-by-due-date everywhere.
- **Sync indicator** (Synced / Pending / Offline) in surveyor app header.
- **Parcel tooltip card** on map hover/tap with ID, status chip, last tag time.
- **Audit/activity timeline** per job order (who tagged what, when).
- **Photo evidence thumbnails** in the tagging sheet (3-up grid, "+ Add Photo").
- **CSV export** of tags per job order (dispatcher).
- **Search/filter bar** for job orders (status, surveyor, region, due window).
- **Surveyor avatars + initials** on dispatcher table.
- **Draft tag**: save in-progress tagging without submitting.

## Phased Build

1. **Foundation** — Enable Lovable Cloud, link Google Maps connector, install Mantine-aligned theme tokens, auth + roles + route guards (`_authenticated`, role-gated layouts), full schema with RLS + grants.
2. **Dispatcher** — Job-order list (split with map), create flow (polygon/location-code + due date), parcel adapter (stub), assignment.
3. **Admin Field Configuration** — CRUD UI with drag-reorder + live preview, server-side validator enforcing definitions.
4. **Surveyor App** — Mobile-first routes (map + bottom sheet + bottom nav per chosen mockup), farmer search, dynamic field renderer, photo capture; wrap with **Capacitor** (Android first, iOS optional).
5. **Admin & Read-only extras** — Tenure types editor, user/role admin, farmer CSV import, farmer-viewer screens.
6. **Polish** — Audit log UI, CSV exports, dashboards, overdue notifications. (Later: offline tagging queue, push.)

## Technical Notes

- Stack: TanStack Start, Lovable Cloud (Supabase), Google Maps connector, Tailwind, shadcn/ui (themed to match Mantine tokens), Capacitor.
- Geometry as GeoJSON `jsonb`; spatial intersection delegated to external API (no PostGIS in Worker).
- `custom_values jsonb` validated server-side against active `field_definitions`.
- Capacitor build runs locally / in CI; Lovable hosts the web layer.

## Open Questions (non-blocking — defaults assumed)

1. External parcel API spec — using stub until provided.
2. Surveyor "create new farmer on the spot" — defaulting to search-only with an admin-approval flag.
3. Tenure types — seeding Owner, Tenant, Leaseholder, Tiller, Caretaker, Other.
4. Capacitor app id — defaulting to `ph.gov.da.surveyor`, Android first.
5. Offline tagging — deferred to post-v1.
