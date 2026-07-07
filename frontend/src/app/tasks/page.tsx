import { KanbanBoard } from '@/components/KanbanBoard';

export const metadata = {
  title: 'Task Kanban Board | Epic Studio',
  description: 'Manage tasks with a professional drag-and-drop Kanban interface.',
};

export default function TasksPage() {
  return <KanbanBoard />;
}
