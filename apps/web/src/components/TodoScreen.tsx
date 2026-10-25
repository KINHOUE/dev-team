import { useState } from 'react';
import type { Filter } from '../types';
import { useTasks } from '../hooks/useTasks';
import FilterTabs from './FilterTabs';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

export default function TodoScreen() {
  const { tasks, loading, error, addTask, updateTitle, removeTask, toggleTask } =
    useTasks();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = tasks.filter((task) => {
    if (filter === 'done') return task.done;
    if (filter === 'todo') return !task.done;
    return true;
  });
  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <div className="flex flex-col gap-6">
      <TaskForm onSubmit={addTask} />
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <FilterTabs
        filter={filter}
        onChange={setFilter}
        total={tasks.length}
        todo={tasks.length - doneCount}
        done={doneCount}
      />
      <TaskList
        tasks={visible}
        loading={loading}
        onToggle={toggleTask}
        onEdit={updateTitle}
        onDelete={removeTask}
      />
    </div>
  );
}
