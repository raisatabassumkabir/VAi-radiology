'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Image as ImageIcon, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export const AuthNav: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isMounted) return null;

  return (
    <nav className="flex items-center gap-6">
      <Link
        href="/tasks"
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition duration-150"
      >
        <LayoutDashboard className="w-4 h-4 text-teal-400" />
        Kanban Board
      </Link>
      <Link
        href="/annotate"
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition duration-150"
      >
        <ImageIcon className="w-4 h-4 text-cyan-400" />
        Annotation Studio
      </Link>
      
      <div className="h-4 w-px bg-white/10" />

      {token ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition duration-150"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm font-semibold text-teal-400 hover:text-teal-300 transition duration-150"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Link>
      )}
    </nav>
  );
};
