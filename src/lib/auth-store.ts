// Mock auth store backed by localStorage. bcryptjs runs in the browser for the prototype.
import bcrypt from "bcryptjs";

export const MODULES = ["dispatcher", "surveyor", "validator", "admin"] as const;
export type ModuleKey = (typeof MODULES)[number];

export type User = {
  userId: string;
  userName: string;
  passwordHash: string;
  fullName: string;
  contactDetails: string;
  email: string;
  roles: ModuleKey[]; // dynamic — user can hold any combination of module roles
  mpin: string; // 6-digit, default "000000"
  dateCreated: string;
  lastLogin: string | null;
  loginAttempt: number;
  status: "active" | "locked" | "disabled";
};

export type Device = {
  deviceId: string;
  label: string; // e.g. "Samsung A14 — Field 03"
  imei: string;
  os: string;
  assignedUserId: string | null;
  status: "pending" | "approved" | "revoked";
  registeredAt: string;
  lastSeen: string | null;
};

const USERS_KEY = "agritag.users";
const DEVICES_KEY = "agritag.devices";
const SESSION_KEY = "agritag.session";
const SEEDED_KEY = "agritag.seeded";

const ROUNDS = 8;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listUsers(): User[] {
  return read<User[]>(USERS_KEY, []);
}
export function listDevices(): Device[] {
  return read<Device[]>(DEVICES_KEY, []);
}
export function saveUsers(u: User[]) { write(USERS_KEY, u); }
export function saveDevices(d: Device[]) { write(DEVICES_KEY, d); }

export function getSession(): { userId: string } | null {
  return read<{ userId: string } | null>(SESSION_KEY, null);
}
export function setSession(s: { userId: string } | null) {
  if (s) write(SESSION_KEY, s);
  else if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}
export function currentUser(): User | null {
  const s = getSession();
  if (!s) return null;
  return listUsers().find((u) => u.userId === s.userId) ?? null;
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}
export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: "not_found" | "wrong_password" | "locked" | "disabled"; attemptsLeft?: number };

export async function attemptLogin(userName: string, password: string): Promise<LoginResult> {
  const users = listUsers();
  const idx = users.findIndex((u) => u.userName.toLowerCase() === userName.trim().toLowerCase());
  if (idx === -1) return { ok: false, reason: "not_found" };
  const u = users[idx];
  if (u.status === "disabled") return { ok: false, reason: "disabled" };
  if (u.status === "locked") return { ok: false, reason: "locked" };
  const match = await verifyPassword(password, u.passwordHash);
  if (!match) {
    u.loginAttempt += 1;
    if (u.loginAttempt >= 5) u.status = "locked";
    users[idx] = u;
    saveUsers(users);
    return { ok: false, reason: "wrong_password", attemptsLeft: Math.max(0, 5 - u.loginAttempt) };
  }
  u.loginAttempt = 0;
  u.lastLogin = new Date().toISOString();
  users[idx] = u;
  saveUsers(users);
  setSession({ userId: u.userId });
  return { ok: true, user: u };
}

export function logout() { setSession(null); }

