import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import type { User } from '../types';

const TOKEN_KEY = 'todo.token';
const USER_KEY = 'todo.user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /** true pendant la restauration de session au démarrage. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session persistée (SecureStore) au démarrage.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (active && storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);
        }
      } catch {
        // stockage indisponible : on démarre déconnecté.
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = async (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
  };

  const signIn = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await persist(res.token, res.user);
  };

  const signUp = async (email: string, password: string) => {
    // L'inscription renvoie une réponse neutre (201, sans jeton) pour ne pas
    // révéler l'existence de l'email. On établit ensuite la session via login.
    await apiRegister(email, password);
    const res = await apiLogin(email, password);
    await persist(res.token, res.user);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, signIn, signUp, signOut }),
    [user, token, loading],
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
