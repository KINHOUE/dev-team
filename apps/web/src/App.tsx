import { useState } from 'react';
import { ThemeProvider } from '@dev-team/design-system';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getStoredTheme } from './lib/storage';
import type { AppModule } from './types';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import TodoScreen from './components/TodoScreen';
import AppNav from './components/AppNav';
import FinanceScreen from './screens/FinanceScreen';

const MODULES: { id: AppModule; label: string }[] = [
  { id: 'finance', label: 'Finances' },
  { id: 'tasks', label: 'Tâches' },
];

function Root() {
  const { user, loading, logout, changeCurrency } = useAuth();
  const [module, setModule] = useState<AppModule>('finance');

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text">
        <main className="mx-auto w-full max-w-2xl px-4 py-6">
          <p className="text-sm text-text-muted">Chargement…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Header user={user} onLogout={logout} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        {user ? (
          <div className="flex flex-col gap-5">
            <AppNav
              variant="primary"
              items={MODULES}
              active={module}
              onChange={setModule}
              className="self-start"
            />
            {module === 'tasks' ? (
              <div className="mx-auto w-full max-w-2xl">
                <TodoScreen />
              </div>
            ) : (
              <FinanceScreen
                currency={user.currency ?? 'XOF'}
                onCurrencyChange={changeCurrency}
              />
            )}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl">
            <AuthScreen />
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={getStoredTheme()}>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}
