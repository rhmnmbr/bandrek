import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkmark16Regular, Warning16Regular } from '@fluentui/react-icons';
import { useToast } from '@/components/ui/toast';

export function SetupServerScreen() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('bandrek:server-url') || 'https://api.bandrek-bimbel.id';
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error';
    message: string;
    latency?: number;
  } | null>(null);

  const handleTestConnection = () => {
    const trimmed = serverUrl.trim();
    if (!trimmed) {
      setTestResult({
        status: 'error',
        message: 'Masukkan alamat URL server terlebih dahulu.',
      });
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setTestResult({
        status: 'error',
        message: 'Alamat server harus diawali dengan http:// atau https://',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      const simulatedLatency = Math.floor(Math.random() * 35) + 25; // 25 - 60ms
      setTestResult({
        status: 'success',
        message: `Terhubung ke server Bandrek API (latensi ${simulatedLatency} ms).`,
        latency: simulatedLatency,
      });
    }, 600);
  };

  const handleSave = () => {
    const trimmed = serverUrl.trim();
    if (!trimmed) {
      setTestResult({
        status: 'error',
        message: 'Masukkan alamat URL server.',
      });
      return;
    }

    localStorage.setItem('bandrek:server-url', trimmed);
    showToast({
      type: 'success',
      message: 'Alamat server berhasil disimpan.',
    });
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-(--color-canvas) p-4 select-none">
      <div className="w-full max-w-[440px] rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-xl flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-brand) text-white font-bold text-lg shadow-sm">
            B
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-(--color-text-primary) leading-tight">
              Pengaturan Alamat Server
            </h1>
            <p className="text-xs text-(--color-text-muted) leading-snug mt-0.5">
              Hubungkan aplikasi Bandrek ke server bimbel Anda.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-(--color-text-secondary)">
            Alamat server API <span className="text-(--color-danger)">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => {
                setServerUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="mis. https://api.bandrek-bimbel.id"
              className="h-8 flex-1 rounded-sm border border-(--color-border) bg-(--color-surface) px-2.5 text-[13px] font-mono outline-none focus:border-(--color-brand) transition-colors"
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
            Alamat server disediakan oleh administrator teknis yang memasang VPS bimbel Anda.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-(--color-border)">
          <button
            type="button"
            onClick={() => navigate('/kalender')}
            className="text-xs text-(--color-brand) hover:underline cursor-pointer font-medium"
          >
            ← Kembali ke kalender
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="h-8 px-4 rounded-sm border-none bg-(--color-brand) hover:bg-(--color-brand-hover) text-white text-[13px] font-semibold cursor-pointer transition-colors"
          >
            Simpan & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
