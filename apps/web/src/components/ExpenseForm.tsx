import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Input, cx } from '@dev-team/design-system';
import type { Category, Expense } from '../types';
import CategoryIcon from './CategoryIcon';
import { centsToInput, currencySymbol, parseAmountToCents, todayInputValue } from '../lib/money';
import {
  createRecognition,
  isVoiceSupported,
  parseVoice,
  type SpeechRecognitionLike,
} from '../lib/voice';

export interface ExpenseFormValue {
  amountCents: number;
  categoryId: string | null;
  date: string;
  note: string | null;
  source: 'manual' | 'voice';
}

interface ExpenseFormProps {
  categories: Category[];
  currency?: string;
  initial?: Expense | null;
  submitLabel?: string;
  onSubmit: (value: ExpenseFormValue) => Promise<void>;
  onCancel?: () => void;
}

export default function ExpenseForm({
  categories,
  currency = 'XOF',
  initial,
  submitLabel = 'Ajouter la dépense',
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState(initial ? centsToInput(initial.amountCents) : '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [date, setDate] = useState(
    initial ? initial.date.slice(0, 10) : todayInputValue(),
  );
  const [note, setNote] = useState(initial?.note ?? '');
  const [source, setSource] = useState<'manual' | 'voice'>(
    initial?.source === 'voice' ? 'voice' : 'manual',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const handleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    if (!isVoiceSupported()) {
      setVoiceError(
        "La dictée n'est pas disponible dans ce navigateur. Utilisez Chrome, Edge ou Safari récent.",
      );
      return;
    }
    const recognition = createRecognition();
    if (!recognition) {
      setVoiceError('Reconnaissance vocale indisponible.');
      return;
    }

    recognitionRef.current = recognition;
    setListening(true);
    setVoiceError(null);
    setTranscript('');

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i += 1) {
        text += `${event.results[i][0].transcript} `;
      }
      text = text.trim();
      setTranscript(text);

      const parsed = parseVoice(text, categories);
      if (parsed.amountCents) {
        setAmount(centsToInput(parsed.amountCents));
      }
      if (parsed.categoryId) {
        setCategoryId(parsed.categoryId);
      }
      if (text) {
        setNote(text);
        setSource('voice');
      }
    };

    recognition.onerror = (event) => {
      const code = event.error ?? '';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setVoiceError('Accès au micro refusé. Autorisez le micro dans le navigateur.');
      } else if (code === 'no-speech') {
        setVoiceError('Aucune parole détectée. Réessayez en parlant plus près du micro.');
      } else if (code !== 'aborted') {
        setVoiceError('Erreur de reconnaissance vocale.');
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  }, [categories, listening]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(amount);
    if (amountCents <= 0) {
      setError('Saisissez un montant supérieur à zéro.');
      return;
    }
    if (!date) {
      setError('Choisissez une date.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        amountCents,
        categoryId: categoryId || null,
        date,
        note: note.trim() ? note.trim() : null,
        source,
      });
      if (!initial) {
        setAmount('');
        setNote('');
        setSource('manual');
        setTranscript('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Montant"
            inputMode="decimal"
            placeholder={`0 ${currencySymbol(currency)}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            trailing={
              <button
                type="button"
                onClick={handleVoice}
                aria-label={listening ? 'Arrêter la dictée' : 'Dicter la dépense'}
                title={listening ? 'Arrêter' : 'Dicter (ex. « 5 000 transport »)'}
                className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  listening
                    ? 'bg-danger-soft text-danger'
                    : 'text-text-muted hover:bg-surface-raised hover:text-text',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <path d="M12 18v3" />
                </svg>
              </button>
            }
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expense-date" className="text-sm font-medium text-text">
              Date
            </label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-category" className="text-sm font-medium text-text">
            Catégorie
          </label>
          <div className="relative">
            <select
              id="expense-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-9 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">Sans catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted">
              ▾
            </span>
          </div>
        </div>

        <Input
          label="Note (optionnel)"
          placeholder="Ex. courses du samedi"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={255}
        />

        {(listening || transcript) && (
          <p className="text-xs text-text-muted" role="status">
            {listening ? '🎙️ Écoute en cours…' : `Entendu : « ${transcript} »`}
          </p>
        )}
        {voiceError && (
          <p className="text-xs text-danger" role="alert">
            {voiceError}
          </p>
        )}
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              Annuler
            </Button>
          )}
          <span className="ml-auto hidden items-center gap-1 text-xs text-text-muted sm:flex">
            <CategoryIcon icon="tag" className="h-3.5 w-3.5" />
            Astuce : dictez « 5 000 taxi » pour remplir automatiquement.
          </span>
        </div>
      </form>
    </Card>
  );
}
