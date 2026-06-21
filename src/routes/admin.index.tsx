import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Smartphone, Settings2, ShieldCheck, ArrowRight, ArrowLeft, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Console · AgriTag" },
      { name: "description", content: "Unified administration hub for AgriTag — users, devices, field configuration." },
    ],
  }),
  component: AdminHub,
});

const MODULES = [
  {
    to: "/admin/users",
    label: "User Management",
    sub: "Accounts · Roles · MPIN",
    desc: "Create staff accounts, assign dynamic roles per module, reset MPIN, unlock accounts.",
    icon: Users,
    stat: "12 active users",
  },
  {
    to: "/admin/devices",
    label: "Device Registry",
    sub: "MDM · Surveyor handsets",
    desc: "Approve or revoke registered mobile devices. Each surveyor handset is fingerprinted before first sign-in.",
    icon: Smartphone,
    stat: "3 pending approvals",
  },
  {
    to: "/admin/fields",
    label: "Field Configuration",
    sub: "Dynamic forms · Grouped",
    desc: "Define the fields surveyors fill out per tag, grouped by category. Mirrors the mobile tagging sheet.",
    icon: Settings2,
    stat: "7 active fields · 4 groups",
  },
] as const;

const ACTIVITY = [
  { who: "admin", what: "approved device", target: "TAB-AEW-0142 (surveyor1)", when: "2m ago" },
  { who: "admin", what: "reset MPIN for", target: "validator1", when: "18m ago" },
  { who: "admin", what: "published field config", target: "v12 → 24 surveyors", when: "1h ago" },
  { who: "admin", what: "revoked device", target: "TAB-AEW-0098", when: "Yesterday" },
];

function AdminHub() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">Admin Console</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">AgriTag · System administration</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Signed in · admin
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">Manage the platform</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One place for accounts, devices, and the dynamic form that drives every field tag.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-md border border-border bg-secondary">
                  <m.icon className="size-4" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.sub}</span>
              </div>
              <div className="mt-5 text-base font-semibold tracking-tight">{m.label}</div>
              <p className="mt-1.5 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">{m.stat}</span>
                <ArrowRight className="size-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <div className="text-sm font-semibold">Recent activity</div>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{a.who}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span>{a.what}</span>
                    <span className="ml-1.5 font-medium text-foreground">{a.target}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{a.when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">System health</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Sync queue</span><span className="font-mono">42 pending</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Last seeder run</span><span className="font-mono">12:04</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Build</span><span className="font-mono">v0.1 mock</span></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
