import { request } from './client';
import type { Task } from '../types';

export function listTasks(token: string): Promise<Task[]> {
  return request<Task[]>('/tasks', { token });
}

export function createTask(token: string, title: string): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', token, body: { title } });
}

export function updateTask(token: string, id: string, title: string): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: 'PUT', token, body: { title } });
}

export function deleteTask(token: string, id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE', token });
}

/** Bascule l'état « faite » d'une tâche (PATCH /tasks/:id/complete). */
export function toggleTask(token: string, id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}/complete`, { method: 'PATCH', token });
}
