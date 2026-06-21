import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Plus, Filter, Calendar, MapPin, AlertTriangle,
  CheckCircle2, Clock, ArrowLeft, Download, ChevronDown,
} from "lucide-react";
import { MockMap, SAMPLE_PARCELS, SAMPLE_AREA } from "@/components/agritag/MockMap";

export const Route = createFileRoute("/dispatcher")({
  head: () => ({
    meta: [
      { title: "Dispatcher · AgriTag" },
      { name: "description", content: "Job order dashboard for dispatchers." },
    ],
  }),
  component: DispatcherPage,
});

type Job = {
  id: string;
  code: string;
  title: string;
  region: string;
  surveyor: { name: string; initials: string; tone: string };
  parcels: number;
  tagged: number;
  due: string;
  status: "overdue" | "in_progress" | "queued" | "completed";
};

const JOBS: Job[] = [
  { id: "1", code: "JOB-2026-081", title: "San Isidro Rice Sector B", region: "Nueva Ecija · Sector 4", surveyor: { name: "Juan Dela Cruz", initials: "JD", tone: "bg-blue-100 text-blue-700" }, parcels: 175, tagged: 154, due: "Jun 12, 2026", status: "overdue" },
  { id: "2", code: "JOB-2026-082", title: "Pampanga Central Irrigation Block", region: "Pampanga · Sector 9", surveyor: { name: "Ana Mirasol", initials: "AM", tone: "bg-violet-100 text-violet-700" }, parcels: 242, tagged: 109, due: "Jun 22, 2026", status: "in_progress" },
  { id: "3", code: "JOB-2026-083", title: "Bulacan North Cluster 2", region: "Bulacan · Sector 2", surveyor: { name: "Maria Santos", initials: "MS", tone: "bg-pink-100 text-pink-700" }, parcels: 118, tagged: 0, due: "Jun 28, 2026", status: "queued" },
  { id: "4", code: "JOB-2026-084", title: "Tarlac West Aggregation", region: "Tarlac · Sector 7", surveyor: { name: "Roberto Lim", initials: "RL", tone: "bg-emerald-100 text-emerald-700" }, parcels: 96, tagged: 96, due: "Jun 08, 2026", status: "completed" },
  { id: "5", code: "JOB-2026-085", title: "Zambales Coastal Block", region: "Zambales · Sector 1", surveyor: { name: "Lia Cruz", initials: "LC", tone: "bg-amber-100 text-amber-700" }, parcels: 64, tagged: 31, due: "Jul 02, 2026", status: "in_progress" },
];

