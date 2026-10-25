import { useCallback, useEffect, useState } from 'react';
import type { Task } from '../types';
import * as api from '../lib/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await api.listTasks());
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addTask = useCallback(async (title: string, dueAt?: string | null) => {
    const created = await api.createTask(title, dueAt);
    setTasks((prev) => [created, ...prev]);
  }, []);

  const updateTitle = useCallback(
    async (id: string, title: string, dueAt?: string | null) => {
      const updated = await api.updateTask(id, title, dueAt);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [],
  );

  const removeTask = useCallback(async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const updated = await api.toggleTask(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  return { tasks, loading, error, addTask, updateTitle, removeTask, toggleTask };
}
