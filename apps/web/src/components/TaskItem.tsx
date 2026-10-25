import { useState, type FormEvent } from 'react';
import { Badge, Button, Input } from '@dev-team/design-system';
import type { Task } from '../types';
import {
  formatDateTime,
  fromLocalInputValue,
  toLocalInputValue,
} from '../lib/datetime';

function isOverdue(task: Task): boolean {
  if (!task.dueAt || task.done) return false;
  return new Date(task.dueAt).getTime() < Date.now();
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string, dueAt?: string | null) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [draftDueAt, setDraftDueAt] = useState(toLocalInputValue(task.dueAt));

  const startEdit = () => {
    setDraft(task.title);
    setDraftDueAt(toLocalInputValue(task.dueAt));
    setEditing(true);
  };

  const submitEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }
    const dueUnchanged = draftDueAt === toLocalInputValue(task.dueAt);
    const dueAt = dueUnchanged ? undefined : fromLocalInputValue(draftDueAt);
    if (trimmed === task.title && dueUnchanged) {
      setEditing(false);
      return;
    }
    onEdit(task.id, trimmed, dueAt);
    setEditing(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitEdit();
  };

  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="task-checkbox mt-1 h-4 w-4 shrink-0 cursor-pointer"
        aria-label={task.done ? 'Marquer à faire' : 'Marquer faite'}
      />

      {editing ? (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setEditing(false);
              }}
              aria-label="Titre de la tâche"
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm">
              OK
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Annuler
            </Button>
          </div>
          <label className="flex items-center gap-2 text-xs text-text-muted">
            Échéance
            <input
              type="datetime-local"
              value={draftDueAt}
              onChange={(e) => setDraftDueAt(e.target.value)}
              className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-text"
            />
          </label>
        </form>
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-0.5">
            <span
              className={`break-words ${
                task.done ? 'text-text-muted line-through' : 'text-text'
              }`}
            >
              {task.title}
            </span>
            <time className="text-xs text-text-muted" dateTime={task.createdAt}>
              Créée le {formatDateTime(task.createdAt)}
            </time>
            {task.updatedAt !== task.createdAt && (
              <span className="text-xs text-text-muted">
                Modifiée le {formatDateTime(task.updatedAt)}
              </span>
            )}
            {task.dueAt && (
              <span
                className={`text-xs ${
                  isOverdue(task) ? 'font-medium text-danger' : 'text-text-muted'
                }`}
              >
                Échéance : {formatDateTime(task.dueAt)}
                {isOverdue(task) && ' — en retard'}
              </span>
            )}
          </div>
          <Badge tone={task.done ? 'success' : 'accent'}>
            {task.done ? 'Faite' : 'À faire'}
          </Badge>
          <div className="flex shrink-0 items-center gap-1">
            <Button size="sm" variant="ghost" onClick={startEdit} aria-label="Modifier">
              Modifier
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(task.id)}
              aria-label="Supprimer"
            >
              Supprimer
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
