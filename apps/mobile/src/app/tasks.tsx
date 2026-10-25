import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TaskItem } from '../components/TaskItem';
import { ThemePicker } from '../components/ThemePicker';
import { AppTabs } from '../components/AppTabs';
import { createTask, deleteTask, listTasks, toggleTask, updateTask } from '../api/tasks';
import type { Task } from '../types';

type Filter = 'all' | 'todo' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'todo', label: 'À faire' },
  { key: 'done', label: 'Faites' },
];

export default function TasksScreen() {
  const { token, user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const t = theme.colors;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      setTasks(await listTasks(token));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les tâches');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'todo') {
      return tasks.filter((task) => !task.done);
    }
    if (filter === 'done') {
      return tasks.filter((task) => task.done);
    }
    return tasks;
  }, [tasks, filter]);

  const run = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      if (!token) {
        return;
      }
      try {
        await action();
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : fallback);
      }
    },
    [token, load],
  );

  const onAdd = async () => {
    const title = newTitle.trim();
    if (!title) {
      return;
    }
    setAdding(true);
    try {
      await createTask(token!, title);
      setNewTitle('');
      await load();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de créer la tâche');
    } finally {
      setAdding(false);
    }
  };

  const onLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* En-tête : titre + sélecteur de thème + déconnexion */}
      <View style={{ padding: theme.space.md, gap: theme.space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: t.text, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold }}>
            Mes tâches
          </Text>
          <Pressable onPress={onLogout} accessibilityRole="button" accessibilityLabel="Se déconnecter">
            <Text style={{ color: t.accentMuted, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium }}>
              Déconnexion
            </Text>
          </Pressable>
        </View>
        {user ? (
          <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm }}>{user.email}</Text>
        ) : null}
        <ThemePicker />
      </View>

      {/* Ajout d'une tâche */}
      <View style={{ paddingHorizontal: theme.space.md, gap: theme.space.sm }}>
        <View style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'center' }}>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            onSubmitEditing={onAdd}
            placeholder="Nouvelle tâche…"
            placeholderTextColor={t.textMuted}
            style={[
              styles.newTaskInput,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                color: t.text,
                borderRadius: theme.radii.md,
                height: theme.space.xxl,
                fontSize: theme.fontSizes.base,
                paddingHorizontal: theme.space.md,
              },
            ]}
          />
          <Button
            title="Ajouter"
            onPress={onAdd}
            loading={adding}
            disabled={!newTitle.trim()}
          />
        </View>

        {/* Filtre */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: t.surface,
            borderRadius: theme.radii.md,
            borderColor: t.border,
            borderWidth: 1,
            padding: theme.space.xs,
            gap: theme.space.xs,
          }}
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.radii.sm,
                  backgroundColor: active ? t.accent : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: active ? t.accentContrast : t.textMuted,
                    fontSize: theme.fontSizes.sm,
                    fontWeight: theme.fontWeights.medium,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Liste */}
      {error ? (
        <Text style={{ color: t.danger, fontSize: theme.fontSizes.sm, padding: theme.space.md }}>
          {error}
        </Text>
      ) : null}

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(task) => task.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={() => run(() => toggleTask(token!, item.id), 'Impossible de modifier la tâche')}
              onDelete={() => run(() => deleteTask(token!, item.id), 'Impossible de supprimer la tâche')}
              onRename={(title) => run(() => updateTask(token!, item.id, title), 'Impossible de modifier la tâche')}
            />
          )}
          contentContainerStyle={{ padding: theme.space.md, gap: theme.space.sm, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.base }}>Aucune tâche</Text>
            </View>
          }
        />
      )}
      <AppTabs active="tasks" />
    </View>
  );
}

const styles = StyleSheet.create({
  newTaskInput: {
    flex: 1,
    borderWidth: 1,
  },
});
