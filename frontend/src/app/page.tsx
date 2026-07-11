import Link from 'next/link';
import { LayoutDashboard, Image as ImageIcon, ArrowRight, Kanban, Paintbrush } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 max-w-5xl mx-auto px-4 py-16 text-center">

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-semibold text-teal-400 mb-6 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
        Radiology Intelligence Suite v1.0
      </div>

      {/* Hero Headings */}
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
        Collaborative Workspace for Tasks &amp; Annotations
      </h1>

      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mt-6 leading-relaxed">
        Increase productivity with an interactive Kanban task board, and train models using our high-precision multi-image polygon annotation studio.
      </p>

      {/* App Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-16 max-w-4xl">

        {/* Kanban Card */}
        <div className="group relative flex flex-col justify-between p-8 bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-white/[0.04] backdrop-blur-md rounded-3xl transition duration-300 shadow-xl text-left overflow-hidden">
          {/* Subtle glow hover overlay */}
          <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-teal-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition duration-500" />

          <div>
            <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition">
              <Kanban className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-white transition">
              Task Kanban Board
            </h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Track tasks categorized by columns: To Do, In Progress, and Done. Features smooth drag-and-drop mechanics, optimistic state syncing, and automatic rollback on connection issues.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg transition active:scale-95"
            >
              Open Kanban
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Annotation Canvas Card */}
        <div className="group relative flex flex-col justify-between p-8 bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] backdrop-blur-md rounded-3xl transition duration-300 shadow-xl text-left overflow-hidden">
          {/* Subtle glow hover overlay */}
          <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition duration-500" />

          <div>
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition">
              <Paintbrush className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-white transition">
              Annotation Studio
            </h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Upload multiple images to the Django database and slide through them seamlessly. Draw custom closed polygons by dropping vertices, inspect shapes, and save annotations to SQLite.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <Link
              href="/annotate"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-200 hover:text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg transition active:scale-95"
            >
              Launch Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

