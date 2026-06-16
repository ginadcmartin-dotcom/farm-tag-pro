import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Search, Plus, Minus, Navigation, Camera,
  Clock, AlertTriangle, Map as MapIcon, User, ChevronRight, X,
  CheckSquare, Layers, Users, Phone, MapPin, Sprout, CheckCircle2,
  FileText, RefreshCw, ChevronLeft, Pin, ListChecks,
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

type View = "jobs" | "map" | "farmers" | "profile";
type StartMode = "parcel" | "farmer";

const ASSIGNED_JOBS = [
  { id: "1", code: "JOB-2026-081", title: "San Isidro Rice Sector B", parcels: 175, tagged: 154, due: "Jun 12", overdue: true },
  { id: "2", code: "JOB-2026-082", title: "Pampanga Central", parcels: 242, tagged: 109, due: "Jun 22", overdue: false },
  { id: "5", code: "JOB-2026-085", title: "Zambales Coastal Block", parcels: 64, tagged: 31, due: "Jul 02", overdue: false },
];

type Farmer = {
  id: string;
  rsbsa: string;
  name: string;
  initials: string;
  sex: "M" | "F";
  age: number;
  barangay: string;
  contact: string;
  parcels: number;
  totalHa: number;
  primaryCrop: string;
  status: "verified" | "pending" | "new";
  lastTagged: string;
};

const SYNCED_FARMERS: Farmer[] = [
  { id: "f1", rsbsa: "03-14-02-001-4421", name: "Marcelo, Juan P.", initials: "JM", sex: "M", age: 52, barangay: "San Isidro", contact: "0917-555-0142", parcels: 2, totalHa: 3.40, primaryCrop: "Rice (Inbred)", status: "verified", lastTagged: "Jun 14" },
  { id: "f2", rsbsa: "03-14-02-001-4502", name: "Santos, Maria L.", initials: "MS", sex: "F", age: 47, barangay: "San Isidro", contact: "0928-555-0118", parcels: 1, totalHa: 1.80, primaryCrop: "Rice (Hybrid)", status: "verified", lastTagged: "Jun 11" },
  { id: "f3", rsbsa: "03-14-02-001-4733", name: "Reyes, Pedro A.", initials: "PR", sex: "M", age: 61, barangay: "Sta. Rita", contact: "0915-555-0099", parcels: 3, totalHa: 5.10, primaryCrop: "Corn", status: "pending", lastTagged: "Jun 09" },
  { id: "f4", rsbsa: "03-14-02-001-4810", name: "Cruz, Ana B.", initials: "AC", sex: "F", age: 39, barangay: "San Isidro", contact: "0906-555-0033", parcels: 0, totalHa: 0, primaryCrop: "—", status: "new", lastTagged: "—" },
  { id: "f5", rsbsa: "03-14-02-001-4877", name: "Dela Peña, Roberto", initials: "RD", sex: "M", age: 55, barangay: "Bagumbayan", contact: "0921-555-0421", parcels: 2, totalHa: 2.65, primaryCrop: "Rice (Inbred)", status: "verified", lastTagged: "Jun 13" },
];

