import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import {
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  register as apiRegister,
  updateCurrency as apiUpdateCurrency,
} from '../lib/api';
import { clearStoredUser, getStoredUser, setStoredUser } from '../lib/storage';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changeCurrency: (currency: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // Au chargement, on vérifie la session via le cookie httpOnly.
  useEffect(() => {
    let cancelled = false;
    apiMe()
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
        setStoredUser(res.user);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        clearStoredUser();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuth = useCallback((nextUser: User) => {
    setStoredUser(nextUser);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      applyAuth(res.user);
    },
    [applyAuth],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      // L'inscription renvoie une réponse neutre (201, sans utilisateur) pour ne
      // pas révéler l'existence de l'email. On établit ensuite la session via
      // login (cookie httpOnly).
      await apiRegister(email, password);
      const res = await apiLogin(email, password);
      applyAuth(res.user);
    },
    [applyAuth],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Même si l'appel échoue, on efface la session locale.
    }
    clearStoredUser();
    setUser(null);
  }, []);

  const changeCurrency = useCallback(
    async (currency: string) => {
      const res = await apiUpdateCurrency(currency);
      applyAuth(res.user);
    },
    [applyAuth],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, changeCurrency }),
    [user, loading, login, register, logout, changeCurrency],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() doit être appelé dans un <AuthProvider>.');
  }
  return ctx;
}
