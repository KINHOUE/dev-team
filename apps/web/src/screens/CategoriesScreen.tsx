import { useState } from 'react';
import { Button, Card, Input, cx } from '@dev-team/design-system';
import type { Category } from '../types';
import CategoryIcon, { ICON_KEYS } from '../components/CategoryIcon';

interface CategoriesScreenProps {
  categories: Category[];
  onAdd: (input: { name: string; icon: string }) => Promise<void>;
  onEdit: (id: string, input: { name?: string; icon?: string }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icône de la catégorie">
      {ICON_KEYS.map((icon) => (
        <button
          key={icon}
          type="button"
          role="radio"
          aria-checked={value === icon}
          aria-label={icon}
          onClick={() => onChange(icon)}
          className={cx(
            'flex h-10 w-10 items-center justify-center rounded-md border transition-colors',
            value === icon
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-border bg-surface text-text-muted hover:text-text',
          )}
        >
          <CategoryIcon icon={icon} className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

export default function CategoriesScreen({
  categories,
  onAdd,
  onEdit,
  onRemove,
}: CategoriesScreenProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('tag');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('tag');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onAdd({ name: name.trim(), icon });
      setName('');
      setIcon('tag');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la création');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditIcon(category.icon);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await onEdit(editingId, { name: editName.trim(), icon: editIcon });
    setEditingId(null);
  };

  const handleRemove = async (category: Category) => {
    if (
      !window.confirm(
        `Supprimer la catégorie « ${category.name} » ? Les dépenses associées seront conservées sans catégorie.`,
      )
    ) {
      return;
    }
    await onRemove(category.id);
  };

  return (
    <div className="flex flex-col gap-5">
      <Card padding="md">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Nouvelle catégorie</h2>
          <Input
            label="Nom"
            placeholder="Ex. Épargne, Éducation, Cadeaux"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text">Icône</span>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Création…' : 'Créer la catégorie'}
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Vos catégories ({categories.length})</h2>
        <ul className="flex flex-col divide-y divide-border">
          {categories.map((category) =>
            editingId === category.id ? (
              <li key={category.id} className="flex flex-col gap-3 py-3">
                <Input
                  label="Nom"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={60}
                />
                <IconPicker value={editIcon} onChange={setEditIcon} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void saveEdit()}>
                    Enregistrer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Annuler
                  </Button>
                </div>
              </li>
            ) : (
              <li key={category.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-text-muted">
                  <CategoryIcon icon={category.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{category.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Modifier ${category.name}`}
                  onClick={() => startEdit(category)}
                >
                  ✎
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  aria-label={`Supprimer ${category.name}`}
                  onClick={() => void handleRemove(category)}
                >
                  ✕
                </Button>
              </li>
            ),
          )}
        </ul>
      </Card>
    </div>
  );
}
