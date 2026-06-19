import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listDevices, listUsers, updateDevice, deleteDevice, ensureSeeded, type Device } from "@/lib/auth-store";
import { Search, CheckCircle2, Ban, Trash2, Smartphone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/devices")({
  head: () => ({ meta: [{ title: "Registered Devices — AgriTag Admin" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Device["status"]>("all");

  function refresh() { setDevices(listDevices()); }
  useEffect(() => { ensureSeeded().then(refresh); }, []);

  const users = listUsers();
  const usersById = useMemo(() => Object.fromEntries(users.map((u) => [u.userId, u])), [users]);
  const filtered = devices.filter((d) => {
    const matchesQ = !q || [d.label, d.imei, d.deviceId].some((f) => f.toLowerCase().includes(q.toLowerCase()));
    const matchesS = statusFilter === "all" || d.status === statusFilter;
    return matchesQ && matchesS;
  });

  const counts = {
    pending: devices.filter(d => d.status === "pending").length,
    approved: devices.filter(d => d.status === "approved").length,
    revoked: devices.filter(d => d.status === "revoked").length,
  };

  function approve(d: Device) { updateDevice(d.deviceId, { status: "approved" }); refresh(); }
  function revoke(d: Device) { updateDevice(d.deviceId, { status: "revoked" }); refresh(); }
  function assign(d: Device, userId: string) { updateDevice(d.deviceId, { assignedUserId: userId || null }); refresh(); }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Hub</Link>
            <div>
              <div className="text-sm font-semibold tracking-tight">Registered Devices</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Admin · MDM lite</div>
            </div>
          </div>
          <Link to="/admin/users" className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">← Users</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Pending approval" value={counts.pending} tone="amber" icon={Smartphone} />
          <Stat label="Approved & active" value={counts.approved} tone="emerald" icon={ShieldCheck} />
          <Stat label="Revoked" value={counts.revoked} tone="red" icon={Ban} />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search label, IMEI, ID…" className="w-72 bg-transparent text-sm outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | Device["status"])} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Device</th>
                <th className="px-3 py-2 text-left font-medium">IMEI / Fingerprint</th>
                <th className="px-3 py-2 text-left font-medium">OS</th>
                <th className="px-3 py-2 text-left font-medium">Assigned to</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Registered</th>
                <th className="px-3 py-2 text-left font-medium">Last seen</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.deviceId} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-medium">{d.label}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{d.deviceId}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{d.imei}</td>
                  <td className="px-3 py-2 text-xs">{d.os}</td>
                  <td className="px-3 py-2">
                    <select value={d.assignedUserId ?? ""} onChange={(e) => assign(d, e.target.value)} className="rounded-md border border-border bg-card px-2 py-1 text-xs">
                      <option value="">— unassigned —</option>
                      {users.filter(u => u.roles.includes("surveyor")).map((u) => (
                        <option key={u.userId} value={u.userId}>{u.fullName} ({u.userName})</option>
                      ))}
                    </select>
                    {d.assignedUserId && usersById[d.assignedUserId] && (
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{usersById[d.assignedUserId].email}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      d.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                      d.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(d.registeredAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{d.lastSeen ? new Date(d.lastSeen).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {d.status !== "approved" && (
                        <button onClick={() => approve(d)} title="Approve" className="rounded p-1.5 text-emerald-700 hover:bg-emerald-50">
                          <CheckCircle2 className="size-3.5" />
                        </button>
                      )}
                      {d.status !== "revoked" && (
                        <button onClick={() => revoke(d)} title="Revoke" className="rounded p-1.5 text-amber-700 hover:bg-amber-50">
                          <Ban className="size-3.5" />
                        </button>
                      )}
                      <button onClick={() => { if (confirm("Delete device?")) { deleteDevice(d.deviceId); refresh(); } }} title="Delete" className="rounded p-1.5 text-red-600 hover:bg-red-50">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">No devices match. New device registrations appear here as <b>pending</b>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, tone, icon: Icon }: { label: string; value: number; tone: "amber" | "emerald" | "red"; icon: React.ComponentType<{ className?: string }> }) {
  const map = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${map[tone]}`}>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      </div>
      <Icon className="size-6 opacity-70" />
    </div>
  );
}
