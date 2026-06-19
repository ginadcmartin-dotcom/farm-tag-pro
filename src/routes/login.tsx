import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { attemptLogin, ensureSeeded, ROLE_HOME, type ModuleKey } from "@/lib/auth-store";
import { Lock, User as UserIcon, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — AgriTag" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success" | "warn"; text: string } | null>(null);

  useEffect(() => { ensureSeeded(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await attemptLogin(userName, password);
    setBusy(false);
    if (res.ok) {
      setMsg({ tone: "success", text: `Welcome, ${res.user.fullName}. Redirecting…` });
      const primary: ModuleKey = res.user.roles[0] ?? "dispatcher";
      setTimeout(() => navigate({ to: ROLE_HOME[primary] }), 600);
      return;
    }
    if (res.reason === "not_found") setMsg({ tone: "error", text: "No user found with that username." });
    else if (res.reason === "wrong_password") setMsg({ tone: "warn", text: `Incorrect password. ${res.attemptsLeft ?? 0} attempt(s) left before lockout.` });
    else if (res.reason === "locked") setMsg({ tone: "error", text: "Account locked after 5 failed attempts. Contact your administrator." });
    else if (res.reason === "disabled") setMsg({ tone: "error", text: "This account is disabled." });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <div className="size-3 rounded-[2px] bg-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">AgriTag Console</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Department of Agriculture</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your DA-issued account.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Username</span>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30">
                <UserIcon className="size-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Password</span>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30">
                <Lock className="size-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-transparent text-sm outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {msg && (
              <div className={`flex gap-2 rounded-md border px-3 py-2 text-xs ${
                msg.tone === "error" ? "border-red-200 bg-red-50 text-red-700" :
                msg.tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-800" :
                "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}>
                {msg.tone === "success" ? <CheckCircle2 className="size-4 shrink-0" /> :
                 msg.tone === "warn" ? <ShieldAlert className="size-4 shrink-0" /> :
                 <AlertCircle className="size-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight className="size-3.5" />
            </button>
          </form>

          <div className="mt-5 rounded-md border border-dashed border-border bg-secondary/40 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Seeded accounts (mockup)</div>
            <ul className="mt-2 grid gap-1 text-[11px] text-muted-foreground">
              <li><b className="text-foreground">admin</b> / Admin@123</li>
              <li><b className="text-foreground">dispatcher</b> / Dispatch@123</li>
              <li><b className="text-foreground">validator</b> / Validate@123</li>
              <li><b className="text-foreground">surveyor</b> / Survey@123</li>
              <li><b className="text-foreground">supervisor</b> / Super@123 (dispatcher + validator)</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to hub</Link>
          <Link to="/surveyor-login" className="hover:text-foreground">Surveyor mobile sign-in →</Link>
        </div>
      </div>
    </div>
  );
}