function SurveyorApp() {
  const [view, setView] = useState<View>("map");
  const [sheetOpen, setSheetOpen] = useState(true);
  const [activeParcel, setActiveParcel] = useState("PH-IVA-0922");
  const [multi, setMulti] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [startMode, setStartMode] = useState<StartMode | null>(null);
  const [startSheet, setStartSheet] = useState(true);
  const [activeFarmer, setActiveFarmer] = useState<Farmer | null>(null);

  function handleParcel(id: string) {
    if (startMode === "farmer" && activeFarmer) {
      // pin parcel to active farmer flow → multi-select feel
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
      setSheetOpen(true);
      return;
    }
    if (multi) {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
      setSheetOpen(true);
    } else {
      setActiveParcel(id);
      setSheetOpen(true);
    }
  }

  function toggleMulti() {
    setMulti((m) => {
      const next = !m;
      if (!next) setSelected([]);
      else setSelected([activeParcel]);
      return next;
    });
    setSheetOpen(true);
  }

  function pickStart(mode: StartMode) {
    setStartMode(mode);
    setStartSheet(false);
    if (mode === "farmer") {
      setView("farmers");
    } else {
      setView("map");
    }
  }

  function chooseFarmerForFlow(f: Farmer) {
    setActiveFarmer(f);
    setView("map");
    setSelected([]);
    setSheetOpen(false);
  }

  return (
    <div className="min-h-screen bg-[oklch(0.92_0.01_140)] py-6">
      <div
        className="mx-auto flex w-full max-w-[400px] flex-col overflow-hidden rounded-[36px] border-[6px] border-slate-900 bg-background shadow-2xl"
        style={{ height: "min(840px, calc(100vh - 48px))" }}
      >
        <AppHeader multi={multi} onToggleMulti={toggleMulti} selectedCount={selected.length} startMode={startMode} />

        {/* Start mode banner (active farmer pinned for tagging) */}
        {startMode === "farmer" && activeFarmer && view === "map" && (
          <ActiveFarmerStrip
            farmer={activeFarmer}
            selectedCount={selected.length}
            onChange={() => setView("farmers")}
            onClear={() => { setActiveFarmer(null); setSelected([]); setStartMode(null); setStartSheet(true); }}
          />
        )}

        {view === "map" && (
          <MapView
            sheetOpen={sheetOpen}
            onParcelSelect={handleParcel}
            activeParcel={activeParcel}
            selected={selected}
            multi={multi || (startMode === "farmer" && !!activeFarmer)}
            farmerFlow={startMode === "farmer" && !!activeFarmer ? activeFarmer : null}
            onCloseSheet={() => setSheetOpen(false)}
            onOpenSheet={() => setSheetOpen(true)}
            onClearSelection={() => setSelected([])}
          />
        )}
        {view === "jobs" && <JobsView onOpenMap={() => setView("map")} />}
        {view === "farmers" && (
          <FarmersView
            onOpenProfile={(f) => setActiveFarmer(f)}
            activeFarmer={activeFarmer}
            onStartTaggingForFarmer={chooseFarmerForFlow}
            onBack={() => setActiveFarmer(null)}
          />
        )}
        {view === "profile" && <ProfileView />}

        <BottomNav view={view} setView={setView} />

        {/* Start-mode chooser */}
        {startSheet && !startMode && <StartModeSheet onPick={pickStart} onSkip={() => setStartSheet(false)} />}
      </div>

      <div className="mx-auto mt-4 max-w-[400px] text-center">
        <Link to="/" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" /> Back to mockup hub
        </Link>
      </div>
    </div>
  );
}

/* ============================= MD3 Header ============================= */

function AppHeader({ multi, onToggleMulti, selectedCount, startMode }: { multi: boolean; onToggleMulti: () => void; selectedCount: number; startMode: StartMode | null }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-2xl bg-primary shadow-sm">
          <Sprout className="size-4 text-primary-foreground" />
        </div>
        <div>
          <div className="text-[15px] font-semibold leading-tight tracking-tight">AgriTag</div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            JOB-2026-081 {startMode && `· ${startMode === "farmer" ? "Farmer-first" : "Parcel-first"}`}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleMulti}
          className={`inline-flex h-8 items-center gap-1 rounded-full border px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            multi
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-3" />
          {multi ? `${selectedCount}` : "Multi"}
        </button>
        <div className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5">
          <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Synced</span>
        </div>
      </div>
    </header>
  );
}

/* ============================ Start mode sheet ============================ */

function StartModeSheet({ onPick, onSkip }: { onPick: (m: StartMode) => void; onSkip: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/30 backdrop-blur-sm">
      <div className="w-full rounded-t-[28px] border-t border-border bg-card p-5 shadow-2xl">
        <div className="mx-auto h-1 w-10 rounded-full bg-border" />
        <div className="mt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Quick start</div>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight">How do you want to tag?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick the flow that matches what's in front of you in the field.
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          <button
            onClick={() => onPick("parcel")}
            className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
              <MapIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Start with a parcel</div>
              <div className="text-[11px] text-muted-foreground">Walk the map, tap a lot, then assign farmer(s).</div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
          </button>
          <button
            onClick={() => onPick("farmer")}
            className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
              <Users className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Start with a farmer</div>
              <div className="text-[11px] text-muted-foreground">Pick from synced list, then pin their parcels on the map.</div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
          </button>
        </div>

        <button onClick={onSkip} className="mt-3 w-full rounded-full py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          Skip — I'll choose later
        </button>
      </div>
    </div>
  );
}

/* ============================ Active farmer strip ============================ */

function ActiveFarmerStrip({ farmer, selectedCount, onChange, onClear }: { farmer: Farmer; selectedCount: number; onChange: () => void; onClear: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 border-b border-primary/20 bg-primary/8 px-3 py-2">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
        {farmer.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Pin className="size-3 text-primary" />
          <div className="truncate text-xs font-semibold text-foreground">{farmer.name}</div>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} parcels pinned` : "Tap parcels to pin"}
        </div>
      </div>
      <button onClick={onChange} className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
        Change
      </button>
      <button onClick={onClear} className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/* ================================= Map ================================== */

