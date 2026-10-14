import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkmark16Regular, Warning16Regular, ArrowLeft16Regular } from '@fluentui/react-icons';
import { useToast } from '@/components/ui/toast';
import { BandrekCupIcon } from '@/components/ui/bandrek-logo';
import { encodeServerUrl, decodeServerUrl } from '@/data/api/client';

export function SetupServerScreen() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [serverCode, setServerCode] = useState(() => {
    const storedCode = localStorage.getItem('bandrek:server-code');
    if (storedCode) return storedCode;
    const storedUrl = localStorage.getItem('bandrek:server-url') || 'http://localhost:5109';
    return encodeServerUrl(storedUrl);
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error';
    message: string;
    latency?: number;
  } | null>(null);

  const handleTestConnection = async () => {
    const trimmed = serverCode.trim();
    if (!trimmed) {
      setTestResult({
        status: 'error',
        message: 'Masukkan kode koneksi server terlebih dahulu.',
      });
      return;
    }

    const decoded = decodeServerUrl(trimmed);
    if (!decoded || (!decoded.startsWith('http://') && !decoded.startsWith('https://'))) {
      setTestResult({
        status: 'error',
        message: 'Kode koneksi tidak valid. Pastikan kode yang dimasukkan benar.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const start = performance.now();
    try {
      const cleanBase = decoded.replace(/\/+$/, '');
      const res = await fetch(`${cleanBase}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain' },
      });

      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        setTestResult({
          status: 'success',
          message: `Terhubung ke server Bandrek API (latensi ${latency} ms).`,
          latency,
        });
      } else {
        setTestResult({
          status: 'error',
          message: `Server merespons status ${res.status}: ${res.statusText}`,
          latency,
        });
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setTestResult({
        status: 'error',
        message: `Gagal terhubung ke server (latensi ${latency} ms). Pastikan server aktif dan kode benar.`,
        latency,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = serverCode.trim();
    if (!trimmed) {
      setTestResult({
        status: 'error',
        message: 'Masukkan kode koneksi server.',
      });
      return;
    }

    const decoded = decodeServerUrl(trimmed);
    if (!decoded) {
      setTestResult({
        status: 'error',
        message: 'Kode koneksi tidak valid.',
      });
      return;
    }

    const cleanCode = encodeServerUrl(decoded);
    localStorage.setItem('bandrek:server-code', cleanCode);
    localStorage.setItem('bandrek:server-url', decoded);

    showToast({
      type: 'success',
      message: 'Kode koneksi server berhasil disimpan.',
    });
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-(--color-canvas) p-4 select-none">
      <div className="w-full max-w-[440px] rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-xl flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <BandrekCupIcon className="h-9 w-9 text-[#4D5962] shrink-0" />
          <div>
            <h1 className="text-[17px] font-semibold text-(--color-text-primary) leading-tight">
              Pengaturan Koneksi Server
            </h1>
            <p className="text-xs text-(--color-text-muted) leading-snug mt-0.5">
              Hubungkan aplikasi Bandrek ke server bimbel Anda menggunakan kode koneksi.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-(--color-text-secondary)">
            Kode koneksi server <span className="text-(--color-danger)">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={serverCode}
              onChange={(e) => {
                setServerCode(e.target.value);
                setTestResult(null);
              }}
              placeholder="mis. aHR0cDovL2FwaS5iYW5kcmVr..."
              className="h-8 flex-1 rounded-sm border border-(--color-border) bg-(--color-surface) px-2.5 text-[12.5px] font-mono outline-none focus:border-(--color-brand) transition-colors"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="h-8 px-3 rounded-sm border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-[12px] font-medium text-(--color-text-primary) cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isTesting ? 'Menguji...' : 'Tes koneksi'}
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`rounded-sm p-2 text-xs flex items-center gap-1.5 leading-snug ${
                testResult.status === 'success'
                  ? 'border border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
                  : 'border border-(--color-danger) bg-(--color-danger-subtle) text-(--color-danger-fg)'
              }`}
            >
              <span className="flex-none flex items-center">
                {testResult.status === 'success' ? (
                  <Checkmark16Regular className="w-3.5 h-3.5 text-[#2E7D32]" />
                ) : (
                  <Warning16Regular className="w-3.5 h-3.5 text-(--color-danger-fg)" />
                )}
              </span>
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="text-[11px] text-(--color-text-muted) leading-relaxed mt-1">
            Kode koneksi disediakan oleh administrator teknis yang memasang server bimbel Anda. Kode ini mengamankan informasi server agar mudah dibagikan tanpa menampilkan alamat IP atau port teknis.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-(--color-border)">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-xs text-(--color-brand) hover:underline cursor-pointer font-medium select-none"
          >
            <ArrowLeft16Regular className="w-3.5 h-3.5" />
            <span>Kembali ke login</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="h-8 px-4 rounded-sm border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[13px] font-semibold cursor-pointer transition-colors"
          >
            Simpan & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