const STATUS_BADGE: Record<Job["status"], { label: string; cls: string; icon: typeof Clock }> = {
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  in_progress: { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  queued: { label: "Queued", cls: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

type View = "jobs" | "parcels" | "farmers" | "reports";

function DispatcherPage() {
  const [selected, setSelected] = useState<Job>(JOBS[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<View>("jobs");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SideRail view={view} onChange={setView} />
        {view === "jobs" ? (
          <div className="flex flex-1 overflow-hidden">
            <main className="flex w-full flex-col lg:w-[58%] lg:border-r lg:border-border">
              <Toolbar onCreate={() => setShowCreate(true)} />
              <div className="flex-1 overflow-auto">
                <JobsTable selected={selected} onSelect={setSelected} />
              </div>
            </main>
            <aside className="hidden lg:flex lg:w-[42%] flex-col">
              {showCreate ? (
                <CreateJobPanel onClose={() => setShowCreate(false)} />
              ) : (
                <JobDetailPanel job={selected} />
              )}
            </aside>
          </div>
        ) : view === "parcels" ? (
          <ParcelsView />
        ) : view === "farmers" ? (
          <FarmersView />
        ) : (
          <ReportsView />
        )}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-primary">
            <div className="size-3 rounded-[2px] bg-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">AgriTag Dispatcher</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Region III · BSWM</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 md:flex">
          <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-muted-foreground">Connected · Parcel API</span>
        </div>
        <div className="grid size-8 place-items-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
          DC
        </div>
      </div>
    </header>
  );
}

function SideRail({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const items: { label: string; icon: string; key: View }[] = [
    { label: "Jobs", icon: "□", key: "jobs" },
    { label: "Parcels", icon: "▦", key: "parcels" },
    { label: "Farmers", icon: "◯", key: "farmers" },
    { label: "Reports", icon: "▤", key: "reports" },
  ];
  return (
    <nav className="hidden w-14 flex-col items-center gap-1 border-r border-border bg-card py-3 md:flex">
      {items.map((it) => (
        <button
          key={it.label}
          onClick={() => onChange(it.key)}
          className={`flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider ${
            view === it.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <span className="text-base leading-none">{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

function Toolbar({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search job code, surveyor, region…"
          className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <button className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary">
        <Filter className="size-3.5" /> Filter <ChevronDown className="size-3" />
      </button>
      <button className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary">
        <Download className="size-3.5" /> Export
      </button>
      <button
        onClick={onCreate}
        className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="size-3.5" /> New Job Order
      </button>
    </div>
  );
}

function JobsTable({ selected, onSelect }: { selected: Job; onSelect: (j: Job) => void }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="sticky top-0 z-10 bg-secondary/60 backdrop-blur">
        <tr className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <th className="px-4 py-2.5">Job</th>
          <th className="px-4 py-2.5 hidden md:table-cell">Surveyor</th>
          <th className="px-4 py-2.5">Progress</th>
          <th className="px-4 py-2.5 hidden lg:table-cell">Due</th>
          <th className="px-4 py-2.5">Status</th>
        </tr>
      </thead>
      <tbody>
        {JOBS.map((job) => {
          const pct = Math.round((job.tagged / job.parcels) * 100);
          const isSel = selected.id === job.id;
          const badge = STATUS_BADGE[job.status];
          return (
            <tr
              key={job.id}
              onClick={() => onSelect(job)}
              className={`cursor-pointer border-b border-border/60 transition-colors ${
                isSel ? "bg-primary/5" : "hover:bg-secondary/40"
              }`}
            >
              <td className="px-4 py-3">
                <div className="font-medium leading-tight">{job.title}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {job.code} · {job.region}
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <div className={`grid size-7 place-items-center rounded-full text-[10px] font-semibold ${job.surveyor.tone}`}>
                    {job.surveyor.initials}
                  </div>
                  <span className="text-xs">{job.surveyor.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full ${job.status === "overdue" ? "bg-red-500" : job.status === "completed" ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{job.tagged}/{job.parcels}</span>
                </div>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs text-muted-foreground">{job.due}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${badge.cls}`}>
                  <badge.icon className="size-3" />
                  {badge.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function JobDetailPanel({ job }: { job: Job }) {
  const pct = Math.round((job.tagged / job.parcels) * 100);
  const badge = STATUS_BADGE[job.status];
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background">
      <div className="border-b border-border bg-card px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{job.code}</div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">{job.title}</h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {job.region}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${badge.cls}`}>
            <badge.icon className="size-3" />
            {badge.label}
          </span>
        </div>
      </div>

      <MockMap parcels={SAMPLE_PARCELS} area={SAMPLE_AREA} className="h-64 border-b border-border" />

      <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
        <Stat label="Parcels" value={String(job.parcels)} />
        <Stat label="Tagged" value={`${job.tagged} (${pct}%)`} />
        <Stat label="Due" value={job.due} />
      </div>

      <div className="px-5 py-4">
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Assigned Surveyor
        </div>
        <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
          <div className={`grid size-9 place-items-center rounded-full text-xs font-semibold ${job.surveyor.tone}`}>
            {job.surveyor.initials}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{job.surveyor.name}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Last sync · 14m ago</div>
          </div>
          <button className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-accent">Reassign</button>
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Activity
        </div>
        <ul className="space-y-2.5">
          {[
            { t: "14m ago", who: job.surveyor.name, what: "tagged Farmer 03-14-02-001-4421 → Parcel PH-IVA-0923 (Owner)" },
            { t: "1h ago", who: job.surveyor.name, what: "tagged Farmer 03-14-02-001-4419 → Parcel PH-IVA-0922 (Tenant)" },
            { t: "Yesterday", who: "Dispatcher", what: "extended due date by 7 days" },
            { t: "3d ago", who: "Dispatcher", what: "created job order, scoped 175 parcels" },
          ].map((a, i) => (
            <li key={i} className="flex gap-3 text-xs">
              <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <div className="flex-1">
                <span className="text-foreground">{a.who}</span>{" "}
                <span className="text-muted-foreground">{a.what}</span>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{a.t}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function CreateJobPanel({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"draw" | "code">("draw");
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background">
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">New job order</div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Scope an area</h2>
        </div>
        <button onClick={onClose} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-accent">
          Cancel
        </button>
      </div>

      <div className="relative">
        <MockMap parcels={SAMPLE_PARCELS} area={SAMPLE_AREA} className="h-64" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/95 px-2.5 py-1 shadow-sm backdrop-blur">
          <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-[11px] font-semibold text-foreground">14 parcels in scope</span>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Job title
          </label>
          <input
            defaultValue="San Mateo Block 14"
            className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Area definition
          </div>
          <div className="inline-flex rounded-md border border-border bg-card p-0.5">
            <button
              onClick={() => setMode("draw")}
              className={`rounded-[5px] px-3 py-1 text-xs font-medium ${
                mode === "draw" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Draw polygon
            </button>
            <button
              onClick={() => setMode("code")}
              className={`rounded-[5px] px-3 py-1 text-xs font-medium ${
                mode === "code" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Location code
            </button>
          </div>
          {mode === "code" && (
            <input
              defaultValue="PH-031402"
              className="mt-2 h-9 w-full rounded-md border border-border bg-card px-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Due date
            </label>
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Jun 28, 2026</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Assign surveyor
            </label>
            <select className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm">
              <option>Juan Dela Cruz</option>
              <option>Ana Mirasol</option>
              <option>Maria Santos</option>
            </select>
          </div>
        </div>

        <button className="mt-2 h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Create job order
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Parcels view
// ============================================================
type Parcel = {
  code: string;
  barangay: string;
  area: number;
  crop: string;
  tenure: string;
  owner: string;
  job: string;
  status: "tagged" | "untagged" | "exception";
};

const PARCELS: Parcel[] = [
  { code: "PH-IVA-0921", barangay: "San Isidro", area: 1.24, crop: "Rice (Irrigated)", tenure: "Owner", owner: "Pedro Reyes", job: "JOB-2026-081", status: "tagged" },
  { code: "PH-IVA-0922", barangay: "San Isidro", area: 0.86, crop: "Rice (Irrigated)", tenure: "Tenant", owner: "Marites Lim", job: "JOB-2026-081", status: "tagged" },
  { code: "PH-IVA-0923", barangay: "San Isidro", area: 2.10, crop: "Rice (Irrigated)", tenure: "Owner", owner: "Juan Bautista", job: "JOB-2026-081", status: "exception" },
  { code: "PH-IVA-0924", barangay: "Sta. Rosa", area: 0.45, crop: "Corn", tenure: "Lessee", owner: "Elena Cruz", job: "JOB-2026-081", status: "untagged" },
  { code: "PH-PMP-1102", barangay: "Magalang", area: 3.20, crop: "Sugarcane", tenure: "Owner", owner: "Roberto Yap", job: "JOB-2026-082", status: "tagged" },
  { code: "PH-PMP-1103", barangay: "Magalang", area: 1.05, crop: "Rice (Rainfed)", tenure: "Tenant", owner: "Carla Santos", job: "JOB-2026-082", status: "exception" },
  { code: "PH-BUL-0411", barangay: "Plaridel", area: 0.92, crop: "Vegetables", tenure: "Owner", owner: "Antonio Diaz", job: "JOB-2026-083", status: "untagged" },
  { code: "PH-TRL-0773", barangay: "Concepcion", area: 1.75, crop: "Rice (Irrigated)", tenure: "Owner", owner: "Lourdes Reyes", job: "JOB-2026-084", status: "tagged" },
  { code: "PH-ZAM-0210", barangay: "Iba", area: 0.68, crop: "Mango", tenure: "Owner", owner: "Felix Mendoza", job: "JOB-2026-085", status: "tagged" },
];

const PARCEL_BADGE: Record<Parcel["status"], string> = {
  tagged: "bg-emerald-50 text-emerald-700 border-emerald-200",
  untagged: "bg-slate-100 text-slate-600 border-slate-200",
  exception: "bg-amber-50 text-amber-700 border-amber-200",
};

function ParcelsView() {
  const tagged = PARCELS.filter(p => p.status === "tagged").length;
  const exceptions = PARCELS.filter(p => p.status === "exception").length;
  const totalArea = PARCELS.reduce((s, p) => s + p.area, 0).toFixed(2);
  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border bg-card px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">DA Parcel Registry</div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Parcels</h1>
        <p className="text-xs text-muted-foreground">Geo-referenced parcels scoped across active job orders.</p>
      </div>
      <div className="grid grid-cols-2 gap-px border-b border-border bg-border md:grid-cols-4">
        <Stat label="Total Parcels" value={String(PARCELS.length)} />
        <Stat label="Tagged" value={`${tagged} (${Math.round(tagged/PARCELS.length*100)}%)`} />
        <Stat label="Exceptions" value={String(exceptions)} />
        <Stat label="Total Area (ha)" value={totalArea} />
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-secondary/60 backdrop-blur">
            <tr className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5">Parcel Code</th>
              <th className="px-4 py-2.5">Barangay</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Crop</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Tenure</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Owner</th>
              <th className="px-4 py-2.5">Area (ha)</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Job</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {PARCELS.map((p) => (
              <tr key={p.code} className="border-b border-border/60 hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-3 text-xs">{p.barangay}</td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">{p.crop}</td>
                <td className="px-4 py-3 text-xs hidden lg:table-cell">{p.tenure}</td>
                <td className="px-4 py-3 text-xs hidden lg:table-cell">{p.owner}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.area.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-[10px] hidden md:table-cell text-muted-foreground">{p.job}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${PARCEL_BADGE[p.status]}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// ============================================================
// Farmers view
// ============================================================
type Farmer = {
  rsbsa: string;
  name: string;
  sex: "M" | "F";
  barangay: string;
  parcels: number;
  totalArea: number;
  primaryCrop: string;
  status: "verified" | "pending" | "exception";
};

const FARMERS: Farmer[] = [
  { rsbsa: "03-14-02-001-4419", name: "Marites Lim",     sex: "F", barangay: "San Isidro", parcels: 1, totalArea: 0.86, primaryCrop: "Rice", status: "verified" },
  { rsbsa: "03-14-02-001-4420", name: "Pedro Reyes",     sex: "M", barangay: "San Isidro", parcels: 2, totalArea: 2.31, primaryCrop: "Rice", status: "verified" },
  { rsbsa: "03-14-02-001-4421", name: "Juan Bautista",   sex: "M", barangay: "San Isidro", parcels: 1, totalArea: 2.10, primaryCrop: "Rice", status: "exception" },
  { rsbsa: "03-14-02-002-1187", name: "Elena Cruz",      sex: "F", barangay: "Sta. Rosa",  parcels: 1, totalArea: 0.45, primaryCrop: "Corn", status: "pending" },
  { rsbsa: "03-35-09-004-0921", name: "Roberto Yap",     sex: "M", barangay: "Magalang",   parcels: 3, totalArea: 6.10, primaryCrop: "Sugarcane", status: "verified" },
  { rsbsa: "03-35-09-004-0922", name: "Carla Santos",    sex: "F", barangay: "Magalang",   parcels: 1, totalArea: 1.05, primaryCrop: "Rice", status: "exception" },
  { rsbsa: "03-08-02-007-3310", name: "Antonio Diaz",    sex: "M", barangay: "Plaridel",   parcels: 1, totalArea: 0.92, primaryCrop: "Vegetables", status: "pending" },
  { rsbsa: "03-69-07-003-2210", name: "Lourdes Reyes",   sex: "F", barangay: "Concepcion", parcels: 2, totalArea: 3.40, primaryCrop: "Rice", status: "verified" },
  { rsbsa: "03-71-01-001-0044", name: "Felix Mendoza",   sex: "M", barangay: "Iba",        parcels: 1, totalArea: 0.68, primaryCrop: "Mango", status: "verified" },
];

const FARMER_BADGE: Record<Farmer["status"], string> = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  exception: "bg-amber-50 text-amber-700 border-amber-200",
};

function FarmersView() {
  const verified = FARMERS.filter(f => f.status === "verified").length;
  const female = FARMERS.filter(f => f.sex === "F").length;
  const totalArea = FARMERS.reduce((s, f) => s + f.totalArea, 0).toFixed(2);
  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border bg-card px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">RSBSA Registry</div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Farmers</h1>
        <p className="text-xs text-muted-foreground">Registered beneficiaries linked to tagged parcels.</p>
      </div>
      <div className="grid grid-cols-2 gap-px border-b border-border bg-border md:grid-cols-4">
        <Stat label="Total Farmers" value={String(FARMERS.length)} />
        <Stat label="Verified" value={`${verified} (${Math.round(verified/FARMERS.length*100)}%)`} />
        <Stat label="Female" value={`${female} / ${FARMERS.length}`} />
        <Stat label="Tilled (ha)" value={totalArea} />
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-secondary/60 backdrop-blur">
            <tr className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5">RSBSA No.</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Sex</th>
              <th className="px-4 py-2.5 hidden md:table-cell">Barangay</th>
              <th className="px-4 py-2.5">Parcels</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Area (ha)</th>
              <th className="px-4 py-2.5 hidden lg:table-cell">Primary Crop</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {FARMERS.map((f) => (
              <tr key={f.rsbsa} className="border-b border-border/60 hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono text-[11px]">{f.rsbsa}</td>
                <td className="px-4 py-3 text-xs font-medium">{f.name}</td>
                <td className="px-4 py-3 text-xs">{f.sex}</td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">{f.barangay}</td>
                <td className="px-4 py-3 font-mono text-xs">{f.parcels}</td>
                <td className="px-4 py-3 font-mono text-xs hidden lg:table-cell">{f.totalArea.toFixed(2)}</td>
                <td className="px-4 py-3 text-xs hidden lg:table-cell">{f.primaryCrop}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${FARMER_BADGE[f.status]}`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// ============================================================
// Reports view
// ============================================================
function ReportsView() {
  const totalParcels = JOBS.reduce((s, j) => s + j.parcels, 0);
  const totalTagged = JOBS.reduce((s, j) => s + j.tagged, 0);
  const overall = Math.round((totalTagged / totalParcels) * 100);

  const cropMix = [
    { crop: "Rice (Irrigated)", area: 312.4, share: 48 },
    { crop: "Rice (Rainfed)",   area: 118.2, share: 18 },
    { crop: "Corn",             area:  92.6, share: 14 },
    { crop: "Sugarcane",        area:  72.0, share: 11 },
    { crop: "Vegetables",       area:  38.1, share:  6 },
    { crop: "Mango",            area:  20.7, share:  3 },
  ];

  const exceptions = [
    { reason: "Boundary mismatch",   count: 14 },
    { reason: "Farmer not on RSBSA", count:  9 },
    { reason: "Duplicate tag",       count:  6 },
    { reason: "GPS outside parcel",  count:  4 },
    { reason: "Photo missing",       count:  3 },
  ];

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      <div className="border-b border-border bg-card px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Operations</div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Reports</h1>
        <p className="text-xs text-muted-foreground">Region III tagging performance · June 2026 cycle.</p>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-border bg-border md:grid-cols-4">
        <Stat label="Jobs Active" value={String(JOBS.filter(j => j.status !== "completed").length)} />
        <Stat label="Parcels in Scope" value={String(totalParcels)} />
        <Stat label="Tagging Coverage" value={`${overall}%`} />
        <Stat label="Open Exceptions" value={String(exceptions.reduce((s, e) => s + e.count, 0))} />
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Job Progress</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">By order</span>
          </div>
          <ul className="space-y-3">
            {JOBS.map(j => {
              const pct = Math.round((j.tagged / j.parcels) * 100);
              return (
                <li key={j.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{j.title}</span>
                    <span className="font-mono text-muted-foreground">{j.tagged}/{j.parcels} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full ${j.status === "overdue" ? "bg-red-500" : j.status === "completed" ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Crop Mix</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Hectares tagged</span>
          </div>
          <ul className="space-y-2.5">
            {cropMix.map(c => (
              <li key={c.crop}>
                <div className="flex items-center justify-between text-xs">
                  <span>{c.crop}</span>
                  <span className="font-mono text-muted-foreground">{c.area.toFixed(1)} ha · {c.share}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-emerald-500" style={{ width: `${c.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Exceptions Breakdown</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">For validator</span>
          </div>
          <ul className="divide-y divide-border">
            {exceptions.map(e => (
              <li key={e.reason} className="flex items-center justify-between py-2 text-xs">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  {e.reason}
                </span>
                <span className="font-mono font-semibold">{e.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Surveyor Throughput</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Last 7 days</span>
          </div>
          <ul className="space-y-2.5">
            {JOBS.map(j => (
              <li key={j.id} className="flex items-center gap-3">
                <div className={`grid size-7 place-items-center rounded-full text-[10px] font-semibold ${j.surveyor.tone}`}>
                  {j.surveyor.initials}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium">{j.surveyor.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {j.tagged} parcels · {(j.tagged / 7).toFixed(1)}/day avg
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{j.code}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
