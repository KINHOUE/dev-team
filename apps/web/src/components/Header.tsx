import { Button } from '@dev-team/design-system';
import type { User } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import InstallPwa from './InstallPwa';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <h1 className="text-lg font-semibold">Mon Budget</h1>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-text-muted md:inline">
              {user.email}
            </span>
          )}
          <InstallPwa />
          <ThemeSwitcher />
          {user && (
            <Button size="sm" variant="ghost" onClick={onLogout}>
              Déconnexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
