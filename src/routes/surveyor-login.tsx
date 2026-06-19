import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { attemptLogin, ensureSeeded, listDevices, registerDevice, currentUser } from "@/lib/auth-store";
import { Smartphone, Lock, User as UserIcon, AlertCircle, CheckCircle2, ShieldCheck, Fingerprint } from "lucide-react";

export const Route = createFileRoute("/surveyor-login")({
  head: () => ({ meta: [{ title: "Surveyor Sign in — AgriTag Mobile" }] }),
  component: SurveyorLogin,
});

const DEVICE_KEY = "agritag.mobile.deviceId"; // simulated device fingerprint

function getOrCreateDeviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = "IMEI-" + Math.floor(100000000000000 + Math.random() * 800000000000000).toString();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function SurveyorLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"device" | "login">("device");
  const [imei, setImei] = useState("");
  const [deviceStatus, setDeviceStatus] = useState<"unregistered" | "pending" | "approved" | "revoked">("unregistered");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success" | "warn" | "info"; text: string } | null>(null);

  useEffect(() => {
    ensureSeeded();
    const fp = getOrCreateDeviceFingerprint();
    setImei(fp);
    const dev = listDevices().find((d) => d.imei === fp);
    if (!dev) setDeviceStatus("unregistered");
    else setDeviceStatus(dev.status);
    if (dev && dev.status === "approved") setStep("login");
  }, []);

  function onRegister(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const label = (form.elements.namedItem("label") as HTMLInputElement).value;
    try {
      registerDevice({ label, imei, os: "Android", assignedUserId: null });
      setDeviceStatus("pending");
      setMsg({ tone: "info", text: "Device registered. Waiting for admin approval before you can sign in." });
    } catch (err) {
      setMsg({ tone: "error", text: (err as Error).message });
    }
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const dev = listDevices().find((d) => d.imei === imei);
    if (!dev || dev.status !== "approved") {
      setBusy(false);
      setMsg({ tone: "error", text: "This device is not approved for field use. Contact your admin." });
      return;
    }
    const res = await attemptLogin(userName, password);
    setBusy(false);
    if (res.ok) {
      if (!res.user.roles.includes("surveyor")) {
        setMsg({ tone: "error", text: "This account does not have the Surveyor role." });
        return;
      }
      setMsg({ tone: "success", text: `Welcome, ${res.user.fullName}. Loading field map…` });
      setTimeout(() => navigate({ to: "/app" }), 700);
      return;
    }
    if (res.reason === "not_found") setMsg({ tone: "error", text: "User not found." });
    else if (res.reason === "wrong_password") setMsg({ tone: "warn", text: `Incorrect password. ${res.attemptsLeft ?? 0} attempt(s) left.` });
    else if (res.reason === "locked") setMsg({ tone: "error", text: "Account locked. Contact admin." });
    else setMsg({ tone: "error", text: "Account disabled." });
    void currentUser();
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_148)] grid place-items-center px-4 py-8">
      <div className="w-full max-w-[380px]">
        {/* Phone frame */}
        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4" />
              <span className="text-xs font-medium">AgriTag Field</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider opacity-80">MD3 · v0.1</span>
          </div>

          <div className="px-5 pb-6 pt-5">
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Fingerprint className="size-4 text-primary" />
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Device fingerprint</div>
                <div className="truncate text-xs font-medium">{imei || "…"}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                deviceStatus === "approved" ? "bg-emerald-100 text-emerald-700" :
                deviceStatus === "pending" ? "bg-amber-100 text-amber-700" :
                deviceStatus === "revoked" ? "bg-red-100 text-red-700" :
                "bg-muted text-muted-foreground"
              }`}>{deviceStatus}</span>
            </div>

            {step === "device" || deviceStatus !== "approved" ? (
              <>
                <h1 className="text-base font-semibold tracking-tight">Register this device</h1>
                <p className="mt-1 text-xs text-muted-foreground">For security, every field device must be approved by your admin before you can sign in.</p>

                {deviceStatus === "unregistered" ? (
                  <form onSubmit={onRegister} className="mt-4 space-y-3">
                    <label className="block">
                      <span className="text-[11px] font-medium text-muted-foreground">Device label</span>
                      <input
                        name="label"
                        required
                        placeholder="e.g. Samsung A14 — Region IV-A · Unit 07"
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </label>
                    <button className="w-full rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground">
                      Register device
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>Device is <b>{deviceStatus}</b>. Ask an admin to approve it from Admin → Devices, then return to sign in.</span>
                  </div>
                )}
                {deviceStatus === "approved" && (
                  <button onClick={() => setStep("login")} className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-sm">Continue to sign in</button>
                )}
              </>
            ) : (
              <>
                <h1 className="text-base font-semibold tracking-tight">Surveyor sign in</h1>
                <p className="mt-1 text-xs text-muted-foreground">Device approved. Sign in to start tagging.</p>
                <form onSubmit={onLogin} className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-[11px] font-medium text-muted-foreground">Username</span>
                    <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                      <UserIcon className="size-4 text-muted-foreground" />
                      <input value={userName} onChange={(e) => setUserName(e.target.value)} required autoComplete="username" className="w-full bg-transparent text-sm outline-none" />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-muted-foreground">Password</span>
                    <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                      <Lock className="size-4 text-muted-foreground" />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full bg-transparent text-sm outline-none" />
                    </div>
                  </label>
                  <button disabled={busy} className="w-full rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                    {busy ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </>
            )}

            {msg && (
              <div className={`mt-4 flex gap-2 rounded-md border px-3 py-2 text-xs ${
                msg.tone === "error" ? "border-red-200 bg-red-50 text-red-700" :
                msg.tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-800" :
                msg.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                "border-sky-200 bg-sky-50 text-sky-800"
              }`}>
                {msg.tone === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/login" className="hover:text-foreground">← Web sign-in</Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(DEVICE_KEY);
                window.location.reload();
              }
            }}
            className="hover:text-foreground"
          >
            Simulate a new device
          </button>
        </div>
      </div>
    </div>
  );
}
