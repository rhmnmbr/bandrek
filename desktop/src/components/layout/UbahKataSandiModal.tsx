import { useState, useEffect, useRef } from 'react';
import { Warning16Regular, Dismiss16Regular, LockClosed16Regular } from '@fluentui/react-icons';
import { useAuthSession, useChangePassword } from '@/data/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { PasswordInput } from '@/components/ui/input';

export interface UbahKataSandiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UbahKataSandiModal({ isOpen, onClose }: UbahKataSandiModalProps) {
  const { data: session } = useAuthSession();
  const changePasswordMutation = useChangePassword();
  const { showToast } = useToast();

  const [kataSandiLama, setKataSandiLama] = useState('');
  const [kataSandiBaru, setKataSandiBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lamaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setKataSandiLama('');
      setKataSandiBaru('');
      setKonfirmasi('');
      setErrorMsg(null);
      setIsSubmitting(false);
      setTimeout(() => lamaInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard shortcut Esc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const user = session?.user;
  const isAdmin = user?.peran === 'admin';

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!kataSandiLama) {
      setErrorMsg('Kata sandi saat ini wajib diisi.');
      return;
    }
    if (!kataSandiBaru) {
      setErrorMsg('Kata sandi baru wajib diisi.');
      return;
    }
    if (kataSandiBaru.length < 4) {
      setErrorMsg('Kata sandi baru minimal 4 karakter.');
      return;
    }
    if (kataSandiBaru !== konfirmasi) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (kataSandiBaru === kataSandiLama) {
      setErrorMsg('Kata sandi baru harus berbeda dari kata sandi saat ini.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePasswordMutation.mutateAsync({
        kataSandiLama,
        kataSandiBaru,
      });

      showToast({
        type: 'success',
        message: 'Kata sandi berhasil diperbarui.',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ubah-sandi-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-100 rounded-lg border border-(--color-border-strong) bg-(--color-surface) shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-(--color-border) bg-(--color-surface-alt) px-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded bg-(--color-brand-subtle) text-(--color-brand)">
              <LockClosed16Regular className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="modal-ubah-sandi-title"
                className="text-[13.5px] font-semibold text-(--color-text-primary) leading-tight truncate"
              >
                Ubah kata sandi akun
              </h2>
              <div className="text-[11px] text-(--color-text-muted) truncate">
                {user?.nama || 'Pengguna'} · {isAdmin ? 'Administrator' : 'Operator'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Tutup (Esc)"
            className="flex h-6.5 w-6.5 items-center justify-center rounded-sm text-(--color-text-muted) hover:bg-(--color-surface) hover:text-(--color-text-primary) transition-colors cursor-pointer"
          >
            <Dismiss16Regular className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          {errorMsg && (
            <div className="rounded-sm border border-(--color-danger) bg-(--color-danger-subtle) p-2 text-xs text-(--color-danger-fg) flex items-center gap-1.5 leading-snug">
              <Warning16Regular className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Kata Sandi Saat Ini */}
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-medium text-(--color-text-secondary)">
              Kata sandi saat ini <span className="text-(--color-danger)">*</span>
            </label>
            <PasswordInput
              ref={lamaInputRef}
              value={kataSandiLama}
              onChange={(e) => setKataSandiLama(e.target.value)}
              placeholder="Masukkan kata sandi saat ini"
              autoComplete="current-password"
            />
          </div>

          {/* Kata Sandi Baru */}
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-medium text-(--color-text-secondary)">
              Kata sandi baru <span className="text-(--color-danger)">*</span>
            </label>
            <PasswordInput
              value={kataSandiBaru}
              onChange={(e) => setKataSandiBaru(e.target.value)}
              placeholder="Minimal 4 karakter"
              autoComplete="new-password"
            />
          </div>

          {/* Ulangi Kata Sandi Baru */}
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-medium text-(--color-text-secondary)">
              Ulangi kata sandi baru <span className="text-(--color-danger)">*</span>
            </label>
            <PasswordInput
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              placeholder="Ketik ulang kata sandi baru"
              autoComplete="new-password"
            />
          </div>

          <div className="text-[11px] text-(--color-text-muted) leading-snug">
            Gunakan kombinasi yang aman dan mudah diingat untuk masuk ke aplikasi Bandrek.
          </div>

          {/* Actions */}
          <div className="flex h-10 items-center justify-end gap-2 border-t border-(--color-border) pt-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-7 px-3 rounded-sm border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] font-medium cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-7 px-3.5 rounded-sm border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan kata sandi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
