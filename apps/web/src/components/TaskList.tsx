import type { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string, dueAt?: string | null) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({
  tasks,
  loading,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (loading) {
    return <p className="text-sm text-text-muted">Chargement…</p>;
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-text-muted">Aucune tâche à afficher.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
