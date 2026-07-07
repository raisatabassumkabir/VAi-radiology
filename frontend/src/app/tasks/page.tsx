'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const KanbanBoard = dynamic(
  () => import('@/components/KanbanBoard').then((mod) => mod.KanbanBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] text-slate-400">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500 mb-4" />
        <p className="text-sm font-medium">Loading Kanban Board...</p>
      </div>
    ),
  }
);

export default function TasksPage() {
  return <KanbanBoard />;
}
