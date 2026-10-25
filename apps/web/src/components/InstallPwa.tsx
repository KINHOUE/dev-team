import { useEffect, useState } from 'react';
import { Button, Card } from '@dev-team/design-system';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 820;
}

function isIos(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Navigateur intégré (WebView d'une app de messagerie, etc.) : l'installation PWA y est impossible. */
function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/; wv\)/.test(ua)) return true; // Android WebView
  return /FBAN|FBAV|Instagram|Line\/|WhatsApp|Telegram|Twitter/i.test(ua);
}

/**
 * Bouton d'installation PWA.
 * - Si le navigateur expose `beforeinstallprompt` → installation native en un clic.
 * - Sinon (iOS, navigateur sans support) → instructions pas à pas.
 * Masqué si l'app tourne déjà en mode installé (standalone) ou sur ordinateur.
 */
export default function InstallPwa() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setMobile(isMobileDevice());
    setInApp(isInAppBrowser());
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    ) {
      setInstalled(true);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!mobile || installed) return null;

  const install = async () => {
    if (!deferred) {
      setShowHelp((value) => !value);
      return;
    }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div className="relative">
      <Button size="sm" variant="secondary" onClick={() => void install()}>
        Installer
      </Button>

      {showHelp && !deferred && (
        <Card
          padding="sm"
          className="absolute right-0 top-11 z-30 w-72 shadow-lg"
          role="dialog"
          aria-label="Comment installer l'application"
        >
          <p className="mb-2 text-xs font-semibold text-text">
            Installer sur l'écran d'accueil
          </p>
          {inApp ? (
            <div className="space-y-2 text-xs text-text-muted">
              <p className="font-medium text-warning">
                Tu es dans un navigateur intégré (application de messagerie).
              </p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>Touche le menu de ce navigateur, puis « Ouvrir dans Chrome ».</li>
                <li>
                  Ou copie l'adresse <strong className="text-text">web-blond-zeta-0qhsvs6qxj.vercel.app</strong>{' '}
                  et colle-la dans la barre d'adresse de Chrome.
                </li>
                <li>Dans Chrome, menu ⋮ → « Installer l'application ».</li>
              </ol>
            </div>
          ) : isIos() ? (
            <ol className="list-decimal space-y-1 pl-4 text-xs text-text-muted">
              <li>Ouvre cette page dans Safari.</li>
              <li>Touche le bouton Partager (carré avec flèche).</li>
              <li>Choisis « Sur l'écran d'accueil ».</li>
              <li>Touche « Ajouter ».</li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-1 pl-4 text-xs text-text-muted">
              <li>Ouvre cette page dans Chrome (pas dans une application de messagerie).</li>
              <li>Touche le menu ⋮ en haut à droite.</li>
              <li>
                Choisis « Installer l'application » — ou, selon la version, « Ajouter à l'écran
                d'accueil ».
              </li>
              <li>Confirme.</li>
            </ol>
          )}
          <p className="mt-2 text-[11px] text-text-muted">
            Astuce : recharge la page une fois si l'option n'apparaît pas — le service worker
            doit être actif.
          </p>
        </Card>
      )}
    </div>
  );
}
