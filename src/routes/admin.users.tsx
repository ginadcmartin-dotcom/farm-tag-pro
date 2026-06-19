import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  listUsers, createUser, updateUser, deleteUser, unlockUser, resetPassword,
  ensureSeeded, resetAll, MODULES, ROLE_LABELS, type User, type ModuleKey,
} from "@/lib/auth-store";
import { Plus, Search, ShieldAlert, KeyRound, Unlock, Trash2, X, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Management — AgriTag Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<ModuleKey | "all">("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);

  function refresh() { setUsers(listUsers()); }
  useEffect(() => { ensureSeeded().then(refresh); }, []);

  const filtered = useMemo(() => users.filter((u) => {
    const matchesQ = !q || [u.userName, u.fullName, u.email, u.contactDetails].some((f) => f.toLowerCase().includes(q.toLowerCase()));
    const matchesR = roleFilter === "all" || u.roles.includes(roleFilter);
    return matchesQ && matchesR;
  }), [users, q, roleFilter]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Hub</Link>
            <div>
              <div className="text-sm font-semibold tracking-tight">User Management</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Admin · {users.length} accounts</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/devices" className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">Devices →</Link>
            <button
              onClick={() => { if (confirm("Reset all mock users & devices to seed data?")) { resetAll(); ensureSeeded().then(refresh); } }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent"
            >
              <RefreshCw className="size-3" /> Re-seed
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-3.5" /> New user
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search username, name, email…" className="w-64 bg-transparent text-sm outline-none" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as ModuleKey | "all")} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <option value="all">All roles</option>
            {MODULES.map((m) => <option key={m} value={m}>{ROLE_LABELS[m]}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">UserID</th>
                <th className="px-3 py-2 text-left font-medium">Username</th>
                <th className="px-3 py-2 text-left font-medium">Full name</th>
                <th className="px-3 py-2 text-left font-medium">Contact</th>
                <th className="px-3 py-2 text-left font-medium">Roles</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Attempts</th>
                <th className="px-3 py-2 text-left font-medium">Last login</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.userId} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{u.userId}</td>
                  <td className="px-3 py-2 font-medium">{u.userName}</td>
                  <td className="px-3 py-2">{u.fullName}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    <div>{u.email}</div>
                    <div>{u.contactDetails}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{ROLE_LABELS[r]}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      u.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      u.status === "locked" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"
                    }`}>{u.status}</span>
                  </td>
                  <td className="px-3 py-2 text-xs">{u.loginAttempt}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {u.status === "locked" && (
                        <button onClick={() => { unlockUser(u.userId); refresh(); }} title="Unlock" className="rounded p-1.5 hover:bg-accent">
                          <Unlock className="size-3.5" />
                        </button>
                      )}
                      <button onClick={() => setResetting(u)} title="Reset password" className="rounded p-1.5 hover:bg-accent">
                        <KeyRound className="size-3.5" />
                      </button>
                      <button onClick={() => setEditing(u)} title="Edit" className="rounded p-1.5 hover:bg-accent">
                        <ShieldAlert className="size-3.5" />
                      </button>
                      <button onClick={() => { if (confirm(`Delete ${u.userName}?`)) { deleteUser(u.userId); refresh(); } }} title="Delete" className="rounded p-1.5 text-red-600 hover:bg-red-50">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">No users match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {creating && <UserForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); refresh(); }} />}
      {editing && <UserForm user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
      {resetting && <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} onSaved={() => { setResetting(null); refresh(); }} />}
    </div>
  );
}

function UserForm({ user, onClose, onSaved }: { user?: User; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    userName: user?.userName ?? "",
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    contactDetails: user?.contactDetails ?? "",
    password: "",
    mpin: user?.mpin ?? "000000",
    roles: (user?.roles ?? []) as ModuleKey[],
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (form.roles.length === 0) { setErr("Pick at least one role."); return; }
    if (!user && form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (!/^\d{6}$/.test(form.mpin)) { setErr("MPIN must be exactly 6 digits."); return; }
    setBusy(true);
    try {
      if (user) {
        updateUser(user.userId, {
          userName: form.userName, fullName: form.fullName, email: form.email,
          contactDetails: form.contactDetails, roles: form.roles, mpin: form.mpin,
        });
      } else {
        await createUser({
          userName: form.userName, fullName: form.fullName, email: form.email,
          contactDetails: form.contactDetails, password: form.password, roles: form.roles, mpin: form.mpin,
        });
      }
      onSaved();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  function toggleRole(r: ModuleKey) {
    setForm((f) => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r] }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{user ? "Edit user" : "New user"}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-accent"><X className="size-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Username"><input required value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} className="input" /></Field>
          <Field label="Full name"><input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" /></Field>
          <Field label="Email"><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
          <Field label="Contact details"><input required value={form.contactDetails} onChange={(e) => setForm({ ...form, contactDetails: e.target.value })} className="input" /></Field>
          {!user && <Field label="Password"><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" /></Field>}
          <Field label="MPIN (6 digits)"><input maxLength={6} value={form.mpin} onChange={(e) => setForm({ ...form, mpin: e.target.value })} className="input font-mono" /></Field>
        </div>
        <div className="mt-4">
          <div className="text-xs font-medium text-muted-foreground">Roles (dynamic — pick all modules this user can access)</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODULES.map((m) => {
              const on = form.roles.includes(m);
              return (
                <button key={m} type="button" onClick={() => toggleRole(m)}
                  className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"}`}>
                  {ROLE_LABELS[m]}
                </button>
              );
            })}
          </div>
        </div>
        {err && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{err}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancel</button>
          <button disabled={busy} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {busy ? "Saving…" : user ? "Save changes" : "Create user"}
          </button>
        </div>
        <style>{`.input{margin-top:.25rem;width:100%;border:1px solid hsl(var(--border));background:transparent;border-radius:.375rem;padding:.5rem .75rem;font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px oklch(0.52 0.13 148 / .25)}`}</style>
      </form>
    </div>
  );
}

function ResetPasswordDialog({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return;
    setBusy(true);
    await resetPassword(user.userId, pw);
    setBusy(false);
    onSaved();
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Reset password</h2>
        <p className="mt-1 text-xs text-muted-foreground">For <b>{user.userName}</b>. The bcrypt hash will be regenerated and lockout cleared.</p>
        <input type="password" placeholder="New password (min 6 chars)" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-3 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none" />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancel</button>
          <button disabled={busy || pw.length < 6} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60">{busy ? "Resetting…" : "Reset password"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
