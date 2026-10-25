import { useState, type FormEvent } from 'react';
import { Button, Input } from '@dev-team/design-system';
import { fromLocalInputValue } from '../lib/datetime';

interface TaskFormProps {
  onSubmit: (title: string, dueAt?: string | null) => Promise<void>;
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed, fromLocalInputValue(dueAt));
      setTitle('');
      setDueAt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Input
          label="Nouvelle tâche"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Qu'avez-vous à faire ?"
          error={error ?? undefined}
        />
      </div>
      <div className="w-full sm:w-44">
        <Input
          label="Échéance (optionnel)"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={submitting || !title.trim()}>
        Ajouter
      </Button>
    </form>
  );
}
