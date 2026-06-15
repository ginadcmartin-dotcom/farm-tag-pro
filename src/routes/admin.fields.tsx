import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, GripVertical, Plus, Type, Hash, Calendar,
  ListChecks, Camera, MapPin, Trash2, Eye,
} from "lucide-react";

export const Route = createFileRoute("/admin/fields")({
  head: () => ({
    meta: [
      { title: "Field Configuration · AgriTag Admin" },
      { name: "description", content: "Configure dynamic fields surveyors fill out per farmer-parcel tag." },
    ],
  }),
  component: AdminFields,
});

type FieldType = "text" | "number" | "date" | "select" | "photo" | "gps";
type FieldDef = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  active: boolean;
  help?: string;
  options?: string[];
};

const TYPE_META: Record<FieldType, { label: string; icon: typeof Type }> = {
  text: { label: "Text", icon: Type },
  number: { label: "Number", icon: Hash },
  date: { label: "Date", icon: Calendar },
  select: { label: "Select", icon: ListChecks },
  photo: { label: "Photo", icon: Camera },
  gps: { label: "GPS", icon: MapPin },
};

const INITIAL: FieldDef[] = [
  { id: "1", key: "tenure", label: "Tenure status", type: "select", required: true, active: true, options: ["Owner", "Tenant", "Leaseholder", "Tiller", "Caretaker"], help: "Core. Always shown." },
  { id: "2", key: "crop_type", label: "Crop type", type: "select", required: true, active: true, options: ["Rice (Inbred)", "Rice (Hybrid)", "Corn", "Sugarcane"] },
  { id: "3", key: "area_ha", label: "Tilled area (ha)", type: "number", required: true, active: true, help: "Hectares, two decimals" },
  { id: "4", key: "photo", label: "Parcel boundary photo", type: "photo", required: true, active: true },
  { id: "5", key: "gps", label: "GPS pin at tagging", type: "gps", required: false, active: true, help: "Auto-captured from device" },
  { id: "6", key: "irrig_source", label: "Irrigation source", type: "select", required: false, active: true, options: ["NIA", "Communal", "Deepwell", "Rainfed"] },
  { id: "7", key: "remarks", label: "Surveyor remarks", type: "text", required: false, active: false },
];

function AdminFields() {
  const [fields, setFields] = useState<FieldDef[]>(INITIAL);
  const [selected, setSelected] = useState<string>(INITIAL[1].id);

  const sel = fields.find((f) => f.id === selected) ?? fields[0];
  const activeFields = fields.filter((f) => f.active);

  function toggleActive(id: string) {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  }

  function updateSel(patch: Partial<FieldDef>) {
    setFields((fs) => fs.map((f) => (f.id === sel.id ? { ...f, ...patch } : f)));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="text-sm font-semibold leading-tight">Field Configuration</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Admin · Surveyor tagging form</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
            Discard
          </button>
          <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            Publish to surveyors
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: field list */}
        <section className="flex w-full max-w-[420px] flex-col border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Fields</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {activeFields.length} active · drag to reorder
              </div>
            </div>
            <button className="flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
              <Plus className="size-3.5" /> Add field
            </button>
          </div>
          <ul className="flex-1 overflow-auto p-2">
            {fields.map((f) => {
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
                      <meta.icon className="size-3.5 text-foreground" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{f.label}</span>
                        {f.required && (
                          <span className="rounded bg-red-50 px-1 py-px font-mono text-[9px] font-semibold text-red-700">REQ</span>
                        )}
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
          </ul>
        </section>

        {/* MIDDLE: editor */}
        <section className="hidden flex-1 flex-col bg-background lg:flex">
          <div className="border-b border-border bg-card px-5 py-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Editing field</div>
            <div className="mt-1 text-sm font-semibold">{sel.label}</div>
          </div>
          <div className="flex-1 overflow-auto p-5">
            <div className="grid max-w-xl gap-4">
              <FieldRow label="Label">
                <input
                  value={sel.label}
                  onChange={(e) => updateSel({ label: e.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </FieldRow>
              <FieldRow label="Key (machine name)">
                <input
                  value={sel.key}
                  onChange={(e) => updateSel({ key: e.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </FieldRow>
              <FieldRow label="Help text">
                <input
                  value={sel.help ?? ""}
                  onChange={(e) => updateSel({ help: e.target.value })}
                  placeholder="Shown under the field on the surveyor form"
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </FieldRow>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Type">
                  <select
                    value={sel.type}
                    onChange={(e) => updateSel({ type: e.target.value as FieldType })}
                    className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
                  >
                    {Object.entries(TYPE_META).map(([k, m]) => (
                      <option key={k} value={k}>{m.label}</option>
                    ))}
                  </select>
                </FieldRow>
                <FieldRow label="Required">
                  <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={sel.required}
                      onChange={(e) => updateSel({ required: e.target.checked })}
                    />
                    <span>Must be filled before saving tag</span>
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
                        <button className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    <button className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-border py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">
                      <Plus className="size-3" /> Add option
                    </button>
                  </div>
                </FieldRow>
              )}

              <FieldRow label="Tenure scoping (optional)">
                <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-card p-2">
                  {["Owner", "Tenant", "Leaseholder", "Tiller", "Caretaker"].map((t) => (
                    <button
                      key={t}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </FieldRow>
            </div>
          </div>
        </section>

        {/* RIGHT: live preview */}
        <aside className="hidden w-[360px] flex-col border-l border-border bg-secondary/40 xl:flex">
          <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
            <Eye className="size-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">Live preview</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Surveyor tagging form
              </div>
            </div>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-5">
            <div className="w-full max-w-[300px] rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">PH-IVA-0923</div>
                <div className="text-sm font-semibold">Tag farmer to parcel</div>
              </div>
              <div className="space-y-3">
                <PreviewField label="Farmer (RSBSA ID)" placeholder="03-14-02-001-XXXX" />
                {activeFields.map((f) => (
                  <PreviewRenderField key={f.id} f={f} />
                ))}
              </div>
              <button className="mt-4 h-9 w-full rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                Save tag
              </button>
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
      <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function PreviewField({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <input placeholder={placeholder} className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs" />
    </div>
  );
}

function PreviewRenderField({ f }: { f: FieldDef }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {f.label}
        {f.required && <span className="text-red-600">*</span>}
      </div>
      {f.type === "text" && <input className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs" />}
      {f.type === "number" && <input type="number" placeholder="0.00" className="h-8 w-full rounded-md border border-border bg-background px-2.5 font-mono text-xs" />}
      {f.type === "date" && <input type="date" className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs" />}
      {f.type === "select" && (
        <select className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs">
          {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      )}
      {f.type === "photo" && (
        <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-border bg-background">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <Camera className="size-3" /> Capture
          </div>
        </div>
      )}
      {f.type === "gps" && (
        <div className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 font-mono text-[10px] text-muted-foreground">
          <MapPin className="size-3 text-primary" /> 15.0314°N · 120.6820°E
        </div>
      )}
      {f.help && <div className="mt-1 text-[10px] text-muted-foreground">{f.help}</div>}
    </div>
  );
}