function MapView({
  sheetOpen, onParcelSelect, activeParcel, selected, multi, farmerFlow, onCloseSheet, onOpenSheet, onClearSelection,
}: {
  sheetOpen: boolean;
  onParcelSelect: (id: string) => void;
  activeParcel: string;
  selected: string[];
  multi: boolean;
  farmerFlow: Farmer | null;
  onCloseSheet: () => void;
  onOpenSheet: () => void;
  onClearSelection: () => void;
}) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <MockMap
        parcels={SAMPLE_PARCELS}
        area={SAMPLE_AREA}
        className="absolute inset-0"
        highlightId={multi ? undefined : activeParcel}
        selectedIds={multi ? selected : undefined}
        onParcelClick={onParcelSelect}
      />

      {/* Status chip top-left */}
      {multi ? (
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 shadow-sm backdrop-blur">
          <CheckSquare className="size-3.5 text-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
            {selected.length} parcels {farmerFlow ? "pinned" : "selected"}
          </span>
          <button onClick={onClearSelection} className="ml-1 text-[10px] font-medium text-primary/80 hover:text-primary">
            Clear
          </button>
        </div>
      ) : (
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/95 px-3 py-1.5 shadow-sm backdrop-blur">
          <AlertTriangle className="size-3 text-red-700" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-red-700">3 overdue</span>
        </div>
      )}

      {!multi && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2 rounded-2xl border border-border bg-card/95 px-3 py-2 shadow-md backdrop-blur">
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Parcel</div>
          <div className="text-xs font-semibold">{activeParcel}</div>
          <div className="mt-0.5 flex items-center gap-1">
            <div className="size-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">Partial · 1 farmer tagged</span>
          </div>
        </div>
      )}

      {/* MD3 zoom/locate stack */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button className="grid size-10 place-items-center rounded-2xl border border-border bg-card shadow-md">
          <Plus className="size-4" />
        </button>
        <button className="grid size-10 place-items-center rounded-2xl border border-border bg-card shadow-md">
          <Minus className="size-4" />
        </button>
        <button className="mt-1 grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Navigation className="size-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-3 flex gap-2 rounded-full border border-border bg-card/95 px-3 py-1.5 shadow-md backdrop-blur">
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

      {/* Extended FAB (MD3) */}
      {!sheetOpen && (
        <button
          onClick={onOpenSheet}
          className="absolute bottom-4 right-3 flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-lg"
        >
          <Plus className="size-4" /> {multi ? `Tag ${selected.length} parcels` : "Tag parcel"}
        </button>
      )}

      {sheetOpen && (
        farmerFlow
          ? <FarmerFlowSheet farmer={farmerFlow} parcelIds={selected} onClose={onCloseSheet} />
          : multi
            ? <MultiTaggingSheet parcelIds={selected} onClose={onCloseSheet} />
            : <TaggingSheet parcelId={activeParcel} onClose={onCloseSheet} />
      )}
    </div>
  );
}

/* ============================ Farmer-flow sheet ============================ */

