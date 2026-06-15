import { createFileRoute, Link } from "@tanstack/react-router";
import { Map, ClipboardList, Settings2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriTag — DA Farmer-Parcel Tagging" },
      { name: "description", content: "Mockup hub for the Department of Agriculture farmer-to-parcel tagging system." },
    ],
  }),
  component: Index,
});

const surfaces = [
  {
    to: "/dispatcher",
    label: "Dispatcher",
    sub: "Web · Desktop",
    title: "Job Orders Dashboard",
    desc: "Create job orders by drawing an area or location code, set due dates, assign surveyors, monitor tagging progress.",
    icon: ClipboardList,
  },
  {
    to: "/admin/fields",
    label: "Admin",
    sub: "Web · Field Configuration",
    title: "Dynamic Field Builder",
    desc: "Define the custom fields surveyors fill out per tag — text, select, photo, GPS. Live preview of the resulting form.",
    icon: Settings2,
  },
  {
    to: "/app",
    label: "Surveyor",
    sub: "Mobile · Capacitor app",
    title: "Field Tagging",
    desc: "Map of assigned parcels, search farmer by RSBSA ID, tag with tenure status and admin-configured fields.",
    icon: Map,
  },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <div className="size-3 rounded-[2px] bg-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">AgriTag</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">v0.1 · mockup</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
            <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">Department of Agriculture</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
            <div className="size-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Prototype · 3 surfaces</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Farmer-to-parcel tagging for field surveyors.
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Dispatchers create job orders over an area. Surveyors tag farmers to the parcels in that area using
            tenure status and admin-configured fields. One parcel can have many farmers; one farmer can have many parcels.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {surfaces.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group relative flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-md border border-border bg-secondary">
                  <s.icon className="size-4 text-foreground" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.sub}
                </span>
              </div>
              <div className="mt-5 text-xs font-medium uppercase tracking-wider text-primary">{s.label}</div>
              <div className="mt-1 text-base font-semibold tracking-tight">{s.title}</div>
              <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary">
                <span>Open mockup</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-dashed border-border bg-card/50 p-5">
          <div className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">What's in this mockup</div>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <li className="flex gap-2"><span className="text-primary">·</span> DA-green design system, clean shadcn surfaces tuned for regional dispatchers</li>
            <li className="flex gap-2"><span className="text-primary">·</span> Surveyor multi-select: tag one farmer to many parcels in one batch</li>
            <li className="flex gap-2"><span className="text-primary">·</span> Dispatcher list/map split with overdue badges and due dates</li>
            <li className="flex gap-2"><span className="text-primary">·</span> Admin dynamic-field builder with live preview</li>
            <li className="flex gap-2"><span className="text-primary">·</span> Surveyor map view + bottom-sheet tagging form</li>
            <li className="flex gap-2"><span className="text-primary">·</span> Tenure status, RSBSA ID search, photo evidence</li>
            <li className="flex gap-2"><span className="text-primary">·</span> Backend, auth, real maps, and Capacitor wiring come in phase 1</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
