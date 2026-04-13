import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AppRole = "admin" | "student";

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> => {
    const timeout = new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallbackValue), timeoutMs);
    });

    return Promise.race([promise, timeout]);
  };

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(),
        5000,
        { data: null, error: null },
      );

      if (error) {
        setRole("student");
        return;
      }

      setRole((data?.role as AppRole) ?? "student");
    } catch {
      setRole("student");
    }
  }, []);

  const syncSession = useCallback(async (session: Session | null) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    try {
      if (currentUser) {
        await fetchRole(currentUser.id);
      } else {
        setRole(null);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchRole]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await syncSession(session);
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncSession(session);
    });

    return () => subscription.unsubscribe();
  }, [syncSession]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
