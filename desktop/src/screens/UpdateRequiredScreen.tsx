import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownload16Regular,
  ArrowSync16Regular,
  CheckmarkCircle16Regular,
  Info16Regular,
  Warning16Regular,
} from '@fluentui/react-icons';
import { useToast } from '@/components/ui/toast';

export interface UpdateRequiredScreenProps {
  currentVersion?: string;
  requiredVersion?: string;
  latestVersion?: string;
}

export function UpdateRequiredScreen({
  currentVersion = '0.1.0',
  requiredVersion = '1.0.0',
  latestVersion = '1.0.4',
}: UpdateRequiredScreenProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updatePhase, setUpdatePhase] = useState<
    'idle' | 'downloading' | 'installing' | 'completed' | 'error'
  >('idle');
  const [isChecking, setIsChecking] = useState(false);

  const handleStartUpdate = () => {
    setIsUpdating(true);
    setUpdatePhase('downloading');
    setProgress(0);

    // Simulate download progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 18) + 12;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        setUpdatePhase('installing');

        // Simulate installing phase
        setTimeout(() => {
          setUpdatePhase('completed');
          setIsUpdating(false);
          showToast({
            type: 'success',
            message: 'Pembaruan berhasil dipasang. Aplikasi siap digunakan.',
          });
        }, 1200);
      } else {
        setProgress(p);
      }
    }, 250);
  };

  const handleCheckAgain = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      showToast({
        type: 'warning',
        message: `Server tetap membutuhkan minimal Bandrek v${requiredVersion}. Silakan lakukan pembaruan.`,
      });
    }, 800);
  };

  const handleFinish = () => {
    navigate('/kalender');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-(--color-canvas) p-4 select-none">
      <div className="w-full max-w-[500px] rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-xl flex flex-col gap-5">
        {/* Header Icon & Brand */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-(--color-brand) text-white font-bold text-2xl shadow-md">
              B
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#C50F1F] text-white border-2 border-white shadow-xs">
              <ArrowDownload16Regular className="text-[13px]" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 rounded bg-[#FDE7E9] px-2 py-0.5 text-[11px] font-semibold text-[#9B0C18] uppercase tracking-wider mb-1.5 border border-[#F1A2AB]">
              <Warning16Regular className="text-[12px]" />
              Pembaruan Wajib
            </div>
            <h1 className="text-[20px] font-semibold text-(--color-text-primary) tracking-tight">
              Aplikasi Perlu Diperbarui
            </h1>
            <p className="mt-1 text-[13px] text-(--color-text-secondary) leading-relaxed">
              Versi Bandrek di komputer ini sudah tidak didukung oleh server. Pasang versi terbaru untuk melanjutkan sinkronisasi data.
            </p>
          </div>
        </div>

        {/* Version Comparison Card */}
        <div className="rounded-md border border-(--color-border) bg-(--color-surface-alt) p-3 flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Perbandingan Versi
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded border border-(--color-border) bg-white p-2">
              <div className="text-[10.5px] text-(--color-text-muted)">Versi Anda</div>
              <div className="font-mono text-[13.5px] font-semibold text-[#C50F1F]">
                v{currentVersion}
              </div>
            </div>
            <div className="rounded border border-(--color-border) bg-white p-2">
              <div className="text-[10.5px] text-(--color-text-muted)">Min. Server</div>
              <div className="font-mono text-[13.5px] font-semibold text-(--color-text-primary)">
                v{requiredVersion}
              </div>
            </div>
            <div className="rounded border border-[#4CAF50] bg-[#E8F5E9] p-2">
              <div className="text-[10.5px] text-[#2E7D32] font-medium">Tersedia</div>
              <div className="font-mono text-[13.5px] font-bold text-[#2E7D32]">
                v{latestVersion}
              </div>
            </div>
          </div>
        </div>

        {/* Release Highlights */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Pembaruan di Versi {latestVersion}
          </div>
          <div className="rounded-md border border-(--color-border-subtle) bg-white p-3 text-[12px] text-(--color-text-secondary) flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <CheckmarkCircle16Regular className="text-[14px] text-[#2E7D32] flex-none mt-0.5" />
              <span>Protokol sinkronisasi baru untuk penanganan konflik suntingan antar-operator.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckmarkCircle16Regular className="text-[14px] text-[#2E7D32] flex-none mt-0.5" />
              <span>Dukungan penyimpanan luring (cache) baca-saja saat koneksi terputus.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckmarkCircle16Regular className="text-[14px] text-[#2E7D32] flex-none mt-0.5" />
              <span>Peningkatan performa kalkulasi matriks ketercapaian materi bimbel.</span>
            </div>
          </div>
        </div>

        {/* Update Progress Area (if updating or completed) */}
        {isUpdating && (
          <div className="rounded-md border border-(--color-brand) bg-(--color-brand-subtle) p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-(--color-brand-ink)">
                {updatePhase === 'downloading'
                  ? 'Mengunduh paket pembaruan...'
                  : 'Memasang pembaruan ke sistem...'}
              </span>
              <span className="font-mono text-[12px] font-bold text-(--color-brand-ink)">
                {progress}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white overflow-hidden">
              <div
                className="h-full bg-(--color-brand) transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] text-(--color-brand-ink) opacity-80">
              {updatePhase === 'downloading'
                ? `${Math.round((progress / 100) * 18.5 * 10) / 10} MB dari 18.5 MB`
                : 'Menyusun berkas aplikasi baru...'}
            </div>
          </div>
        )}

        {updatePhase === 'completed' && (
          <div className="rounded-md border border-[#4CAF50] bg-[#E8F5E9] p-3 text-[12.5px] text-[#2E7D32] flex items-center gap-2 font-medium">
            <CheckmarkCircle16Regular className="text-[18px] text-[#2E7D32] flex-none" />
            <span>Pembaruan selesai! Aplikasi kini berada pada versi v{latestVersion}.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1 border-t border-(--color-border-subtle)">
          {updatePhase === 'completed' ? (
            <button
              type="button"
              onClick={handleFinish}
              className="flex h-9 w-full items-center justify-center rounded-sm bg-(--color-brand) px-4 text-[13px] font-semibold text-white shadow-xs transition-colors duration-(--dur-fast) hover:bg-(--color-brand-hover) cursor-pointer"
            >
              Mulai Ulang & Buka Aplikasi
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartUpdate}
                disabled={isUpdating}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-sm bg-(--color-brand) px-4 text-[13px] font-semibold text-white shadow-xs transition-colors duration-(--dur-fast) hover:bg-(--color-brand-hover) disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowDownload16Regular className="text-[15px]" />
                <span>{isUpdating ? 'Sedang Memperbarui...' : 'Unduh & Pasang Pembaruan'}</span>
              </button>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCheckAgain}
                  disabled={isUpdating || isChecking}
                  className="flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[12px] font-medium text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text-primary) transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowSync16Regular
                    className={`text-[14px] ${isChecking ? 'animate-spin' : ''}`}
                  />
                  <span>Periksa lagi</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  disabled={isUpdating}
                  className="flex h-8 items-center rounded-sm px-2.5 text-[12px] font-medium text-(--color-text-secondary) hover:bg-(--color-surface-alt) hover:text-(--color-text-primary) transition-colors cursor-pointer"
                >
                  Ke Halaman Masuk
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="flex items-start gap-1.5 text-[11.5px] text-(--color-text-muted) leading-relaxed">
          <Info16Regular className="text-[13px] flex-none mt-0.5" />
          <span>
            Jika pembaruan otomatis tidak dapat dilanjutkan karena batasan izin sistem komputer, hubungi penanggung jawab teknis bimbel Anda untuk mendapatkan berkas pemasang mandiri (.msi / .exe).
          </span>
        </div>
      </div>
    </div>
  );
}
