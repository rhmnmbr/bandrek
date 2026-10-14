import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Warning16Regular, Server16Regular } from '@fluentui/react-icons';
import { useLogin, useAuthSession } from '@/data/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { BandrekLogo } from '@/components/ui/bandrek-logo';

export function LoginScreen() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const loginMutation = useLogin();
  const { data: session, isLoading: isSessionLoading } = useAuthSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to main app
  useEffect(() => {
    if (session && !isSessionLoading) {
      navigate('/kalender', { replace: true });
    }
  }, [session, isSessionLoading, navigate]);

  const serverUrl =
    localStorage.getItem('bandrek:server-url') || 'http://localhost:5109';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Nama pengguna dan kata sandi wajib diisi.');
      return;
    }

    setErrorMsg(null);
    try {
      const session = await loginMutation.mutateAsync({
        serverUrl,
        username: username.trim(),
        password,
      });

      showToast({
        type: 'success',
        message: `Selamat datang, ${session.user.nama}.`,
      });
      navigate('/kalender');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Nama pengguna atau kata sandi tidak valid.');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-(--color-canvas) p-4 select-none">
      <div className="w-full max-w-[400px] rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-xl flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <BandrekLogo className="h-10 w-auto max-w-[220px] text-[#4D5962] mb-1" />
          <div>
            <h1 className="text-[19px] font-semibold text-(--color-text-primary) tracking-tight">
              Masuk ke Bandrek
            </h1>
            <p className="text-xs text-(--color-text-muted) leading-relaxed mt-0.5">
              Sistem Manajemen Kegiatan & Matriks Belajar Bimbel
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          {errorMsg && (
            <div className="rounded-sm border border-(--color-danger) bg-(--color-danger-subtle) p-2 text-xs text-(--color-danger-fg) flex items-center gap-1.5 leading-snug">
              <Warning16Regular className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-(--color-text-secondary)">
              Nama pengguna
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username atau email"
              autoFocus
              className="h-8 rounded-sm border border-(--color-border) bg-(--color-surface) px-2.5 text-[13.5px] outline-none focus:border-(--color-brand) transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-(--color-text-secondary)">
              Kata sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi akun"
              className="h-8 rounded-sm border border-(--color-border) bg-(--color-surface) px-2.5 text-[13.5px] outline-none focus:border-(--color-brand) transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-1 h-8.5 rounded-sm border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loginMutation.isPending ? 'Memeriksa...' : 'Masuk'}</span>
          </button>
        </form>

        {/* Server Setting Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-(--color-border)">
          <Link
            to="/setup-server"
            className="text-[12px] text-(--color-text-muted) hover:text-(--color-brand) hover:underline transition-colors flex items-center gap-1.5 cursor-pointer select-none"
          >
            <Server16Regular className="w-3.5 h-3.5 text-(--color-text-muted)" />
            <span>Pengaturan server</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
