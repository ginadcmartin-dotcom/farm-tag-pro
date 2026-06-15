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

function DispatcherPage() {
  const [selected, setSelected] = useState<Job>(JOBS[0]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SideRail />
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

function SideRail() {
  const items = [
    { label: "Jobs", icon: "□", active: true },
    { label: "Parcels", icon: "▦" },
    { label: "Farmers", icon: "◯" },
    { label: "Reports", icon: "▤" },
  ];
  return (
    <nav className="hidden w-14 flex-col items-center gap-1 border-r border-border bg-card py-3 md:flex">
      {items.map((it) => (
        <button
          key={it.label}
          className={`flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider ${
            it.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
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
