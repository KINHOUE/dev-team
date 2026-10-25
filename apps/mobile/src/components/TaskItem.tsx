import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}

/** Ligne de tâche : case à cocher, titre (éditable au tap), suppression. */
export function TaskItem({ task, onToggle, onDelete, onRename }: TaskItemProps) {
  const { theme } = useTheme();
  const t = theme.colors;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== task.title) {
      onRename(next);
    }
    setEditing(false);
  };

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: t.surface,
          borderColor: t.border,
          borderRadius: theme.radii.md,
          paddingVertical: theme.space.md,
          paddingHorizontal: theme.space.md,
          gap: theme.space.md,
        },
      ]}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        style={[
          styles.checkbox,
          {
            width: theme.space.xl,
            height: theme.space.xl,
            borderRadius: theme.radii.sm,
            borderColor: task.done ? t.success : t.borderStrong,
            backgroundColor: task.done ? t.success : 'transparent',
          },
        ]}
      >
        {task.done ? (
          <Text
            style={{
              color: t.accentContrast,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.bold,
            }}
          >
            ✓
          </Text>
        ) : null}
      </Pressable>

      {editing ? (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={commit}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: t.background,
              borderColor: t.accent,
              borderWidth: 1,
              borderRadius: theme.radii.md,
              color: t.text,
              fontSize: theme.fontSizes.base,
              paddingHorizontal: theme.space.sm,
              paddingVertical: theme.space.sm,
            }}
          />
          <Pressable onPress={commit} accessibilityRole="button" accessibilityLabel="Enregistrer">
            <Text
              style={{ color: t.accent, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold }}
            >
              OK
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text
          onPress={() => {
            setDraft(task.title);
            setEditing(true);
          }}
          style={{
            flex: 1,
            color: task.done ? t.textMuted : t.text,
            fontSize: theme.fontSizes.base,
            textDecorationLine: task.done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Text>
      )}

      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Supprimer la tâche"
        style={{ padding: theme.space.xs }}
      >
        <Text style={{ color: t.danger, fontSize: theme.fontSizes.base }}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  checkbox: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