export async function createUser(input: Omit<User, "userId" | "passwordHash" | "dateCreated" | "lastLogin" | "loginAttempt" | "status" | "mpin"> & { password: string; mpin?: string }) {
  const users = listUsers();
  if (users.some((u) => u.userName.toLowerCase() === input.userName.toLowerCase())) {
    throw new Error("Username already exists");
  }
  const newUser: User = {
    userId: `U-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    userName: input.userName,
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName,
    contactDetails: input.contactDetails,
    email: input.email,
    roles: input.roles,
    mpin: input.mpin ?? "000000",
    dateCreated: new Date().toISOString(),
    lastLogin: null,
    loginAttempt: 0,
    status: "active",
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(userId: string, patch: Partial<Omit<User, "userId" | "passwordHash">>) {
  const users = listUsers();
  const idx = users.findIndex((u) => u.userId === userId);
  if (idx === -1) throw new Error("User not found");
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

export async function resetPassword(userId: string, newPassword: string) {
  const users = listUsers();
  const idx = users.findIndex((u) => u.userId === userId);
  if (idx === -1) throw new Error("User not found");
  users[idx].passwordHash = await hashPassword(newPassword);
  users[idx].loginAttempt = 0;
  users[idx].status = "active";
  saveUsers(users);
}

export function unlockUser(userId: string) {
  updateUser(userId, { status: "active", loginAttempt: 0 });
}
export function deleteUser(userId: string) {
  saveUsers(listUsers().filter((u) => u.userId !== userId));
}

// Devices
export function registerDevice(input: Omit<Device, "deviceId" | "status" | "registeredAt" | "lastSeen">) {
  const devices = listDevices();
  if (devices.some((d) => d.imei === input.imei)) {
    throw new Error("Device IMEI already registered");
  }
  const d: Device = {
    ...input,
    deviceId: `D-${Date.now().toString(36).toUpperCase()}`,
    status: "pending",
    registeredAt: new Date().toISOString(),
    lastSeen: null,
  };
  devices.push(d);
  saveDevices(devices);
  return d;
}
export function updateDevice(deviceId: string, patch: Partial<Device>) {
  const devices = listDevices();
  const idx = devices.findIndex((d) => d.deviceId === deviceId);
  if (idx === -1) throw new Error("Device not found");
  devices[idx] = { ...devices[idx], ...patch };
  saveDevices(devices);
  return devices[idx];
}
export function deleteDevice(deviceId: string) {
  saveDevices(listDevices().filter((d) => d.deviceId !== deviceId));
}

// Seeder — runs once
export async function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEEDED_KEY)) return;
  const seedUsers: Array<Parameters<typeof createUser>[0]> = [
    { userName: "admin", password: "Admin@123", fullName: "Maria Santos", contactDetails: "+63 917 000 0001", email: "admin@da.gov.ph", roles: ["admin"] },
    { userName: "dispatcher", password: "Dispatch@123", fullName: "Juan Dela Cruz", contactDetails: "+63 917 000 0002", email: "dispatcher@da.gov.ph", roles: ["dispatcher"] },
    { userName: "validator", password: "Validate@123", fullName: "Ana Reyes", contactDetails: "+63 917 000 0003", email: "validator@da.gov.ph", roles: ["validator"] },
    { userName: "surveyor", password: "Survey@123", fullName: "Pedro Bautista", contactDetails: "+63 917 000 0004", email: "surveyor@da.gov.ph", roles: ["surveyor"] },
    { userName: "supervisor", password: "Super@123", fullName: "Liza Aquino", contactDetails: "+63 917 000 0005", email: "supervisor@da.gov.ph", roles: ["dispatcher", "validator"] },
  ];
  saveUsers([]);
  for (const s of seedUsers) await createUser(s);
  saveDevices([
    { deviceId: "D-SEED-001", label: "Samsung A14 — Region IV-A · Unit 01", imei: "356938035643809", os: "Android 13", assignedUserId: listUsers().find(u => u.userName === "surveyor")?.userId ?? null, status: "approved", registeredAt: new Date(Date.now() - 86400000 * 7).toISOString(), lastSeen: new Date(Date.now() - 3600000).toISOString() },
    { deviceId: "D-SEED-002", label: "Xiaomi Redmi 12 — Region III · Unit 04", imei: "490154203237518", os: "Android 14", assignedUserId: null, status: "pending", registeredAt: new Date(Date.now() - 86400000).toISOString(), lastSeen: null },
  ]);
  window.localStorage.setItem(SEEDED_KEY, "1");
}

export function resetAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USERS_KEY);
  window.localStorage.removeItem(DEVICES_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SEEDED_KEY);
}

export const ROLE_LABELS: Record<ModuleKey, string> = {
  dispatcher: "Dispatcher",
  surveyor: "Surveyor (AEW)",
  validator: "Validator",
  admin: "Admin",
};

export const ROLE_HOME: Record<ModuleKey, string> = {
  dispatcher: "/dispatcher",
  surveyor: "/app",
  validator: "/validator",
  admin: "/admin/users",
};
