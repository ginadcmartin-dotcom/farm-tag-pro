import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Search, Plus, Minus, Navigation, Camera,
  Clock, AlertTriangle, Map as MapIcon, User, ChevronRight, X,
} from "lucide-react";
import { MockMap, SAMPLE_PARCELS, SAMPLE_AREA } from "@/components/agritag/MockMap";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Surveyor App · AgriTag" },
      { name: "description", content: "Field surveyor mobile app — tag farmers to parcels." },
    ],
  }),
  component: SurveyorApp,
});

type View = "jobs" | "map" | "profile";

const ASSIGNED_JOBS = [
  { id: "1", code: "JOB-2026-081", title: "San Isidro Rice Sector B", parcels: 175, tagged: 154, due: "Jun 12", overdue: true },
  { id: "2", code: "JOB-2026-082", title: "Pampanga Central", parcels: 242, tagged: 109, due: "Jun 22", overdue: false },
  { id: "5", code: "JOB-2026-085", title: "Zambales Coastal Block", parcels: 64, tagged: 31, due: "Jul 02", overdue: false },
];

function SurveyorApp() {
  const [view, setView] = useState<View>("map");
  const [sheetOpen, setSheetOpen] = useState(true);
  const [activeParcel, setActiveParcel] = useState("PH-IVA-0922");

  return (
    <div className="min-h-screen bg-slate-200 py-6">
      {/* Phone frame */}
      <div className="mx-auto flex w-full max-w-[400px] flex-col overflow-hidden rounded-[28px] border-4 border-slate-800 bg-background shadow-2xl" style={{ height: "min(820px, calc(100vh - 48px))" }}>
        <AppHeader />
        {view === "map" && (
          <MapView
            sheetOpen={sheetOpen}
            onParcelSelect={(id) => { setActiveParcel(id); setSheetOpen(true); }}
            activeParcel={activeParcel}
            onCloseSheet={() => setSheetOpen(false)}
            onOpenSheet={() => setSheetOpen(true)}
          />
        )}
        {view === "jobs" && <JobsView onOpenMap={() => setView("map")} />}
        {view === "profile" && <ProfileView />}
        <BottomNav view={view} setView={setView} />
      </div>

      <div className="mx-auto mt-4 max-w-[400px] text-center">
        <Link to="/" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" /> Back to mockup hub
        </Link>
      </div>
    </div>
  );
}

function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2.5">
        <div className="grid size-7 place-items-center rounded-md bg-primary">
          <div className="size-3 rounded-[2px] bg-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">AgriTag Surveyor</div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">JOB-2026-081 · J. Dela Cruz</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-1">
        <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Synced</span>
      </div>
    </header>
  );
}

function MapView({
  sheetOpen, onParcelSelect, activeParcel, onCloseSheet, onOpenSheet,
}: {
  sheetOpen: boolean;
  onParcelSelect: (id: string) => void;
  activeParcel: string;
  onCloseSheet: () => void;
  onOpenSheet: () => void;
}) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <MockMap
        parcels={SAMPLE_PARCELS}
        area={SAMPLE_AREA}
        className="absolute inset-0"
        highlightId={activeParcel}
        onParcelClick={onParcelSelect}
      />

      {/* Overdue chip */}
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/95 px-2.5 py-1 shadow-sm backdrop-blur">
        <AlertTriangle className="size-3 text-red-700" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-red-700">Overdue · 3 parcels left</span>
      </div>

      {/* Parcel tooltip */}
      <div className="absolute left-1/2 top-20 -translate-x-1/2 rounded-md border border-border bg-card/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
        <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Parcel</div>
        <div className="text-xs font-semibold">{activeParcel}</div>
        <div className="mt-0.5 flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] text-muted-foreground">Partial · 1 farmer tagged</span>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button className="grid size-9 place-items-center rounded-md border border-border bg-card shadow-sm">
          <Plus className="size-4" />
        </button>
        <button className="grid size-9 place-items-center rounded-md border border-border bg-card shadow-sm">
          <Minus className="size-4" />
        </button>
        <button className="mt-1 grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Navigation className="size-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-3 flex gap-2 rounded-md border border-border bg-card/95 px-2 py-1.5 shadow-sm backdrop-blur">
        {[
          { c: "bg-emerald-500", l: "Tagged" },
          { c: "bg-amber-500", l: "Partial" },
          { c: "bg-slate-400", l: "Open" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-1">
            <div className={`size-2 rounded-sm ${x.c}`} />
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{x.l}</span>
          </div>
        ))}
      </div>

      {!sheetOpen && (
        <button
          onClick={onOpenSheet}
          className="absolute bottom-4 right-3 flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md"
        >
          <Plus className="size-3.5" /> Tag parcel
        </button>
      )}

      {sheetOpen && <TaggingSheet parcelId={activeParcel} onClose={onCloseSheet} />}
    </div>
  );
}

