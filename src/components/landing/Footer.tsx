'use client';

import { useAppStore } from '@/lib/store';

export function Footer() {
  const setView = useAppStore((s) => s.setView);

  return (
    <footer className="bg-navy-700 text-white mt-12">
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="font-heading font-semibold text-lg mb-1">
          SD Islam Al Azhar 62 Summarecon Bandung
        </p>
        <p className="text-navy-300 text-sm mb-4">
          Form Pemesanan Seragam ASBD — Tahun Ajaran 2026/2027
        </p>
        <p className="text-navy-400 text-xs">
          &copy; 2026 SD Islam Al Azhar 62 Summarecon Bandung
        </p>
        <button
          onClick={() => setView('admin')}
          className="mt-4 text-navy-500 text-xs hover:text-gold-400 transition-colors underline underline-offset-2 cursor-pointer"
        >
          Admin Dashboard
        </button>
      </div>
    </footer>
  );
}
