import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, MapPin,
  Users, Layers, Camera, FileWarning, Filter, Search, ChevronRight, Send,
  RotateCcw, Download, MessageSquare, ShieldCheck, TrendingUp, Clock,
} from "lucide-react";

export const Route = createFileRoute("/validator")({
  head: () => ({
    meta: [
      { title: "Validator — AgriTag" },
      { name: "description", content: "Validator workflow for reviewing submitted Job Orders from AEW field surveys." },
    ],
  }),
  component: ValidatorApp,
});

// ───────── Mock data ─────────
type JobStatus = "submitted" | "in_review" | "approved" | "returned";
type Job = {
  id: string;
  area: string;
  province: string;
  aew: string;
  submitted: string;
  parcels: number;
  tagged: number;
  farmers: number;
  hectares: number;
  exceptions: number;
  duplicates: number;
  missingPhotos: number;
  outsideArea: number;
  unmatchedRsbsa: number;
  coverage: number; // % parcels tagged
  status: JobStatus;
};

const JOBS: Job[] = [
  { id: "JO-2026-0142", area: "Brgy. San Isidro", province: "Nueva Ecija", aew: "M. Santos", submitted: "Today, 09:14", parcels: 1284, tagged: 1247, farmers: 892, hectares: 1842, exceptions: 37, duplicates: 8, missingPhotos: 14, outsideArea: 3, unmatchedRsbsa: 12, coverage: 97, status: "submitted" },
  { id: "JO-2026-0138", area: "Brgy. Bagong Silang", province: "Nueva Ecija", aew: "R. Cruz", submitted: "Yesterday", parcels: 642, tagged: 640, farmers: 401, hectares: 980, exceptions: 5, duplicates: 1, missingPhotos: 2, outsideArea: 0, unmatchedRsbsa: 2, coverage: 99, status: "in_review" },
  { id: "JO-2026-0135", area: "Brgy. Pinagbayanan", province: "Quezon", aew: "L. Mendoza", submitted: "2d ago", parcels: 2104, tagged: 1980, farmers: 1402, hectares: 3210, exceptions: 124, duplicates: 22, missingPhotos: 58, outsideArea: 11, unmatchedRsbsa: 33, coverage: 94, status: "submitted" },
  { id: "JO-2026-0129", area: "Brgy. Mabini", province: "Pangasinan", aew: "J. Dela Peña", submitted: "4d ago", parcels: 488, tagged: 488, farmers: 312, hectares: 712, exceptions: 0, duplicates: 0, missingPhotos: 0, outsideArea: 0, unmatchedRsbsa: 0, coverage: 100, status: "approved" },
  { id: "JO-2026-0124", area: "Brgy. Looc", province: "Batangas", aew: "A. Reyes", submitted: "5d ago", parcels: 910, tagged: 803, farmers: 540, hectares: 1100, exceptions: 89, duplicates: 14, missingPhotos: 41, outsideArea: 6, unmatchedRsbsa: 28, coverage: 88, status: "returned" },
];