function TaggingSheet({ parcelId, onClose }: { parcelId: string; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex max-h-[80%] flex-col rounded-t-xl border-t border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="mx-auto h-1 w-10 rounded-full bg-border" />
        <button onClick={onClose} className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
          <X className="size-4" />
        </button>
      </div>
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{parcelId}</div>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight">Tag farmer details</h2>
          </div>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-700">Partial</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
        {/* Farmer search */}
        <Field label="Farmer (RSBSA ID or name)">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              defaultValue="MARCELO, JUAN P."
              className="h-10 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>RSBSA: 03-14-02-001-4421</span>
            <span className="text-primary">2 prior parcels</span>
          </div>
        </Field>

        {/* Tenure */}
        <Field label="Tenure status *">
          <div className="grid grid-cols-3 gap-1.5">
            {["Owner", "Tenant", "Leaseholder", "Tiller", "Caretaker", "Other"].map((t, i) => (
              <button
                key={t}
                className={`rounded-md border px-2 py-1.5 text-xs font-medium ${
                  i === 1 ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        {/* Dynamic admin-configured fields */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Crop type *">
            <select className="h-10 w-full rounded-md border border-border bg-background px-2.5 text-sm">
              <option>Rice (Inbred)</option>
              <option>Rice (Hybrid)</option>
              <option>Corn</option>
            </select>
          </Field>
          <Field label="Tilled area (ha) *">
            <input
              type="number"
              defaultValue="1.25"
              className="h-10 w-full rounded-md border border-border bg-background px-2.5 font-mono text-sm"
            />
          </Field>
        </div>

        <Field label="Irrigation source">
          <select className="h-10 w-full rounded-md border border-border bg-background px-2.5 text-sm">
            <option>NIA</option>
            <option>Communal</option>
            <option>Deepwell</option>
            <option>Rainfed</option>
          </select>
        </Field>

        <Field label="Parcel boundary photo *">
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square overflow-hidden rounded-md border border-border bg-gradient-to-br from-emerald-100 via-amber-50 to-emerald-200" />
            <button className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted-foreground">
              <Camera className="size-4" />
              <span className="font-mono text-[9px] uppercase tracking-wider">Add</span>
            </button>
          </div>
        </Field>

        <div className="rounded-md border border-border bg-secondary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="text-foreground">GPS auto-captured</span> · 15.0314°N · 120.6820°E
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-border bg-card px-5 py-3">
        <button className="h-10 flex-1 rounded-md border border-border bg-secondary text-sm font-medium hover:bg-accent">
          Save draft
        </button>
        <button className="h-10 flex-[2] rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Save tag
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function JobsView({ onOpenMap }: { onOpenMap: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="px-4 pb-3 pt-4">
        <h1 className="text-lg font-semibold tracking-tight">My Job Orders</h1>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">3 assigned · sorted by due date</div>
      </div>
      <div className="space-y-2.5 px-4 pb-4">
        {ASSIGNED_JOBS.map((j) => {
          const pct = Math.round((j.tagged / j.parcels) * 100);
          return (
            <button
              key={j.id}
              onClick={onOpenMap}
              className="block w-full rounded-lg border border-border bg-card p-3 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{j.code}</div>
                  <div className="mt-0.5 truncate text-sm font-semibold">{j.title}</div>
                </div>
                {j.overdue ? (
                  <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-700">Overdue</span>
                ) : (
                  <span className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700">Active</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full ${j.overdue ? "bg-red-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{j.tagged}/{j.parcels}</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="size-3" /> Due {j.due}</span>
                <span className="flex items-center gap-0.5 text-primary">Open <ChevronRight className="size-3" /></span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="bg-card px-4 py-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">JD</div>
        <div className="mt-2.5 text-base font-semibold">Juan Dela Cruz</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Surveyor · Region III</div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-border">
        {[{ l: "Jobs", v: "3" }, { l: "Tagged today", v: "27" }, { l: "Total tags", v: "491" }].map((s) => (
          <div key={s.l} className="bg-card px-3 py-3 text-center">
            <div className="text-base font-semibold">{s.v}</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
      <ul className="mt-3 space-y-px bg-border">
        {["Cached job data", "Notifications", "Camera permissions", "Sign out"].map((l) => (
          <li key={l} className="flex items-center justify-between bg-card px-4 py-3 text-sm">
            <span>{l}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: { id: View; label: string; icon: typeof MapIcon }[] = [
    { id: "jobs", label: "Jobs", icon: Clock },
    { id: "map", label: "Map", icon: MapIcon },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="flex h-16 shrink-0 items-center justify-around border-t border-border bg-card">
      {items.map((it) => {
        const active = view === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className={`flex flex-col items-center gap-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}
          >
            <it.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
            <span className={`font-mono text-[9px] uppercase tracking-wider ${active ? "font-semibold" : ""}`}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
