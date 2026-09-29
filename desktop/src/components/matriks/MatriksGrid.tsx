import * as React from 'react';
import { MatriksAnomalyBanner } from './MatriksAnomalyBanner';
import { MatrixCell, type MatrixCellState } from '@/components/ui/matrix-cell';
import type {
  MatriksBelajarResult,
  SelMatriks,
  BarisSiswa,
  KolomMateri,
} from '@/data/types';

interface MatriksGridProps {
  data: MatriksBelajarResult;
  tandaiTertinggal: boolean;
  isBulkMode: boolean;
  selectedKeys: Set<string>;
  onToggleCellSelection: (key: string) => void;
  onToggleRowSelection: (siswaId: string, rowKeys: string[]) => void;
  onToggleColumnSelection: (materiId: string, colKeys: string[]) => void;
  onCellClick: (
    cell: SelMatriks,
    siswa: BarisSiswa,
    materi: KolomMateri,
    rect: DOMRect
  ) => void;
  onStudentNameClick: (siswa: BarisSiswa) => void;
  onOpenAnomalyModal: () => void;
  filterSuffix?: string;
}

export const MatriksGrid: React.FC<MatriksGridProps> = ({
  data,
  tandaiTertinggal,
  isBulkMode,
  selectedKeys,
  onToggleCellSelection,
  onToggleRowSelection,
  onToggleColumnSelection,
  onCellClick,
  onStudentNameClick,
  onOpenAnomalyModal,
  filterSuffix = '',
}) => {
  const {
    namaMapel,
    jenjang,
    kolom,
    baris,
    sel,
    ringkasanKolom,
    catatanDiLuarJenjang,
    ambangTertinggal,
  } = data;

  // Set of students who have >= ambang unreceived materials
  const tertinggalSet = React.useMemo(() => {
    const set = new Set<string>();
    for (const s of baris) {
      let belum = 0;
      for (const m of kolom) {
        const cell = sel[s.id]?.[m.id];
        if (!cell || (cell.keadaan !== 'tersampaikan' && cell.keadaan !== 'selesai_manual')) {
          belum++;
        }
      }
      if (belum >= ambangTertinggal.minBelum) {
        set.add(s.id);
      }
    }
    return set;
  }, [baris, kolom, sel, ambangTertinggal]);

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-white">
      {/* 1. Title & Meta Row */}
      <div className="flex flex-none items-baseline gap-2.5 px-[14px] pb-[9px] pt-1">
        <h1 className="flex-none text-[15px] font-semibold text-[#242424] whitespace-nowrap">
          {namaMapel} · {jenjang}
        </h1>
        <div className="flex-1 min-w-0 text-[11.5px] text-[#5C5A58] truncate">
          {kolom.length} materi · {baris.length} siswa{filterSuffix}
        </div>
      </div>

      {/* 2. Anomaly Banner if records outside scope exist */}
      {catatanDiLuarJenjang.length > 0 && (
        <MatriksAnomalyBanner
          totalSiswa={new Set(catatanDiLuarJenjang.map((c) => c.siswaId)).size}
          namaMapel={namaMapel}
          jenjang={jenjang}
          onOpenModal={onOpenAnomalyModal}
        />
      )}

      {/* 3. Grid Table Container (Sticky Header, Sticky Left, Sticky Right, Sticky Bottom) */}
      <div className="flex-1 min-h-0 overflow-auto bg-white" data-testid="matriks-grid-container">
        <div className="flex flex-col min-w-min min-h-full">
          {/* Header Row (H: 34px) */}
          <div className="flex sticky top-0 z-10 bg-[#FAFAFA] border-b border-[#E1DFDD] text-[10.5px] text-[#424242] select-none">
            {/* Sticky Student Header Col (W: 260px) */}
            <div className="w-[260px] flex-none sticky left-0 z-20 bg-[#FAFAFA] border-r border-[#E1DFDD] h-[34px] flex items-end px-[11px] pb-1.5 text-[11px] font-semibold tracking-[0.09em] text-[#5C5A58]">
              SISWA {jenjang}
            </div>

            {/* Material Columns */}
            {kolom.map((c) => {
              const summary = ringkasanKolom[c.id];
              const colKeys = baris.map((b) => `${b.id}|${c.id}`);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    if (isBulkMode) {
                      onToggleColumnSelection(c.id, colKeys);
                    }
                  }}
                  title={
                    isBulkMode
                      ? `Pilih semua sel di kolom ${c.nama}`
                      : `${c.nama} · diterima ${summary?.menerimaCount ?? 0} dari ${baris.length} siswa`
                  }
                  className={`min-w-[96px] flex-1 h-[34px] border-none border-r border-[#EDEBE9] bg-[#FAFAFA] text-[#424242] text-[10.5px] leading-[1.2] px-1 pb-1.5 flex items-end justify-center text-center transition-colors ${
                    isBulkMode ? 'cursor-pointer hover:bg-[#EDEBE9]' : 'cursor-default'
                  }`}
                >
                  <span className="line-clamp-2">{c.nama}</span>
                </button>
              );
            })}

            {/* Sticky Checkmark Col (W: 62px) */}
            <div className="w-[62px] flex-none sticky right-0 z-20 bg-[#FAFAFA] border-l border-[#E1DFDD] h-[34px] flex items-end justify-end px-2.5 pb-1.5 text-[#5C5A58] font-semibold">
              ✓
            </div>
          </div>

          {/* Student Rows (H: 28px) */}
          {baris.map((sw) => {
            const isTertinggal = tandaiTertinggal && tertinggalSet.has(sw.id);
            const rowKeys = kolom.map((c) => `${sw.id}|${c.id}`);

            // Calculate completed count for student
            let selesaiCount = 0;
            for (const c of kolom) {
              const cellState = sel[sw.id]?.[c.id]?.keadaan;
              if (cellState === 'tersampaikan' || cellState === 'selesai_manual') {
                selesaiCount++;
              }
            }

            return (
              <div
                key={sw.id}
                className={`flex h-7 flex-none border-b border-[#EDEBE9] text-[12.5px] ${
                  isTertinggal ? 'bg-[#FFF3E0]' : 'bg-white'
                }`}
              >
                {/* Sticky Student Name Col (W: 260px) */}
                <button
                  type="button"
                  onClick={() => {
                    if (isBulkMode) {
                      onToggleRowSelection(sw.id, rowKeys);
                    } else {
                      onStudentNameClick(sw);
                    }
                  }}
                  title={isBulkMode ? 'Pilih semua sel di baris ini' : 'Profil siswa menyusul di Batch B'}
                  className={`w-[260px] flex-none sticky left-0 z-10 border-none border-r border-[#E1DFDD] flex items-center gap-1.5 px-[11px] text-[12.5px] text-left cursor-pointer transition-colors ${
                    isTertinggal
                      ? 'bg-[#FFF3E0] text-[#8A5200] hover:brightness-95'
                      : 'bg-white text-[#242424] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {isTertinggal && <span className="flex-none font-bold text-[#8A5200]">⚠</span>}
                  <span
                    className={`flex-1 min-w-0 truncate ${
                      sw.aktif ? 'text-[#242424]' : 'line-through text-[#5C5A58]'
                    }`}
                  >
                    {sw.nama}
                  </span>
                  {!sw.aktif && (
                    <span className="flex-none text-[10.5px] text-[#5C5A58] ml-1">nonaktif</span>
                  )}
                </button>

                {/* Cells */}
                {kolom.map((c) => {
                  const cell = sel[sw.id]?.[c.id] || {
                    siswaId: sw.id,
                    materiId: c.id,
                    keadaan: 'kosong' as const,
                    riwayat: [],
                  };
                  const key = `${sw.id}|${c.id}`;
                  const isSelected = isBulkMode && selectedKeys.has(key);

                  return (
                    <div
                      key={c.id}
                      className="min-w-[96px] flex-1 flex items-center justify-center p-0"
                    >
                      <MatrixCell
                        state={cell.keadaan as MatrixCellState}
                        isSelected={isSelected}
                        onClick={(e) => {
                          if (isBulkMode) {
                            onToggleCellSelection(key);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onCellClick(cell, sw, c, rect);
                          }
                        }}
                        title={`${sw.nama} · ${c.nama}`}
                        className="w-full h-full rounded-none"
                      />
                    </div>
                  );
                })}

                {/* Sticky Score Col (W: 62px) */}
                <div
                  className={`w-[62px] flex-none sticky right-0 z-10 border-l border-[#E1DFDD] flex items-center justify-end px-2.5 font-mono text-[12px] ${
                    isTertinggal
                      ? 'bg-[#FFF3E0] text-[#8A5200]'
                      : 'bg-white text-[#242424]'
                  }`}
                >
                  {selesaiCount}/{kolom.length}
                </div>
              </div>
            );
          })}

          {/* Spacer */}
          <div className="flex-1 min-h-0" />

          {/* Sticky Summary Row "MENERIMA" (H: 26px) */}
          <div className="flex h-[26px] flex-none sticky bottom-0 z-10 bg-[#F5F5F5] text-[11.5px] text-[#5C5A58] border-t border-[#E1DFDD] select-none">
            {/* Sticky Label (W: 260px) */}
            <div className="w-[260px] flex-none sticky left-0 z-20 bg-[#F5F5F5] border-r border-[#E1DFDD] flex items-center px-[11px] tracking-[0.06em] text-[#5C5A58] font-medium">
              MENERIMA
            </div>

            {/* Column Metrics */}
            {kolom.map((c) => {
              const summary = ringkasanKolom[c.id];
              const count = summary?.menerimaCount ?? 0;
              const isZero = count === 0;

              return (
                <div
                  key={c.id}
                  className={`min-w-[96px] flex-1 border-r border-[#EDEBE9] flex items-center justify-center font-mono ${
                    isZero ? 'text-[#9B0C18] font-semibold' : 'text-[#5C5A58] font-normal'
                  }`}
                >
                  {count}/{baris.length}
                </div>
              );
            })}

            {/* Sticky Right Spacer (W: 62px) */}
            <div className="w-[62px] flex-none sticky right-0 z-20 bg-[#F5F5F5] border-l border-[#E1DFDD]" />
          </div>
        </div>
      </div>
    </div>
  );
};