const statusMeta: Record<JobStatus, { label: string; cls: string }> = {
  submitted: { label: "Submitted", cls: "bg-amber-100 text-amber-900 border-amber-200" },
  in_review: { label: "In Review", cls: "bg-blue-100 text-blue-900 border-blue-200" },
  approved:  { label: "Approved",  cls: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  returned:  { label: "Returned",  cls: "bg-rose-100 text-rose-900 border-rose-200" },
};

function ValidatorApp() {
  const [openJob, setOpenJob] = useState<Job | null>(null);
  const [filter, setFilter] = useState<"all" | "queue" | "exceptions">("queue");

  const filtered = JOBS.filter((j) => {
    if (filter === "queue") return j.status === "submitted" || j.status === "in_review";
    if (filter === "exceptions") return j.exceptions > 0;
    return true;
  });

  const totals = {
    queue: JOBS.filter(j => j.status === "submitted" || j.status === "in_review").length,
    exceptions: JOBS.reduce((s, j) => s + j.exceptions, 0),
    approvedToday: 1,
    avgCoverage: Math.round(JOBS.reduce((s, j) => s + j.coverage, 0) / JOBS.length),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid size-8 place-items-center rounded-md border border-border bg-secondary text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Validator Console</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Job Order QA · Regional Office III</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">E. Villanueva · Validator</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* KPI strip */}
        <div className="grid gap-3 md:grid-cols-4">
          <Kpi icon={Clock} label="In queue" value={totals.queue.toString()} sub="awaiting validation" tone="amber" />
          <Kpi icon={AlertTriangle} label="Open exceptions" value={totals.exceptions.toString()} sub="across all queued jobs" tone="rose" />
          <Kpi icon={CheckCircle2} label="Approved today" value={totals.approvedToday.toString()} sub="passed to planning" tone="emerald" />
          <Kpi icon={TrendingUp} label="Avg. coverage" value={`${totals.avgCoverage}%`} sub="parcels tagged / area" tone="primary" />
        </div>

        {/* Filter chips */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
            {([
              ["queue", "Validation queue"],
              ["exceptions", "With exceptions"],
              ["all", "All job orders"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Job ID, barangay, AEW…"
                className="h-8 w-64 rounded-md border border-border bg-card pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-accent">
              <Filter className="size-3.5" /> Filters
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-accent">
              <Download className="size-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Job table */}
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Job Order</th>
                <th className="px-4 py-2.5 font-medium">Area</th>
                <th className="px-4 py-2.5 font-medium">AEW</th>
                <th className="px-4 py-2.5 text-right font-medium">Parcels</th>
                <th className="px-4 py-2.5 text-right font-medium">Coverage</th>
                <th className="px-4 py-2.5 text-right font-medium">Exceptions</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr
                  key={j.id}
                  onClick={() => setOpenJob(j)}
                  className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{j.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{j.area}</div>
                    <div className="text-xs text-muted-foreground">{j.province}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{j.aew}<div className="text-xs">{j.submitted}</div></td>
                  <td className="px-4 py-3 text-right tabular-nums">{j.tagged.toLocaleString()}<span className="text-muted-foreground"> / {j.parcels.toLocaleString()}</span></td>
                  <td className="px-4 py-3">
                    <div className="ml-auto flex max-w-[120px] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className={`h-full ${j.coverage >= 95 ? "bg-emerald-500" : j.coverage >= 90 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${j.coverage}%` }} />
                      </div>
                      <span className="w-9 text-right text-xs tabular-nums">{j.coverage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {j.exceptions === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="size-3" /> clean</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-900">
                        <AlertTriangle className="size-3" /> {j.exceptions}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusMeta[j.status].cls}`}>
                      {statusMeta[j.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground"><ChevronRight className="ml-auto size-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Workflow strip */}
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card/50 p-4">
          <div className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Validator workflow</div>
          <div className="mt-3 grid gap-3 md:grid-cols-5">
            {[
              ["1", "AEW submits", "Job Order locked, summary computed"],
              ["2", "Triage", "Sort queue by exceptions & coverage"],
              ["3", "Review", "Inspect summary, exceptions, samples"],
              ["4", "Decide", "Approve, return-to-AEW, or partial accept"],
              ["5", "Handoff", "Approved data flows to DA planning"],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{n}</span>
                  <span className="text-xs font-semibold">{t}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {openJob && <JobReviewDrawer job={openJob} onClose={() => setOpenJob(null)} />}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: string; sub: string; tone: "amber" | "rose" | "emerald" | "primary" }) {
  const toneCls = {
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    emerald: "bg-emerald-100 text-emerald-700",
    primary: "bg-primary/10 text-primary",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`grid size-7 place-items-center rounded-md ${toneCls}`}><Icon className="size-3.5" /></span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

// ───────── Drawer: Job Order review ─────────
function JobReviewDrawer({ job, onClose }: { job: Job; onClose: () => void }) {
  const [tab, setTab] = useState<"summary" | "parcels" | "exceptions" | "samples" | "map">("summary");
  const [decision, setDecision] = useState<null | "approve" | "return">(null);

  return (
    <div className="fixed inset-0 z-30 flex">
      <div className="flex-1 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="flex w-full max-w-3xl flex-col border-l border-border bg-card shadow-2xl">
        {/* Drawer header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-muted-foreground">{job.id}</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusMeta[job.status].cls}`}>
                  {statusMeta[job.status].label}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{job.area}</h2>
              <p className="text-xs text-muted-foreground">{job.province} · AEW {job.aew} · submitted {job.submitted}</p>
            </div>
            <button onClick={onClose} className="grid size-8 place-items-center rounded-md border border-border bg-secondary text-muted-foreground hover:text-foreground">
              <XCircle className="size-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1">
            {([
              ["summary", "Summary"],
              ["parcels", `Parcels (${job.tagged})`],
              ["exceptions", `Exceptions (${job.exceptions})`],
              ["samples", "Random samples"],
              ["map", "Map heatmap"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "summary" && <SummaryTab job={job} />}
          {tab === "parcels" && <ParcelsTab job={job} />}
          {tab === "exceptions" && <ExceptionsTab job={job} />}
          {tab === "samples" && <SamplesTab />}
          {tab === "map" && <MapTab />}
        </div>

        {/* Decision footer */}
        <div className="border-t border-border bg-secondary/30 px-6 py-4">
          {decision === null ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Decisions apply to the <strong className="text-foreground">entire job order</strong>. Per-parcel edits aren't possible here.
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDecision("return")} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 text-xs font-medium text-rose-900 hover:bg-rose-100">
                  <RotateCcw className="size-3.5" /> Return to AEW
                </button>
                <button onClick={() => setDecision("approve")} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                  <Send className="size-3.5" /> Approve & handoff
                </button>
              </div>
            </div>
          ) : decision === "approve" ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                <CheckCircle2 className="size-4" /> Approve Job Order {job.id}?
              </div>
              <p className="mt-1 text-xs text-emerald-800">
                {job.tagged.toLocaleString()} tagged parcels for {job.farmers.toLocaleString()} farmers will be handed off to DA planning. This is final.
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button onClick={() => setDecision(null)} className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium">Cancel</button>
                <button onClick={onClose} className="h-8 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700">Confirm approval</button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-rose-900">
                <RotateCcw className="size-4" /> Return to AEW {job.aew}?
              </div>
              <textarea
                placeholder="Notes for the AEW — e.g. 'Re-survey 11 parcels flagged outside area, reupload missing photos for SE quadrant.'"
                className="mt-2 h-20 w-full rounded-md border border-rose-200 bg-card p-2 text-xs outline-none focus:border-rose-400"
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <button onClick={() => setDecision(null)} className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium">Cancel</button>
                <button onClick={onClose} className="h-8 rounded-md bg-rose-600 px-3 text-xs font-medium text-white hover:bg-rose-700">Send back</button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function SummaryTab({ job }: { job: Job }) {
  const stats = [
    { icon: Layers, label: "Parcels in area", value: job.parcels.toLocaleString(), sub: "from DA Parcel Registry" },
    { icon: ClipboardCheck, label: "Parcels tagged", value: job.tagged.toLocaleString(), sub: `${job.coverage}% coverage` },
    { icon: Users, label: "Unique farmers", value: job.farmers.toLocaleString(), sub: "matched to RSBSA" },
    { icon: MapPin, label: "Hectares covered", value: job.hectares.toLocaleString(), sub: "sum of tagged parcels" },
  ];
  const tenure = [
    { label: "Owner", pct: 58, color: "bg-primary" },
    { label: "Tenant", pct: 24, color: "bg-amber-500" },
    { label: "Lessee", pct: 12, color: "bg-blue-500" },
    { label: "Caretaker", pct: 6, color: "bg-stone-500" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="size-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="mt-1.5 text-xl font-semibold tabular-nums">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tenure distribution</div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-secondary">
          {tenure.map((t) => <div key={t.label} className={t.color} style={{ width: `${t.pct}%` }} />)}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {tenure.map((t) => (
            <div key={t.label} className="text-xs">
              <div className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${t.color}`} /><span className="text-muted-foreground">{t.label}</span></div>
              <div className="mt-0.5 font-semibold tabular-nums">{t.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Data quality checks</div>
        <div className="mt-3 grid gap-2">
          {[
            ["GPS pin inside parcel polygon", job.outsideArea === 0, `${job.parcels - job.outsideArea} / ${job.parcels} OK`],
            ["Required photo present", job.missingPhotos === 0, `${job.tagged - job.missingPhotos} / ${job.tagged} OK`],
            ["RSBSA ID matched", job.unmatchedRsbsa === 0, `${job.farmers - job.unmatchedRsbsa} / ${job.farmers} matched`],
            ["No duplicate farmer-parcel tags", job.duplicates === 0, `${job.duplicates} duplicates`],
            ["Custom fields completeness", true, "98% filled"],
          ].map(([label, ok, detail]) => (
            <div key={label as string} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2 text-xs">
              <span className="flex items-center gap-2">
                {ok ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <AlertTriangle className="size-3.5 text-amber-600" />}
                <span className="font-medium">{label as string}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">{detail as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExceptionsTab({ job }: { job: Job }) {
  const groups = [
    { icon: MapPin, color: "rose", label: "GPS outside parcel polygon", count: job.outsideArea, action: "Re-survey required" },
    { icon: Camera, color: "amber", label: "Missing required photo", count: job.missingPhotos, action: "Reupload from device" },
    { icon: Users, color: "blue", label: "RSBSA ID not found in registry", count: job.unmatchedRsbsa, action: "Match or create farmer" },
    { icon: FileWarning, color: "stone", label: "Duplicate farmer-parcel tag", count: job.duplicates, action: "Merge or delete" },
  ];
  const tone: Record<string, string> = {
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    stone: "bg-stone-100 text-stone-700 border-stone-200",
  };
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Validation is at the <strong className="text-foreground">job-order level</strong> — group similar exceptions and decide
        whether they are tolerable, fixable in bulk, or require returning the job to the AEW.
      </p>
      {groups.map((g) => (
        <div key={g.label} className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`grid size-8 place-items-center rounded-md border ${tone[g.color]}`}><g.icon className="size-4" /></span>
              <div>
                <div className="text-sm font-medium">{g.label}</div>
                <div className="text-xs text-muted-foreground">{g.action}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold tabular-nums">{g.count}</span>
              <button className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-secondary px-2.5 text-xs font-medium hover:bg-accent">
                View list <ChevronRight className="size-3" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 rounded-md border border-border bg-secondary/40 p-3">
        <div className="flex items-center gap-2 text-xs font-medium"><MessageSquare className="size-3.5 text-muted-foreground" /> Notes from AEW {job.aew}</div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          "Some SE parcels had no signal — photos uploaded after returning to barangay hall. 11 parcels near river boundary may overlap with adjacent area."
        </p>
      </div>
    </div>
  );
}

function SamplesTab() {
  const samples = [
    { parcel: "P-9821-A", farmer: "Juan D. (RSBSA-N-3402-001)", tenure: "Owner", ha: "1.42", photo: true },
    { parcel: "P-9821-B", farmer: "Maria L. (RSBSA-N-3402-118)", tenure: "Tenant", ha: "0.88", photo: true },
    { parcel: "P-9822-A", farmer: "Pedro R. (RSBSA-N-3402-220)", tenure: "Owner", ha: "2.10", photo: false },
    { parcel: "P-9822-C", farmer: "Ana S. (RSBSA-N-3402-301)", tenure: "Lessee", ha: "0.62", photo: true },
    { parcel: "P-9823-A", farmer: "Jose M. (RSBSA-N-3402-410)", tenure: "Caretaker", ha: "1.05", photo: true },
  ];
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Random 5-parcel sample drawn from the job. Spot-check for plausibility — names, tenure, photo presence.
      </p>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-secondary/50 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-3 py-2 font-medium">Parcel</th><th className="px-3 py-2 font-medium">Farmer</th><th className="px-3 py-2 font-medium">Tenure</th><th className="px-3 py-2 text-right font-medium">ha</th><th className="px-3 py-2 font-medium">Photo</th></tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.parcel} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-mono">{s.parcel}</td>
                <td className="px-3 py-2">{s.farmer}</td>
                <td className="px-3 py-2">{s.tenure}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.ha}</td>
                <td className="px-3 py-2">{s.photo ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <XCircle className="size-3.5 text-rose-600" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-accent">
        <RotateCcw className="size-3.5" /> Draw new sample
      </button>
    </div>
  );
}

function MapTab() {
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Coverage heatmap — green = tagged, amber = pending, red = exception. Click clusters to drill in.
      </p>
      <div className="relative h-[360px] overflow-hidden rounded-md border border-border bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50">
        {/* Mock grid heatmap */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-0.5 p-1">
          {Array.from({ length: 96 }).map((_, i) => {
            const r = (i * 37) % 100;
            const cls = r < 80 ? "bg-emerald-500/70" : r < 92 ? "bg-amber-500/70" : "bg-rose-500/80";
            return <div key={i} className={`rounded-sm ${cls}`} />;
          })}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-md border border-border bg-card/95 px-3 py-2 text-[11px] backdrop-blur">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-emerald-500" /> Tagged</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-amber-500" /> Pending</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-rose-500" /> Exception</span>
        </div>
      </div>
    </div>
  );
}

// ───────── Parcels tab: submitted parcel details ─────────
type ParcelRow = {
  id: string;
  farmer: string;
  rsbsa: string;
  tenure: "Owner" | "Tenant" | "Lessee" | "Caretaker";
  crop: string;
  ha: number;
  gps: string;
  photo: boolean;
  status: "ok" | "review" | "exception";
  flag?: string;
  tagged: string;
};

function buildParcelRows(job: Job): ParcelRow[] {
  const tenures: ParcelRow["tenure"][] = ["Owner", "Tenant", "Lessee", "Caretaker"];
  const crops = ["Rice (Inbred)", "Rice (Hybrid)", "Corn", "Vegetables", "Sugarcane"];
  const flags = ["GPS outside polygon", "Missing photo", "RSBSA not matched", "Duplicate tag", "Boundary mismatch"];
  const rows: ParcelRow[] = [];
  const n = 24;
  for (let i = 0; i < n; i++) {
    const isException = i % 7 === 3;
    const review = !isException && i % 5 === 1;
    rows.push({
      id: `P-${9800 + i}-${String.fromCharCode(65 + (i % 4))}`,
      farmer: ["Juan D. Marcelo", "Maria L. Santos", "Pedro R. Reyes", "Ana B. Cruz", "Roberto Dela Peña", "Jose M. Aquino"][i % 6],
      rsbsa: `03-14-02-001-${4400 + i * 7}`,
      tenure: tenures[i % 4],
      crop: crops[i % crops.length],
      ha: Math.round((0.4 + (i % 6) * 0.45) * 100) / 100,
      gps: `15.03${(10 + i).toString().padStart(2, "0")}°N · 120.68${(10 + i * 3).toString().padStart(2, "0")}°E`,
      photo: !(i % 9 === 4),
      status: isException ? "exception" : review ? "review" : "ok",
      flag: isException ? flags[i % flags.length] : undefined,
      tagged: `Jun ${10 + (i % 6)}, ${8 + (i % 6)}:${10 + (i % 5)}0`,
    });
  }
  return rows.slice(0, Math.min(n, job.tagged));
}

function ParcelsTab({ job }: { job: Job }) {
  const all = buildParcelRows(job);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "ok" | "review" | "exception">("all");
  const [active, setActive] = useState<ParcelRow | null>(null);

  const filtered = all.filter(r => {
    if (status !== "all" && r.status !== status) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return r.id.toLowerCase().includes(s) || r.farmer.toLowerCase().includes(s) || r.rsbsa.includes(s);
  });

  const counts = {
    all: all.length,
    ok: all.filter(r => r.status === "ok").length,
    review: all.filter(r => r.status === "review").length,
    exception: all.filter(r => r.status === "exception").length,
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Submitted parcels in this job order. Read-only — drill in to inspect a single record.
        </p>
        <div className="text-[11px] text-muted-foreground">
          Showing <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> of {all.length} (preview of {job.tagged.toLocaleString()})
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 p-1">
          {([
            ["all", `All ${counts.all}`],
            ["ok", `Clean ${counts.ok}`],
            ["review", `Needs review ${counts.review}`],
            ["exception", `Exceptions ${counts.exception}`],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setStatus(k)}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                status === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Parcel ID, farmer, RSBSA…"
            className="h-8 w-56 rounded-md border border-border bg-card pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-secondary/50 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Parcel</th>
              <th className="px-3 py-2 font-medium">Farmer · RSBSA</th>
              <th className="px-3 py-2 font-medium">Tenure</th>
              <th className="px-3 py-2 font-medium">Crop</th>
              <th className="px-3 py-2 text-right font-medium">ha</th>
              <th className="px-3 py-2 font-medium">Photo</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => setActive(r)}
                className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/40"
              >
                <td className="px-3 py-2 font-mono">{r.id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.farmer}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{r.rsbsa}</div>
                </td>
                <td className="px-3 py-2">{r.tenure}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.crop}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.ha.toFixed(2)}</td>
                <td className="px-3 py-2">
                  {r.photo
                    ? <CheckCircle2 className="size-3.5 text-emerald-600" />
                    : <XCircle className="size-3.5 text-rose-600" />}
                </td>
                <td className="px-3 py-2">
                  {r.status === "ok" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                      <CheckCircle2 className="size-3" /> Clean
                    </span>
                  )}
                  {r.status === "review" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                      <Clock className="size-3" /> Review
                    </span>
                  )}
                  {r.status === "exception" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-800">
                      <AlertTriangle className="size-3" /> {r.flag}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-xs text-muted-foreground">No parcels match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {active && <ParcelDetailDialog row={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function ParcelDetailDialog({ row, onClose }: { row: ParcelRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Parcel record</div>
            <h3 className="text-base font-semibold">{row.id}</h3>
          </div>
          <button onClick={onClose} className="grid size-7 place-items-center rounded-md border border-border bg-secondary text-muted-foreground hover:text-foreground">
            <XCircle className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-4 text-xs">
          {[
            ["Farmer", row.farmer],
            ["RSBSA ID", row.rsbsa],
            ["Tenure", row.tenure],
            ["Crop", row.crop],
            ["Tilled area", `${row.ha.toFixed(2)} ha`],
            ["GPS", row.gps],
            ["Tagged at", row.tagged],
            ["Boundary photo", row.photo ? "Attached" : "Missing"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-border bg-secondary/30 p-2.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-0.5 font-medium">{v}</div>
            </div>
          ))}
        </div>

        {row.status === "exception" && (
          <div className="mx-5 mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
            <div className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="size-3.5" /> Exception flagged by AEW</div>
            <div className="mt-0.5 text-rose-800">{row.flag}</div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-5 py-3 text-[11px] text-muted-foreground">
          <span>Read-only · per-parcel edits aren't possible from validator</span>
          <button onClick={onClose} className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90">Close</button>
        </div>
      </div>
    </div>
  );
}