function FarmerFlowSheet({ farmer, parcelIds, onClose }: { farmer: Farmer; parcelIds: string[]; onClose: () => void }) {
  const count = parcelIds.length;
  return (
    <div className="absolute inset-x-0 bottom-0 flex max-h-[82%] flex-col rounded-t-[28px] border-t border-border bg-card shadow-2xl">
      <SheetHandle onClose={onClose} />
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Farmer-first tagging</div>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight">Pin parcels to {farmer.name.split(",")[0]}</h2>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">{count} pinned</span>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-secondary/60 px-3 py-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {farmer.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{farmer.name}</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">RSBSA {farmer.rsbsa}</div>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-700">
            {farmer.status}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
        {count === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-3 py-6 text-center text-xs text-muted-foreground">
            Tap parcels on the map to pin them to this farmer.
          </div>
        ) : (
          <div>
            <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pinned parcels
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parcelIds.map((p) => (
                <span key={p} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 font-mono text-[10px] text-primary">
                  <Pin className="size-2.5" /> {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <Field label="Tenure status *">
          <div className="grid grid-cols-3 gap-1.5">
            {["Owner", "Tenant", "Leaseholder", "Tiller", "Caretaker", "Other"].map((t, i) => (
              <button
                key={t}
                className={`rounded-full border px-2 py-1.5 text-xs font-medium ${
                  i === 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Primary crop *">
          <select className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
            <option>Rice (Inbred)</option>
            <option>Rice (Hybrid)</option>
            <option>Corn</option>
          </select>
        </Field>

        <div className="rounded-2xl border border-border bg-secondary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="text-foreground">Will create {count} tag{count === 1 ? "" : "s"}</span> · single farmer · audited as one batch
        </div>
      </div>

      <SheetActions primaryLabel={`Save ${count} tag${count === 1 ? "" : "s"}`} disabled={count === 0} />
    </div>
  );
}

/* ============================ Multi & single sheets ============================ */

function MultiTaggingSheet({ parcelIds, onClose }: { parcelIds: string[]; onClose: () => void }) {
  const [applyTenureAll, setApplyTenureAll] = useState(true);
  const [applyCropAll, setApplyCropAll] = useState(true);
  const count = parcelIds.length;
  return (
    <div className="absolute inset-x-0 bottom-0 flex max-h-[82%] flex-col rounded-t-[28px] border-t border-border bg-card shadow-2xl">
      <SheetHandle onClose={onClose} />
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Multi-parcel tag</div>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight">Tag one farmer to {count} parcels</h2>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">{count} sel</span>
        </div>
        {count > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {parcelIds.slice(0, 6).map((p) => (
              <span key={p} className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[9px] text-muted-foreground">{p}</span>
            ))}
            {parcelIds.length > 6 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] text-muted-foreground">+{parcelIds.length - 6}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
        {count === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-3 py-6 text-center text-xs text-muted-foreground">
            Tap parcels on the map to add them to this batch.
          </div>
        )}

        <Field label="Farmer (RSBSA ID or name)">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              defaultValue="MARCELO, JUAN P."
              className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>RSBSA: 03-14-02-001-4421</span>
            <span className="text-primary">2 prior parcels</span>
          </div>
        </Field>

        <div>
          <ApplyToggle label="Tenure status *" all={applyTenureAll} onChange={setApplyTenureAll} />
          {applyTenureAll ? (
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {["Owner", "Tenant", "Leaseholder", "Tiller", "Caretaker", "Other"].map((t, i) => (
                <button
                  key={t}
                  className={`rounded-full border px-2 py-1.5 text-xs font-medium ${
                    i === 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-1.5 rounded-2xl border border-dashed border-border bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
              You'll set tenure per parcel on the next step.
            </div>
          )}
        </div>

        <div>
          <ApplyToggle label="Crop type *" all={applyCropAll} onChange={setApplyCropAll} />
          {applyCropAll ? (
            <select className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
              <option>Rice (Inbred)</option>
              <option>Rice (Hybrid)</option>
              <option>Corn</option>
            </select>
          ) : (
            <div className="mt-1.5 rounded-2xl border border-dashed border-border bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
              You'll set crop type per parcel on the next step.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-secondary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="text-foreground">Will create {count} tag{count === 1 ? "" : "s"}</span> · single farmer · audited as one batch
        </div>
      </div>

      <SheetActions primaryLabel={`Save ${count} tag${count === 1 ? "" : "s"}`} disabled={count === 0} />
    </div>
  );
}

function ApplyToggle({ label, all, onChange }: { label: string; all: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="inline-flex rounded-full border border-border bg-secondary p-0.5 text-[10px]">
        <button
          onClick={() => onChange(true)}
          className={`rounded-full px-2.5 py-0.5 font-mono font-semibold uppercase tracking-wider ${all ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          All
        </button>
        <button
          onClick={() => onChange(false)}
          className={`rounded-full px-2.5 py-0.5 font-mono font-semibold uppercase tracking-wider ${!all ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Per parcel
        </button>
      </div>
    </div>
  );
}

function TaggingSheet({ parcelId, onClose }: { parcelId: string; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex max-h-[80%] flex-col rounded-t-[28px] border-t border-border bg-card shadow-2xl">
      <SheetHandle onClose={onClose} />
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{parcelId}</div>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight">Tag farmer details</h2>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-700">Partial</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
        <Field label="Farmer (RSBSA ID or name)">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              defaultValue="MARCELO, JUAN P."
              className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>RSBSA: 03-14-02-001-4421</span>
            <span className="text-primary">2 prior parcels</span>
          </div>
        </Field>

        <Field label="Tenure status *">
          <div className="grid grid-cols-3 gap-1.5">
            {["Owner", "Tenant", "Leaseholder", "Tiller", "Caretaker", "Other"].map((t, i) => (
              <button
                key={t}
                className={`rounded-full border px-2 py-1.5 text-xs font-medium ${
                  i === 1 ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Crop type *">
            <select className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
              <option>Rice (Inbred)</option>
              <option>Rice (Hybrid)</option>
              <option>Corn</option>
            </select>
          </Field>
          <Field label="Tilled area (ha) *">
            <input
              type="number"
              defaultValue="1.25"
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-mono text-sm"
            />
          </Field>
        </div>

        <Field label="Irrigation source">
          <select className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
            <option>NIA</option>
            <option>Communal</option>
            <option>Deepwell</option>
            <option>Rainfed</option>
          </select>
        </Field>

        <Field label="Parcel boundary photo *">
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-100 via-amber-50 to-emerald-200" />
            <button className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border text-muted-foreground">
              <Camera className="size-4" />
              <span className="font-mono text-[9px] uppercase tracking-wider">Add</span>
            </button>
          </div>
        </Field>

        <div className="rounded-2xl border border-border bg-secondary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="text-foreground">GPS auto-captured</span> · 15.0314°N · 120.6820°E
        </div>
      </div>

      <SheetActions primaryLabel="Save tag" />
    </div>
  );
}

/* ============================ Shared sheet bits ============================ */

function SheetHandle({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative flex items-center justify-center px-4 pt-3 pb-2">
      <div className="h-1 w-10 rounded-full bg-border" />
      <button onClick={onClose} className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
        <X className="size-4" />
      </button>
    </div>
  );
}

function SheetActions({ primaryLabel, disabled }: { primaryLabel: string; disabled?: boolean }) {
  return (
    <div className="flex shrink-0 gap-2 border-t border-border bg-card px-5 py-3">
      <button className="h-11 flex-1 rounded-full border border-border bg-secondary text-sm font-medium hover:bg-accent">
        Save draft
      </button>
      <button
        disabled={disabled}
        className="h-11 flex-[2] rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
      >
        {primaryLabel}
      </button>
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

/* ================================ Jobs ================================ */

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
              className="block w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{j.code}</div>
                  <div className="mt-0.5 truncate text-sm font-semibold">{j.title}</div>
                </div>
                {j.overdue ? (
                  <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-700">Overdue</span>
                ) : (
                  <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700">Active</span>
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

/* =============================== Farmers =============================== */

function FarmersView({
  onOpenProfile, activeFarmer, onStartTaggingForFarmer, onBack,
}: {
  onOpenProfile: (f: Farmer) => void;
  activeFarmer: Farmer | null;
  onStartTaggingForFarmer: (f: Farmer) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "new">("all");

  if (activeFarmer) {
    return <FarmerProfile farmer={activeFarmer} onBack={onBack} onStartTagging={() => onStartTaggingForFarmer(activeFarmer)} />;
  }

  const list = SYNCED_FARMERS.filter(f =>
    (filter === "all" || f.status === filter) &&
    (q === "" || f.name.toLowerCase().includes(q.toLowerCase()) || f.rsbsa.includes(q))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Farmers</h1>
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <RefreshCw className="size-2.5" />
              <span>Synced 14 min ago · {SYNCED_FARMERS.length} records</span>
            </div>
          </div>
          <button className="grid size-9 place-items-center rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground">
            <RefreshCw className="size-4" />
          </button>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search RSBSA or name…"
            className="h-11 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
          {([
            { k: "all", l: `All ${SYNCED_FARMERS.length}` },
            { k: "verified", l: "Verified" },
            { k: "pending", l: "Pending" },
            { k: "new", l: "New" },
          ] as const).map((c) => (
            <button
              key={c.k}
              onClick={() => setFilter(c.k)}
              className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                filter === c.k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-muted-foreground"
              }`}
            >
              {c.l}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2 px-4 py-3">
        {list.map((f) => (
          <li key={f.id}>
            <button
              onClick={() => onOpenProfile(f)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-[12px] font-semibold text-primary">
                {f.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="truncate text-sm font-semibold">{f.name}</div>
                  <StatusDot status={f.status} />
                </div>
                <div className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  RSBSA {f.rsbsa}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5"><MapPin className="size-3" /> {f.barangay}</span>
                  <span>·</span>
                  <span>{f.parcels} parcels</span>
                  <span>·</span>
                  <span>{f.totalHa.toFixed(2)} ha</span>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-secondary/40 px-3 py-8 text-center text-xs text-muted-foreground">
            No farmers match this filter.
          </li>
        )}
      </ul>
    </div>
  );
}

function StatusDot({ status }: { status: Farmer["status"] }) {
  const m = {
    verified: { c: "bg-emerald-500", l: "Verified" },
    pending: { c: "bg-amber-500", l: "Pending" },
    new: { c: "bg-blue-500", l: "New" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
      <span className={`size-1.5 rounded-full ${m.c}`} /> {m.l}
    </span>
  );
}

function FarmerProfile({ farmer, onBack, onStartTagging }: { farmer: Farmer; onBack: () => void; onStartTagging: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary to-[oklch(0.45_0.13_148)] px-4 pb-12 pt-4 text-primary-foreground">
        <button onClick={onBack} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur">
          <ChevronLeft className="size-3" /> Farmers
        </button>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid size-16 place-items-center rounded-3xl bg-white/20 text-lg font-semibold backdrop-blur">
            {farmer.initials}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold tracking-tight">{farmer.name}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider opacity-80">RSBSA {farmer.rsbsa}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider backdrop-blur">
              <CheckCircle2 className="size-2.5" /> {farmer.status}
            </div>
          </div>
        </div>
      </div>

      {/* Stat row (overlap) */}
      <div className="-mt-8 px-4">
        <div className="grid grid-cols-3 overflow-hidden rounded-3xl border border-border bg-card shadow-md">
          {[
            { l: "Parcels", v: farmer.parcels.toString() },
            { l: "Total ha", v: farmer.totalHa.toFixed(2) },
            { l: "Last tag", v: farmer.lastTagged },
          ].map((s, i) => (
            <div key={s.l} className={`px-3 py-3 text-center ${i < 2 ? "border-r border-border" : ""}`}>
              <div className="text-base font-semibold">{s.v}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick action */}
      <div className="px-4 pt-4">
        <button
          onClick={onStartTagging}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          <Pin className="size-4" /> Start tagging for this farmer
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-secondary py-2.5 text-xs font-medium">
            <Phone className="size-3.5" /> Call
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-secondary py-2.5 text-xs font-medium">
            <FileText className="size-3.5" /> RSBSA form
          </button>
        </div>
      </div>

      {/* Personal info */}
      <div className="mt-4 px-4">
        <SectionTitle>Personal info</SectionTitle>
        <div className="rounded-2xl border border-border bg-card">
          <InfoRow label="Sex / Age" value={`${farmer.sex} · ${farmer.age} yrs`} />
          <InfoRow label="Barangay" value={farmer.barangay} />
          <InfoRow label="Contact" value={farmer.contact} />
          <InfoRow label="Primary crop" value={farmer.primaryCrop} last />
        </div>
      </div>

      {/* Tagged parcels */}
      <div className="mt-4 px-4 pb-6">
        <SectionTitle>
          <span className="flex items-center gap-1.5">
            <ListChecks className="size-3.5" /> Tagged parcels
          </span>
        </SectionTitle>
        {farmer.parcels === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-3 py-6 text-center text-xs text-muted-foreground">
            No parcels tagged yet. Start tagging to pin this farmer to a lot.
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: farmer.parcels }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Sprout className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[11px] font-semibold">PH-IVA-{(918 + i).toString().padStart(4, "0")}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {farmer.primaryCrop} · {(farmer.totalHa / farmer.parcels).toFixed(2)} ha · Owner
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 ${last ? "" : "border-b border-border"}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

/* ================================ Profile ================================ */

function ProfileView() {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="bg-card px-4 py-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary">JD</div>
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

/* ============================== Bottom Nav (MD3) ============================== */

function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: { id: View; label: string; icon: typeof MapIcon }[] = [
    { id: "jobs", label: "Jobs", icon: Clock },
    { id: "map", label: "Map", icon: MapIcon },
    { id: "farmers", label: "Farmers", icon: Users },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="flex h-[72px] shrink-0 items-end justify-around border-t border-border bg-card pb-2 pt-1.5">
      {items.map((it) => {
        const active = view === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={`grid h-8 w-16 place-items-center rounded-full transition-colors ${
                active ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}
            >
              <it.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
            </span>
            <span className={`text-[10px] ${active ? "font-semibold text-primary" : "text-muted-foreground"}`}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
