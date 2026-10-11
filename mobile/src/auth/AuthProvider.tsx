import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { deleteToken, getToken, setToken } from "@/lib/tokenStorage";
import type { SessionUser } from "@/types";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "signedOut"; user: null }
  | { status: "signedIn"; user: SessionUser };

interface AuthContextValue {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  const signOut = useCallback(async () => {
    await deleteToken();
    queryClient.clear();
    setState({ status: "signedOut", user: null });
  }, []);

  // All'avvio: se c'è un token salvato, verifica che sia ancora valido.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token) {
        if (!cancelled) setState({ status: "signedOut", user: null });
        return;
      }
      try {
        const { user } = await api<{ user: SessionUser }>("/me");
        if (!cancelled) setState({ status: "signedIn", user });
      } catch {
        await deleteToken();
        if (!cancelled) setState({ status: "signedOut", user: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user } = await api<{ token: string; user: SessionUser }>("/login", {
      method: "POST",
      body: { email, password },
    });
    await setToken(token);
    setState({ status: "signedIn", user });
  }, []);

  const value = useMemo(() => ({ state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro <AuthProvider>");
  return ctx;
}

// Per le schermate sotto (app): lì l'utente è sempre autenticato.
export function useCurrentUser(): SessionUser {
  const { state } = useAuth();
  if (state.status !== "signedIn") throw new Error("Utente non autenticato");
  return state.user;
}
