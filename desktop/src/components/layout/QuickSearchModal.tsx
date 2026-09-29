import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Search16Regular,
  Person16Regular,
  PersonBoard16Regular,
} from '@fluentui/react-icons';
import { repositories } from '@/data/repositories';
import type { Siswa, Subjek, Kegiatan } from '@/data/types';

export interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchItem =
  | { type: 'siswa'; data: Siswa; label: string; sub: string; url: string }
  | { type: 'subjek'; data: Subjek; label: string; sub: string; url: string }
  | {
      type: 'kegiatan';
      data: Kegiatan;
      label: string;
      sub: string;
      url: string;
      tanggal: string;
      status: string;
    };

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Perform search across mock repositories
  React.useEffect(() => {
    if (!isOpen) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    Promise.all([
      repositories.siswa.getAll(),
      repositories.subjek.getAll(),
      repositories.kegiatan.getDaftar({}),
    ]).then(([allSiswa, allSubjek, allKegiatan]) => {
      const items: SearchItem[] = [];

      // Siswa matches
      const matchedSiswa = allSiswa
        .filter(
          (s: Siswa) =>
            s.nama.toLowerCase().includes(q) ||
            (s.asal && s.asal.toLowerCase().includes(q)) ||
            s.jenjang.toLowerCase().includes(q)
        )
        .slice(0, 5);

      for (const s of matchedSiswa) {
        items.push({
          type: 'siswa',
          data: s,
          label: s.nama,
          sub: `${s.jenjang}${s.asal ? ` · ${s.asal}` : ''}`,
          url: `/master/siswa?id=${s.id}`,
        });
      }

      // Subjek matches
      const matchedSubjek = allSubjek
        .filter((sub: Subjek) => sub.nama.toLowerCase().includes(q))
        .slice(0, 5);

      for (const sub of matchedSubjek) {
        items.push({
          type: 'subjek',
          data: sub,
          label: sub.nama,
          sub: `${sub.peran} · ${sub.kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}`,
          url: `/master/subjek?id=${sub.id}`,
        });
      }

      // Kegiatan matches
      const matchedKegiatan = allKegiatan
        .filter(
          (k: Kegiatan) =>
            k.nama.toLowerCase().includes(q) ||
            k.namaMapel?.toLowerCase().includes(q) ||
            k.namaMateri?.toLowerCase().includes(q) ||
            k.pengisiUtama?.nama.toLowerCase().includes(q)
        )
        .slice(0, 8);

      for (const k of matchedKegiatan) {
        const pengisi = k.pengisiUtama ? k.pengisiUtama.nama : 'Tanpa pengisi';
        items.push({
          type: 'kegiatan',
          data: k,
          label: k.nama,
          sub: `${k.mulai}–${k.selesai} · ${k.namaRuangan} · ${pengisi}`,
          url: `/kegiatan?id=${k.id}`,
          tanggal: k.tanggal.slice(5), // e.g. "09-16"
          status: k.status,
        });
      }

      setResults(items);
      setSelectedIndex(0);
    });
  }, [query, isOpen]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigate(results[selectedIndex].url);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-start justify-center bg-black/35 pt-20 backdrop-blur-[1px] select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-135 max-h-[70vh] flex-col overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-2xl animate-in fade-in-0 zoom-in-95 duration-(--dur-fast)"
      >
        {/* Search Input Bar */}
        <div className="flex h-12 flex-none items-center gap-2.5 border-b border-(--color-border) px-3.5">
          <Search16Regular className="text-[17px] text-(--color-text-secondary) flex-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari siswa, subjek, kegiatan"
            className="flex-1 border-none bg-transparent text-[14px] text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none"
          />
          <kbd className="flex-none font-mono text-[11px] rounded border border-(--color-border-subtle) bg-(--color-surface-alt) px-1.5 py-0.5 text-(--color-text-muted)">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 min-h-36 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-[13px] text-(--color-text-muted)">
              Ketik nama siswa, subjek, atau kegiatan.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-(--color-text-muted)">
              Tidak ada yang cocok dengan "{query}".
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${item.type}-${idx}`}
                    onClick={() => {
                      navigate(item.url);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-(--color-brand-subtle) text-(--color-brand-ink)'
                        : 'text-(--color-text) hover:bg-(--color-surface-alt)'
                    )}
                  >
                    {/* Leading Icon / Date */}
                    {item.type === 'kegiatan' ? (
                      <span className="w-12 flex-none font-mono text-[11px] text-(--color-text-secondary)">
                        {item.tanggal}
                      </span>
                    ) : item.type === 'siswa' ? (
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-(--color-brand) text-white text-[12px] font-semibold">
                        <Person16Regular />
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-(--color-surface-alt) border border-(--color-border) text-(--color-text-secondary) text-[12px]">
                        <PersonBoard16Regular />
                      </span>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-[13.5px] font-medium leading-snug">
                        {item.label}
                      </div>
                      <div className="truncate text-[11.5px] text-(--color-text-muted)">
                        {item.sub}
                      </div>
                    </div>

                    {/* Trailing Type Tag */}
                    <span className="flex-none rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted) bg-(--color-surface-alt)">
                      {item.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Hints */}
        <div className="flex flex-none items-center gap-3 border-t border-(--color-border-subtle) bg-(--color-surface-alt) px-3 py-2 text-[11px] text-(--color-text-muted)">
          <span>↑↓ pilih</span>
          <span>Enter buka</span>
          <span>Esc tutup</span>
        </div>
      </div>
    </div>
  );
};
