import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useSimulasi, useSiswaList, useKegiatanDaftar, usePerluRealisasiCount } from '@/data/hooks';
import {
  CalendarLtr24Regular,
  DocumentBulletList24Regular,
  Table24Regular,
  Person24Regular,
  PeopleCommunity24Regular,
  BookOpen24Regular,
  Building24Regular,
  Tag24Regular,
  Sparkle20Regular,
  Warning20Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';

export const PlaceholderScreen: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const { config, updateConfig } = useSimulasi();
  const [isTestSidePanelOpen, setIsTestSidePanelOpen] = React.useState(false);

  // Live queries to show shell integration with data layer
  const { data: siswa = [] } = useSiswaList();
  const { data: kegiatan = [] } = useKegiatanDaftar();
  const { data: perluCount = 0 } = usePerluRealisasiCount();

  const isPerluFilter =
    location.pathname === '/kegiatan' &&
    new URLSearchParams(location.search).get('filter') === 'perlu_realisasi';

  // Toggle side panel simulation to demonstrate dynamic toast placement (DESIGN.md §3.8 & §14)
  const toggleTestSidePanel = () => {
    const next = !isTestSidePanelOpen;
    setIsTestSidePanelOpen(next);
    window.dispatchEvent(
      new CustomEvent('bandrek:side-panel-change', {
        detail: { isOpen: next, width: 498 },
      })
    );
  };

  const getScreenDetails = () => {
    switch (location.pathname) {
      case '/kalender':
        return {
          code: 'A1 / A2',
          title: 'Kalender Kegiatan',
          icon: <CalendarLtr24Regular className="text-(--color-brand)" />,
          description:
            'Tampilan jadwal mingguan/harian/bulanan dengan blok kegiatan warna-warni, popover detail, drag-and-drop slot, dan deteksi bentrok real-time.',
          stats: `${kegiatan.length} kegiatan terjadwal`,
        };
      case '/kegiatan':
        return {
          code: 'A3',
          title: isPerluFilter ? 'Kegiatan Perlu Realisasi' : 'Daftar Kegiatan',
          icon: isPerluFilter ? (
            <Warning20Regular className="text-[#C47D00]" />
          ) : (
            <DocumentBulletList24Regular className="text-(--color-brand)" />
          ),
          description: isPerluFilter
            ? `Filter cepat aktif: menampilkan kegiatan yang sudah lewat tanggalnya namun belum direalisasi (${perluCount} kegiatan perlu tindakan).`
            : 'Tabel riwayat dan rencana kegiatan dengan filter cepat status, rentang tanggal, jenis, dan aksi kontekstual.',
          stats: `${kegiatan.length} total · ${perluCount} perlu realisasi`,
        };
      case '/matriks':
        return {
          code: 'A9',
          title: 'Matriks Belajar Siswa',
          icon: <Table24Regular className="text-(--color-brand)" />,
          description:
            'Tabel silang siswa vs materi dengan 7 status sel belajar, baris siswa tertinggal, filter jenjang, dan penandaan manual.',
          stats: `${siswa.length} siswa terdaftar di matriks`,
        };
      case '/master/siswa':
        return {
          code: 'B1',
          title: 'Data Master: Siswa',
          icon: <Person24Regular className="text-(--color-brand)" />,
          description:
            'CRUD siswa dengan pencarian, filter jenjang & kelas, panel samping sunting, dialog nonaktifkan, dan proteksi hapus.',
          stats: `${siswa.length} siswa tersimpan di sistem`,
        };
      case '/master/subjek':
        return {
          code: 'B2',
          title: 'Data Master: Subjek (Tutor/Pengajar)',
          icon: <Person24Regular className="text-(--color-brand)" />,
          description:
            'Pengelolaan tutor, pengawas, dan wali kelas dengan indikator jumlah kegiatan terkait dan beban mengajar.',
          stats: '12 subjek pengajar terdaftar',
        };
      case '/master/mapel':
        return {
          code: 'B4',
          title: 'Data Master: Mata Pelajaran & Materi',
          icon: <BookOpen24Regular className="text-(--color-brand)" />,
          description:
            'Tampilan master-detail mapel dengan daftar materi berjenjang dan pengurutan seret (drag-and-drop).',
          stats: '6 mapel · 48 materi aktif',
        };
      case '/master/kelas':
        return {
          code: 'B3',
          title: 'Data Master: Kelas',
          icon: <PeopleCommunity24Regular className="text-(--color-brand)" />,
          description:
            'Pengelompokan siswa untuk pintasan pengisian form kegiatan. Perubahan anggota tidak mengubah kegiatan yang sudah dibuat.',
          stats: '8 rombongan belajar',
        };
      case '/master/tempat':
        return {
          code: 'B5',
          title: 'Data Master: Tempat & Ruangan',
          icon: <Building24Regular className="text-(--color-brand)" />,
          description:
            'Gedung dan ruangan bimbingan yang dikelompokkan (optgroup) pada pemilih ruangan form kegiatan.',
          stats: '3 gedung · 9 ruangan',
        };
      case '/master/jenis':
        return {
          code: 'B6',
          title: 'Data Master: Jenis Kegiatan',
          icon: <Tag24Regular className="text-(--color-brand)" />,
          description:
            'Pengaturan warna penanda kalender dan aturan isian wajib pada form kegiatan.',
          stats: '5 jenis kegiatan (KBM, Ujian, Ekskul, dll.)',
        };
      default:
        return {
          code: 'Phase 4',
          title: 'Bandrek Desktop',
          icon: <Sparkle20Regular className="text-(--color-brand)" />,
          description: 'Aplikasi manajemen bimbingan belajar Bandrek.',
          stats: 'Siap untuk Phase 5 Slicing Screens',
        };
    }
  };

  const details = getScreenDetails();

  return (
    <div className="flex h-full w-full flex-col p-6 overflow-y-auto">
      {/* Screen Overview Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs max-w-220">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-(--color-surface-alt) border border-(--color-border-subtle)">
            {details.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-(--color-brand) bg-(--color-brand-subtle) px-2 py-0.5 rounded">
                Layar {details.code}
              </span>
              <span className="text-[12px] text-(--color-text-muted)">
                Target Phase 5 Slicing
              </span>
            </div>
            <h2 className="text-[18px] font-semibold text-(--color-text) mt-1">
              {details.title}
            </h2>
            <p className="text-[13px] text-(--color-text-secondary) mt-1 leading-relaxed">
              {details.description}
            </p>
          </div>
        </div>

        {/* Live Data Integration Info */}
        <div className="flex items-center justify-between rounded-lg bg-(--color-surface-alt) px-4 py-2.5 text-[12.5px] border border-(--color-border-subtle)">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-(--color-text)">Data Mock Tersambung:</span>
            <span className="text-(--color-text-secondary)">{details.stats}</span>
          </div>
          <span className="font-mono text-[11px] text-(--color-text-muted)">
            TanStack Query Live
          </span>
        </div>

        {/* Phase 4 Shell Feature Testing Panel */}
        <div className="mt-2 border-t border-(--color-border-subtle) pt-4">
          <div className="text-[12px] font-semibold text-(--color-text) mb-2">
            Uji Fitur App Shell (Phase 4):
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              onClick={() => {
                showToast({
                  message: 'Pemberitahuan toast berhasil ditampilkan!',
                  type: 'info',
                  action: {
                    label: 'Urungkan',
                    onClick: () => {
                      showToast({ message: 'Tindakan berhasil diurungkan.', type: 'success' });
                    },
                  },
                });
              }}
            >
              Uji Toast (8s Urungkan)
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                updateConfig({
                  offlineBannerVisible: !config.offlineBannerVisible,
                });
                showToast({
                  message: config.offlineBannerVisible
                    ? 'Banner offline dinonaktifkan.'
                    : 'Banner offline diaktifkan (Mode Baca).',
                  type: 'warning',
                });
              }}
            >
              {config.offlineBannerVisible ? 'Sembunyikan Banner Offline' : 'Tampilkan Banner Offline'}
            </Button>

            <Button
              variant="secondary"
              onClick={toggleTestSidePanel}
            >
              {isTestSidePanelOpen ? 'Tutup Panel Samping Uji' : 'Simulasi Panel Samping (Cek Posisi Toast)'}
            </Button>
          </div>
        </div>
      </div>

      {/* Simulated Side Panel to demonstrate dynamic toast repositioning */}
      {isTestSidePanelOpen && (
        <aside className="fixed top-12 right-0 bottom-0 z-40 w-124.5 border-l border-(--color-border) bg-(--color-surface) p-5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-240">
          <div className="flex items-center justify-between border-b border-(--color-border-subtle) pb-3">
            <div>
              <h3 className="text-[15px] font-semibold text-(--color-text)">
                Panel Samping (Simulasi A4 / Form)
              </h3>
              <p className="text-[12px] text-(--color-text-muted)">
                Lebar 498px per DESIGN.md §3.10
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTestSidePanel}
              className="text-(--color-text-muted) hover:text-(--color-text) p-1 rounded"
            >
              <Dismiss20Regular />
            </button>
          </div>

          <div className="flex-1 py-4 text-[13px] text-(--color-text-secondary) space-y-3">
            <p>
              Saat panel samping ini terbuka, perhatikan bahwa posisi <strong>Toast</strong> bergeser ke kiri (<code className="font-mono text-[12px]">right: 514px</code>) sehingga <strong>tidak menutupi</strong> tombol aksi di bagian bawah panel (memenuhi <em>DESIGN.md §3.8 &amp; §14</em>).
            </p>
            <Button
              variant="primary"
              onClick={() => {
                showToast({
                  message: 'Toast muncul di sebelah kiri panel samping!',
                  type: 'success',
                });
              }}
            >
              Munculkan Toast Selagi Panel Terbuka
            </Button>
          </div>

          <div className="border-t border-(--color-border-subtle) pt-3 flex justify-end gap-2">
            <Button variant="secondary" onClick={toggleTestSidePanel}>
              Tutup Panel
            </Button>
          </div>
        </aside>
      )}
    </div>
  );
};
