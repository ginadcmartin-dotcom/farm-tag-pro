import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, GripVertical, Plus, Type, Hash, Calendar,
  ListChecks, Camera, MapPin, Trash2, Eye, ChevronDown, ChevronRight,
  User, Sprout, Droplets, AlertTriangle, FolderPlus, Smartphone,
} from "lucide-react";

export const Route = createFileRoute("/admin/fields")({
  head: () => ({
    meta: [
      { title: "Field Configuration · AgriTag Admin" },
      { name: "description", content: "Configure dynamic fields surveyors fill out per farmer-parcel tag, grouped by category." },
    ],
  }),
  component: AdminFields,
});

type FieldType = "text" | "number" | "date" | "select" | "photo" | "gps";
type GroupId = "farmer" | "tenure_crop" | "parcel_evidence" | "exceptions";

type GroupDef = {
  id: GroupId;
  label: string;
  description: string;
  icon: typeof User;
  mobileHint: string;
};

type FieldDef = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  active: boolean;
  group: GroupId;
  help?: string;
  options?: string[];
  source?: "RSBSA" | "DA Registry" | "Device" | "Manual";
};

const TYPE_META: Record<FieldType, { label: string; icon: typeof Type }> = {
  text: { label: "Text", icon: Type },
  number: { label: "Number", icon: Hash },
  date: { label: "Date", icon: Calendar },
  select: { label: "Select", icon: ListChecks },
  photo: { label: "Photo", icon: Camera },
  gps: { label: "GPS", icon: MapPin },
};

const GROUPS: GroupDef[] = [
  { id: "farmer", label: "Farmer identity", description: "Pre-filled from synced RSBSA record", icon: User, mobileHint: "Top of tagging sheet · read-only chips" },
  { id: "tenure_crop", label: "Tenure & crop", description: "Per-parcel agronomic data", icon: Sprout, mobileHint: "Main form · per parcel or batch apply-to-all" },
  { id: "parcel_evidence", label: "Parcel & evidence", description: "Geo + photo proof of tag", icon: Droplets, mobileHint: "Bottom of form · GPS auto, photo capture" },
  { id: "exceptions", label: "Exception tagging", description: "Reasons surfaced to validator", icon: AlertTriangle, mobileHint: "Exception sheet · multi-select reasons" },
];

const INITIAL: FieldDef[] = [
  // Farmer identity (mirrors mobile farmer card)
  { id: "fa1", key: "rsbsa_id", label: "RSBSA ID", type: "text", required: true, active: true, group: "farmer", source: "RSBSA", help: "Locked after farmer pick" },
  { id: "fa2", key: "full_name", label: "Full name", type: "text", required: true, active: true, group: "farmer", source: "RSBSA" },
  { id: "fa3", key: "barangay", label: "Barangay", type: "text", required: false, active: true, group: "farmer", source: "RSBSA" },
  { id: "fa4", key: "contact", label: "Contact number", type: "text", required: false, active: true, group: "farmer", source: "RSBSA" },

  // Tenure & crop (mirrors mobile per-parcel form & apply-to-all toggles)
  { id: "tc1", key: "tenure", label: "Tenure status", type: "select", required: true, active: true, group: "tenure_crop", options: ["Owner", "Tenant", "Leaseholder", "Tiller", "Caretaker"], help: "Supports apply-to-all in batch mode" },
  { id: "tc2", key: "crop_type", label: "Primary crop", type: "select", required: true, active: true, group: "tenure_crop", options: ["Rice (Inbred)", "Rice (Hybrid)", "Corn", "Sugarcane", "Vegetables"] },
  { id: "tc3", key: "area_ha", label: "Tilled area (ha)", type: "number", required: true, active: true, group: "tenure_crop", help: "Two decimals" },
  { id: "tc4", key: "irrig_source", label: "Irrigation source", type: "select", required: false, active: true, group: "tenure_crop", options: ["NIA", "Communal", "Deepwell", "Rainfed"] },

  // Parcel & evidence (mirrors mobile bottom of sheet)
  { id: "pe1", key: "parcel_code", label: "Parcel code", type: "text", required: true, active: true, group: "parcel_evidence", source: "DA Registry", help: "From DA Parcel Registry — locked" },
  { id: "pe2", key: "photo", label: "Parcel boundary photo", type: "photo", required: true, active: true, group: "parcel_evidence" },
  { id: "pe3", key: "gps", label: "GPS pin at tagging", type: "gps", required: true, active: true, group: "parcel_evidence", source: "Device", help: "Auto-captured" },
  { id: "pe4", key: "tagged_at", label: "Tag timestamp", type: "date", required: false, active: true, group: "parcel_evidence", source: "Device" },

  // Exceptions (mirrors mobile exception sheet)
  { id: "ex1", key: "exception_reason", label: "Exception reason", type: "select", required: false, active: true, group: "exceptions", options: ["Farmer not found on site", "Boundary mismatch", "Not agricultural land", "No RSBSA record", "Duplicate / overlap", "Inaccessible", "Ownership dispute", "Other"] },
  { id: "ex2", key: "exception_notes", label: "Notes for validator", type: "text", required: false, active: true, group: "exceptions", help: "Context, person spoken to, landmarks" },
  { id: "ex3", key: "exception_photo", label: "Evidence photo", type: "photo", required: false, active: false, group: "exceptions" },
];

