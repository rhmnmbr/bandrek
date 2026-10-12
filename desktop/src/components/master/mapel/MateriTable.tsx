import { useState } from 'react';
import type { Materi } from '@/data/types/master';

interface MateriTableProps {
  mapelNama: string;
  materiList: Materi[];
  onNewMateri: () => void;
  onSelectMateri: (materi: Materi) => void;
  onReorderMateri: (orderedIds: string[]) => Promise<void>;
}

export function MateriTable({
  mapelNama,
  materiList,
  onNewMateri,
  onSelectMateri,
  onReorderMateri,
}: MateriTableProps) {
  const [dragState, setDragState] = useState<{ id: string; over: string } | null>(null);

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', id);
    } catch {
      // Ignore if transfer setData fails
    }
    setDragState({ id, over: id });
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragState && dragState.id && dragState.over !== targetId) {
      setDragState({ id: dragState.id, over: targetId });
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragState || !dragState.id || dragState.id === targetId) {
      setDragState(null);
      return;
    }

    const currentIds = materiList.map((m) => m.id);
    const fromIndex = currentIds.indexOf(dragState.id);
    const toIndex = currentIds.indexOf(targetId);

    if (fromIndex >= 0 && toIndex >= 0) {
      const updatedIds = [...currentIds];
      const [movedItem] = updatedIds.splice(fromIndex, 1);
      updatedIds.splice(toIndex, 0, movedItem);
      await onReorderMateri(updatedIds);
    }

    setDragState(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
  };

  // Keyboard navigation for reordering (ArrowUp / ArrowDown)
  const handleKeyDown = async (e: React.KeyboardEvent, id: string) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    e.preventDefault();
    const currentIds = materiList.map((m) => m.id);
    const currentIndex = currentIds.indexOf(id);
    if (currentIndex < 0) return;

    const targetIndex = e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentIds.length) return;

    const updatedIds = [...currentIds];
    const [movedItem] = updatedIds.splice(currentIndex, 1);
    updatedIds.splice(targetIndex, 0, movedItem);
    await onReorderMateri(updatedIds);
  };

  return (
    <div className="flex-[1_1_100%] flex flex-col gap-1.5 border-t border-(--color-border) pt-2.75 mt-1">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) truncate">
          MATERI · {materiList.length} · URUTAN = KOLOM MATRIKS
        </div>
        <button
          type="button"
          onClick={onNewMateri}
          title={`Tambah materi di ${mapelNama}`}
          className="flex h-5.75 shrink-0 items-center gap-1 px-2.25 rounded-sm border border-(--color-border) bg-(--color-surface) text-(--color-brand) text-[11.5px] font-medium hover:bg-(--color-brand-subtle) transition-colors cursor-pointer"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          <span>Materi</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-md border border-(--color-border) bg-(--color-surface) overflow-hidden">
        {/* Table Header */}
        <div className="flex h-6.5 items-center bg-(--color-surface-alt) border-b border-(--color-border) px-1 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
          <div className="w-5 shrink-0" />
          <div className="w-7.5 shrink-0 text-right pr-2.5">NO</div>
          <div className="flex-1 min-w-[140px]">NAMA MATERI</div>
          <div className="w-24 shrink-0 text-right pr-2.5">DIPAKAI</div>
          <div className="w-[74px] shrink-0">STATUS</div>
          <div className="w-24 shrink-0 text-right pr-2" />
        </div>

        {/* Rows */}
        {materiList.map((m, index) => {
          const isDragging = dragState?.id === m.id;
          const isOver = dragState?.over === m.id && dragState.id !== m.id;
          const currentIds = materiList.map((item) => item.id);
          const fromIdx = dragState ? currentIds.indexOf(dragState.id) : -1;
          const dropBar = isOver
            ? fromIdx < index
              ? 'inset 0 -2px 0 var(--color-brand)'
              : 'inset 0 2px 0 var(--color-brand)'
            : 'none';

          const nKegiatan = m.jumlahKegiatan || 0;
          const isNonaktif = !m.aktif;

          return (
            <div
              key={m.id}
              draggable
              onDragStart={(e) => handleDragStart(e, m.id)}
              onDragOver={(e) => handleDragOver(e, m.id)}
              onDrop={(e) => handleDrop(e, m.id)}
              onDragEnd={handleDragEnd}
              style={{
                boxShadow: dropBar,
                opacity: isDragging ? 0.4 : 1,
              }}
              className={`flex h-8 items-center px-1 transition-colors hover:bg-(--color-surface-alt) ${
                index > 0 ? 'border-t border-(--color-border-subtle)' : ''
              } ${isDragging ? 'bg-(--color-surface-alt)' : 'bg-(--color-surface)'}`}
            >
              {/* Drag Handle */}
              <div className="w-5.5 shrink-0 flex items-center justify-center">
                <button
                  type="button"
                  onKeyDown={(e) => handleKeyDown(e, m.id)}
                  title="Seret untuk mengubah urutan — atau fokuskan tombol ini lalu tekan panah atas/bawah"
                  className="flex h-5.5 w-5 items-center justify-center rounded-sm border-none bg-transparent text-(--color-text-disabled) hover:bg-(--color-surface-alt) hover:text-(--color-text-secondary) cursor-grab transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="5" cy="4" r="1.3" />
                    <circle cx="11" cy="4" r="1.3" />
                    <circle cx="5" cy="8" r="1.3" />
                    <circle cx="11" cy="8" r="1.3" />
                    <circle cx="5" cy="12" r="1.3" />
                    <circle cx="11" cy="12" r="1.3" />
                  </svg>
                </button>
              </div>

              {/* Number */}
              <div className="w-7.5 shrink-0 text-right pr-2.5 font-mono text-[11.5px] text-(--color-text-muted)">
                {index + 1}
              </div>

              {/* Nama Materi */}
              <div
                onClick={() => onSelectMateri(m)}
                title={`Ubah ${m.nama}`}
                className={`flex-1 min-w-[140px] truncate pr-2 text-[12.5px] cursor-pointer hover:underline ${
                  isNonaktif
                    ? 'text-(--color-text-muted) line-through'
                    : 'text-(--color-text-primary)'
                }`}
              >
                {m.nama}
              </div>

              {/* Dipakai */}
              <div
                className={`w-24 shrink-0 text-right pr-2.5 text-[11.5px] ${
                  nKegiatan > 0
                    ? 'text-(--color-text-secondary)'
                    : 'text-(--color-warning-fg)'
                }`}
              >
                {nKegiatan > 0 ? `${nKegiatan} kegiatan` : 'belum dipakai'}
              </div>

              {/* Status Pill */}
              <div className="w-[74px] shrink-0">
                <span
                  className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10.5px] font-semibold border whitespace-nowrap ${
                    m.aktif
                      ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
                      : 'border-(--color-border) bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {m.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              {/* Ubah Action Button */}
              <div className="w-24 shrink-0 flex justify-end gap-1 pr-1">
                <button
                  type="button"
                  onClick={() => onSelectMateri(m)}
                  title={`Ubah ${m.nama}`}
                  className="h-5.25 px-2 rounded-sm border-none bg-transparent text-(--color-brand) text-[11.5px] font-medium hover:bg-(--color-brand-subtle) cursor-pointer transition-colors"
                >
                  Ubah
                </button>
              </div>
            </div>
          );
        })}

        {materiList.length === 0 && (
          <div className="p-3 text-center text-xs text-(--color-text-muted) leading-relaxed">
            Belum ada materi untuk mata pelajaran ini. Pakai "+ Materi" di atas untuk menambahkan.
          </div>
        )}
      </div>

      {/* Note Below Table */}
      <div className="text-[11px] text-(--color-text-muted) leading-relaxed">
        Urutan materi di sini menentukan urutan kolom di matriks belajar.
      </div>
    </div>
  );
}
