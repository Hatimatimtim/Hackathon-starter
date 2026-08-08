import fs from "fs";
import path from "path";

export type UserRole = "CISO" | "Compliance Auditor" | "Security Analyst" | "System Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSION_FILE = path.join(DATA_DIR, "session.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error("Failed to create data directory:", e);
    }
  }
}

// Pre-seeded demo users
const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: "usr-ciso-01",
    name: "Elena Rostova",
    email: "ciso@enterprise.com",
    role: "CISO",
    passwordHash: "password123",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-auditor-02",
    name: "Marcus Vance",
    email: "auditor@enterprise.com",
    role: "Compliance Auditor",
    passwordHash: "password123",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-analyst-03",
    name: "Sarah Chen",
    email: "analyst@enterprise.com",
    role: "Security Analyst",
    passwordHash: "password123",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

declare global {
  var usersStore: (User & { passwordHash: string })[] | undefined;
  var currentSessionStore: AuthSession | null | undefined;
}

if (!globalThis.usersStore) {
  ensureDataDir();
  if (fs.existsSync(USERS_FILE)) {
    try {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      globalThis.usersStore = JSON.parse(data);
    } catch (e) {
      console.error("Error reading users.json:", e);
      globalThis.usersStore = DEFAULT_USERS;
    }
  } else {
    globalThis.usersStore = DEFAULT_USERS;
    saveUsersToDisk();
  }
}

if (globalThis.currentSessionStore === undefined) {
  ensureDataDir();
  if (fs.existsSync(SESSION_FILE)) {
    try {
      const data = fs.readFileSync(SESSION_FILE, "utf-8");
      globalThis.currentSessionStore = JSON.parse(data);
    } catch (e) {
      globalThis.currentSessionStore = null;
    }
  } else {
    // Default to logged out state (null) for new visitors
    globalThis.currentSessionStore = null;
    saveSessionToDisk();
  }
}

function saveUsersToDisk() {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(globalThis.usersStore || [], null, 2));
  } catch (e) {
    console.error("Failed to save users to disk:", e);
  }
}

function saveSessionToDisk() {
  ensureDataDir();
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(globalThis.currentSessionStore || null, null, 2));
  } catch (e) {
    console.error("Failed to save session to disk:", e);
  }
}

export function getAllUsers(): User[] {
  return (globalThis.usersStore || []).map(({ passwordHash, ...user }) => user);
}

export function findUserByEmail(email: string) {
  return globalThis.usersStore?.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): { user: User; session: AuthSession } {
  if (!globalThis.usersStore) globalThis.usersStore = DEFAULT_USERS;

  const existing = findUserByEmail(data.email);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: data.email.toLowerCase(),
    role: data.role,
    passwordHash: data.password, // Simple hash/storage for demo mode
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
    createdAt: new Date().toISOString(),
  };

  globalThis.usersStore.push(newUser);
  saveUsersToDisk();

  const publicUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    avatarUrl: newUser.avatarUrl,
    createdAt: newUser.createdAt,
  };

  const session: AuthSession = {
    user: publicUser,
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  globalThis.currentSessionStore = session;
  saveSessionToDisk();

  return { user: publicUser, session };
}

export function validateLogin(email: string, password: string): { user: User; session: AuthSession } {
  const userRecord = findUserByEmail(email);

  if (!userRecord) {
    throw new Error("Invalid email or password.");
  }

  if (userRecord.passwordHash !== password) {
    throw new Error("Invalid email or password.");
  }

  const publicUser: User = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    avatarUrl: userRecord.avatarUrl,
    createdAt: userRecord.createdAt,
  };

  const session: AuthSession = {
    user: publicUser,
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  globalThis.currentSessionStore = session;
  saveSessionToDisk();

  return { user: publicUser, session };
}

export function resetUserPassword(email: string, newPassword: string): User {
  if (!globalThis.usersStore) globalThis.usersStore = DEFAULT_USERS;

  const userIndex = globalThis.usersStore.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (userIndex === -1) {
    throw new Error("No account associated with this email address was found.");
  }

  globalThis.usersStore[userIndex].passwordHash = newPassword;
  saveUsersToDisk();

  const { passwordHash, ...publicUser } = globalThis.usersStore[userIndex];
  return publicUser;
}

export function getCurrentSession(): AuthSession | null {
  return globalThis.currentSessionStore || null;
}

export function clearSession(): void {
  globalThis.currentSessionStore = null;
  saveSessionToDisk();
}