function AdminFields() {
  const [fields, setFields] = useState<FieldDef[]>(INITIAL);
  const [selected, setSelected] = useState<string>(INITIAL[4].id);
  const [collapsed, setCollapsed] = useState<Record<GroupId, boolean>>({ farmer: false, tenure_crop: false, parcel_evidence: false, exceptions: false });

  const sel = fields.find((f) => f.id === selected) ?? fields[0];
  const activeFields = fields.filter((f) => f.active);

  const byGroup = useMemo(() => {
    const m: Record<GroupId, FieldDef[]> = { farmer: [], tenure_crop: [], parcel_evidence: [], exceptions: [] };
    fields.forEach((f) => m[f.group].push(f));
    return m;
  }, [fields]);

  function toggleActive(id: string) {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  }
  function updateSel(patch: Partial<FieldDef>) {
    setFields((fs) => fs.map((f) => (f.id === sel.id ? { ...f, ...patch } : f)));
  }
  function toggleGroup(g: GroupId) {
    setCollapsed((c) => ({ ...c, [g]: !c[g] }));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="text-sm font-semibold leading-tight">Field Configuration</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Admin · {activeFields.length} active across {GROUPS.length} groups
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
            <FolderPlus className="size-3.5" /> New group
          </button>
          <button className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
            Discard
          </button>
          <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            Publish to surveyors
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: grouped field list */}
        <section className="flex w-full max-w-[440px] flex-col border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Fields by group</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Drag to reorder · groups mirror mobile sections
              </div>
            </div>
            <button className="flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
              <Plus className="size-3.5" /> Field
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {GROUPS.map((g) => {
              const items = byGroup[g.id];
              const activeCount = items.filter((i) => i.active).length;
              const open = !collapsed[g.id];
              return (
                <div key={g.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => toggleGroup(g.id)}
                    className="flex w-full items-center gap-2 bg-secondary/40 px-3 py-2 text-left hover:bg-secondary"
                  >
                    {open ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
                    <div className="grid size-6 place-items-center rounded border border-border bg-card">
                      <g.icon className="size-3.5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-semibold">{g.label}</div>
                      <div className="truncate font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">{g.mobileHint}</div>
                    </div>
                    <span className="rounded-full border border-border bg-card px-1.5 py-px font-mono text-[10px] text-muted-foreground">
                      {activeCount}/{items.length}
                    </span>
                  </button>
                  {open && (
                    <ul className="p-2">
                      {items.map((f) => {
                        const meta = TYPE_META[f.type];
                        const isSel = f.id === sel.id;
                        return (
                          <li key={f.id}>
                            <button
                              onClick={() => setSelected(f.id)}
                              className={`group flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors ${
                                isSel ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-secondary"
                              } ${!f.active && "opacity-60"}`}
                            >
                              <GripVertical className="size-4 shrink-0 text-muted-foreground/60" />
                              <div className="grid size-7 place-items-center rounded-md border border-border bg-background">
                                <meta.icon className="size-3.5" strokeWidth={1.75} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-sm font-medium">{f.label}</span>
                                  {f.required && <span className="rounded bg-red-50 px-1 py-px font-mono text-[9px] font-semibold text-red-700">REQ</span>}
                                  {f.source && <span className="rounded bg-secondary px-1 py-px font-mono text-[9px] text-muted-foreground">{f.source}</span>}
                                </div>
                                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {meta.label} · {f.key}
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleActive(f.id); }}
                                className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${f.active ? "bg-primary" : "bg-secondary border border-border"}`}
                              >
                                <span className={`absolute top-0.5 size-3 rounded-full bg-background transition-transform ${f.active ? "translate-x-3.5" : "translate-x-0.5"}`} />
                              </button>
                            </button>
                          </li>
                        );
                      })}
                      <button className="mt-1 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary">
                        <Plus className="size-3" /> Add field to {g.label}
                      </button>
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* MIDDLE: editor */}
        <section className="hidden flex-1 flex-col bg-background lg:flex">
          <div className="border-b border-border bg-card px-5 py-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Editing field</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-sm font-semibold">{sel.label}</div>
              <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                {GROUPS.find((g) => g.id === sel.group)?.label}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-5">
            <div className="grid max-w-xl gap-4">
              <FieldRow label="Group">
                <select
                  value={sel.group}
                  onChange={(e) => updateSel({ group: e.target.value as GroupId })}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
                >
                  {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Label">
                <input value={sel.label} onChange={(e) => updateSel({ label: e.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </FieldRow>
              <FieldRow label="Key (machine name)">
                <input value={sel.key} onChange={(e) => updateSel({ key: e.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </FieldRow>
              <FieldRow label="Help text">
                <input value={sel.help ?? ""} onChange={(e) => updateSel({ help: e.target.value })}
                  placeholder="Shown under the field on the surveyor form"
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </FieldRow>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Type">
                  <select value={sel.type} onChange={(e) => updateSel({ type: e.target.value as FieldType })}
                    className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm">
                    {Object.entries(TYPE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label="Required">
                  <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm">
                    <input type="checkbox" checked={sel.required} onChange={(e) => updateSel({ required: e.target.checked })} />
                    <span>Must be filled before saving</span>
                  </label>
                </FieldRow>
              </div>

              {sel.type === "select" && (
                <FieldRow label="Options">
                  <div className="space-y-1.5 rounded-md border border-border bg-card p-2">
                    {(sel.options ?? []).map((o, i) => (
                      <div key={i} className="flex items-center gap-2 rounded border border-border bg-background px-2 py-1.5">
                        <GripVertical className="size-3.5 text-muted-foreground/60" />
                        <span className="flex-1 text-sm">{o}</span>
                        <button className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                      </div>
                    ))}
                    <button className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-border py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">
                      <Plus className="size-3" /> Add option
                    </button>
                  </div>
                </FieldRow>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: mobile-accurate preview */}
        <aside className="hidden w-[380px] flex-col border-l border-border bg-secondary/40 xl:flex">
          <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
            <Smartphone className="size-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">Mobile preview</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Surveyor tagging sheet</div>
            </div>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-4">
            <div className="w-full max-w-[320px] overflow-hidden rounded-[28px] border-[6px] border-foreground/80 bg-card shadow-lg">
              <div className="flex items-center justify-between bg-foreground/90 px-4 py-1.5 font-mono text-[9px] uppercase text-background">
                <span>9:41</span><span>AEW · LTE</span>
              </div>
              <div className="border-b border-border bg-primary/5 px-4 py-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-primary">PH-IVA-0923</div>
                <div className="text-sm font-semibold">Tag farmer to parcel</div>
              </div>
              <div className="max-h-[520px] overflow-auto px-4 py-3">
                {GROUPS.map((g) => {
                  const items = byGroup[g.id].filter((f) => f.active);
                  if (items.length === 0) return null;
                  return (
                    <div key={g.id} className="mb-4 last:mb-0">
                      <div className="mb-2 flex items-center gap-1.5">
                        <g.icon className="size-3 text-primary" strokeWidth={2} />
                        <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-primary">{g.label}</div>
                      </div>
                      <div className="space-y-2.5 rounded-lg border border-border bg-background p-2.5">
                        {items.map((f) => <PreviewRenderField key={f.id} f={f} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border p-3">
                <button className="h-9 w-full rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  Save tag
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function PreviewRenderField({ f }: { f: FieldDef }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {f.label}
          {f.required && <span className="text-red-600">*</span>}
        </div>
        {f.source && <span className="rounded bg-secondary px-1 py-px font-mono text-[8.5px] text-muted-foreground">{f.source}</span>}
      </div>
      {f.type === "text" && <input className="h-7 w-full rounded-md border border-border bg-card px-2 text-xs" placeholder={f.source ? "Auto-filled" : ""} readOnly={!!f.source} />}
      {f.type === "number" && <input type="number" placeholder="0.00" className="h-7 w-full rounded-md border border-border bg-card px-2 font-mono text-xs" />}
      {f.type === "date" && <input type="date" className="h-7 w-full rounded-md border border-border bg-card px-2 text-xs" />}
      {f.type === "select" && (
        <select className="h-7 w-full rounded-md border border-border bg-card px-1.5 text-xs">
          {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      )}
      {f.type === "photo" && (
        <div className="flex h-14 items-center justify-center rounded-md border border-dashed border-border bg-card">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <Camera className="size-3" /> Capture
          </div>
        </div>
      )}
      {f.type === "gps" && (
        <div className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 font-mono text-[10px] text-muted-foreground">
          <MapPin className="size-3 text-primary" /> 15.0314°N · 120.6820°E
        </div>
      )}
      {f.help && <div className="mt-1 text-[10px] text-muted-foreground">{f.help}</div>}
    </div>
  );
}
