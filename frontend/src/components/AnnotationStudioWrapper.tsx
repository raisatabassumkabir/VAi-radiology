'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AnnotationStudio = dynamic(
  () => import('./AnnotationStudio').then((mod) => mod.AnnotationStudio),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    )
  }
);

export default function AnnotationStudioWrapper() {
  return <AnnotationStudio />;
}
