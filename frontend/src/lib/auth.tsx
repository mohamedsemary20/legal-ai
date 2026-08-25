import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const TOKEN_KEY = "app-token";
export const DRAFT_KEY = "app-draft-input";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture_url?: string | null;
};

type Ctx = {
  token: string | null;
  user: AuthUser | null;
  /** True until we know whether an existing token is still valid */
  initializing: boolean;
  signInWithGoogleCredential: (credential: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState<boolean>(!!readToken());

  useEffect(() => {
    let cancelled = false;
    const t = readToken();
    if (!t) {
      setInitializing(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env["VITE_API_URL"] ?? "http://localhost:8000"}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${t}` },
          },
        );
        if (!res.ok) throw new Error();
        const u = await res.json();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) {
          clearToken();
          setToken(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signInWithGoogleCredential(credential: string) {
    const res = await fetch(
      `${import.meta.env["VITE_API_URL"] ?? "http://localhost:8000"}/api/auth/google`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      },
    );
    if (!res.ok) {
      let detail = "Sign-in failed";
      try {
        const j = await res.json();
        if (typeof j?.detail === "string") detail = j.detail;
      } catch {
        /* ignore */
      }
      throw new Error(detail);
    }
    const data = (await res.json()) as { access_token: string; user: AuthUser };
    try {
      localStorage.setItem(TOKEN_KEY, data.access_token);
    } catch {
      /* ignore */
    }
    setToken(data.access_token);
    setUser(data.user);
  }

  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  function signOut() {
    clearToken();
    setToken(null);
    setUser(null);
    window.location.href = "/signin";
  }

  return (
    <AuthContext.Provider
      value={{ token, user, initializing, signInWithGoogleCredential, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Read the stored token for plain fetch calls in api.ts */
export function getStoredToken(): string | null {
  return readToken();
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
