import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Warning16Regular, LockClosed24Regular, Add16Regular, Person24Regular, Search24Regular } from '@fluentui/react-icons';
import type { PeranUser, User } from '@/data/types/auth';
import {
  useUsersList,
  useAuthSession,
  useCreateUser,
  useUpdateUser,
} from '@/data/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { PasswordInput } from '@/components/ui/input';
import { MasterTableSkeleton, FormPanelSkeleton, UserManagementSkeleton } from '@/components/skeleton';
import { useMinimumLoading } from '@/lib/useMinimumLoading';

export interface UserFormData {
  nama: string;
  username: string;
  password?: string;
  peran: PeranUser;
  aktif?: boolean;
}

interface UserFormViewProps {
  user: User | null;
  isNewMode: boolean;
  users: User[];
  currentUserId?: string;
  onSave: (data: UserFormData) => Promise<void>;
  onToggleAktif: () => void;
  onCancel: () => void;
}

function UserFormView({
  user,
  isNewMode,
  users,
  currentUserId,
  onSave,
  onToggleAktif,
  onCancel,
}: UserFormViewProps) {
  // Local form state initialized directly from props (reset cleanly on key change)
  const [nama, setNama] = useState(user?.nama || '');
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [peran, setPeran] = useState<PeranUser>(user?.peran || 'operator');
  const aktif = user?.aktif ?? true;
  const [dicoba, setDicoba] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const namaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNewMode) {
      setTimeout(() => namaInputRef.current?.focus(), 50);
    }
  }, [isNewMode]);

  // Validation
  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!nama.trim()) errs.push('Isi nama lengkap pengguna.');
    if (!username.trim()) errs.push('Isi nama pengguna (username).');
    else {
      const isDuplicate = users.some(
        (u) =>
          u.id !== user?.id &&
          u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (isDuplicate) errs.push('Nama pengguna (username) sudah dipakai.');
    }

    if (isNewMode && !password) {
      errs.push('Isi kata sandi untuk pengguna baru.');
    }

    // Protection: Last active admin
    const activeAdmins = users.filter((u) => u.peran === 'admin' && u.aktif);
    if (
      user &&
      user.peran === 'admin' &&
      activeAdmins.length === 1 &&
      (!aktif || peran !== 'admin')
    ) {
      errs.push('Harus ada minimal satu akun admin yang aktif.');
    }

    return errs;
  }, [nama, username, password, peran, aktif, isNewMode, users, user]);

  const hasNamaError = dicoba && !nama.trim();
  const hasUsernameError =
    dicoba &&
    (!username.trim() ||
      errors.includes('Nama pengguna (username) sudah dipakai.'));
  const hasPasswordError = dicoba && isNewMode && !password;

  const handleSubmit = useCallback(async () => {
    setDicoba(true);
    if (errors.length > 0) {
      if (hasNamaError) namaInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        nama: nama.trim(),
        username: username.trim().toLowerCase(),
        ...(password ? { password } : {}),
        peran,
        aktif,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [errors, hasNamaError, onSave, nama, username, password, peran, aktif]);

  // Keyboard shortcut Ctrl+S and Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, onCancel]);

  const initials = isNewMode
    ? '+'
    : (user?.nama || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

  const isCurrentLoggedInUser = currentUserId === user?.id;

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-(--color-surface-alt)">
      {/* Header */}
      <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-(--color-border) bg-(--color-surface) px-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--color-brand-subtle) text-(--color-brand) text-[12.5px] font-semibold">
          {isNewMode ? <Add16Regular className="w-4 h-4" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-(--color-text-primary) leading-tight truncate">
            {isNewMode ? 'Pengguna baru' : user?.nama}
          </div>
          <div className="text-[11.5px] text-(--color-text-muted) leading-snug truncate">
            {isNewMode
              ? 'Isi akun operator bimbel baru'
              : `${user?.peran === 'admin' ? 'Administrator' : 'Operator'} · ${
                  user?.aktif ? 'Aktif' : 'Nonaktif'
                }`}
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
        {dicoba && errors.length > 0 && (
          <div className="rounded-md border border-(--color-danger) bg-(--color-danger-subtle) p-2 text-xs leading-relaxed text-(--color-danger-fg)">
            <div className="font-semibold flex items-center gap-1.5">
              <Warning16Regular className="w-4 h-4 shrink-0" />
              <span>Belum bisa disimpan — {errors.length} hal perlu dibereskan:</span>
            </div>
            <ul className="mt-1 list-disc pl-6 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-4.5">
            Nama lengkap <span className="text-(--color-danger)">*</span>
          </label>
          <input
            ref={namaInputRef}
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="mis. Budi Santoso"
            className={`h-7 px-2 text-[13.5px] rounded-sm border bg-(--color-surface) outline-none transition-colors ${
              hasNamaError
                ? 'border-(--color-danger) focus:border-(--color-danger)'
                : 'border-(--color-border) focus:border-(--color-brand)'
            }`}
          />
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-4.5">
            Nama pengguna (username) <span className="text-(--color-danger)">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isNewMode}
            placeholder="mis. budi"
            className={`h-7 px-2 text-[13.5px] font-mono rounded-sm border bg-(--color-surface) outline-none transition-colors ${
              hasUsernameError
                ? 'border-(--color-danger) focus:border-(--color-danger)'
                : 'border-(--color-border) focus:border-(--color-brand)'
            } ${!isNewMode ? 'bg-(--color-surface-disabled) cursor-not-allowed opacity-75' : ''}`}
          />
          {!isNewMode && (
            <span className="text-[10.5px] text-(--color-text-muted)">
              Username tidak dapat diubah setelah dibuat.
            </span>
          )}
        </div>

        {/* Kata Sandi */}
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) flex items-center gap-1 min-h-4.5">
            Kata sandi {isNewMode && <span className="text-(--color-danger)">*</span>}
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              isNewMode
                ? 'Kata sandi akun'
                : 'Kosongkan jika tidak ingin mengubah sandi'
            }
            error={hasPasswordError}
            autoComplete="new-password"
          />
        </div>

        {/* Peran Segmented Control */}
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] text-(--color-text-secondary) min-h-4.5">
            Peran hak akses
          </label>
          <div className="flex border border-(--color-border) rounded-sm overflow-hidden h-7">
            <button
              type="button"
              onClick={() => setPeran('operator')}
              className={`flex-1 text-[12px] cursor-pointer border-none ${
                peran === 'operator'
                  ? 'bg-(--color-brand) text-white font-semibold'
                  : 'bg-(--color-surface) text-(--color-text-primary) hover:bg-(--color-surface-alt)'
              }`}
            >
              Operator
            </button>
            <button
              type="button"
              onClick={() => setPeran('admin')}
              className={`flex-1 text-[12px] cursor-pointer border-none border-l border-(--color-border) ${
                peran === 'admin'
                  ? 'bg-(--color-brand) text-white font-semibold'
                  : 'bg-(--color-surface) text-(--color-text-primary) hover:bg-(--color-surface-alt)'
              }`}
            >
              Admin
            </button>
          </div>
          <div className="text-[11px] text-(--color-text-muted) leading-snug">
            Admin dapat mengelola data pengguna dan konfigurasi server.
          </div>
        </div>

        {/* Info Box */}
        {!isNewMode && user && (
          <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 text-xs text-(--color-text-secondary)">
            <div className="text-[10.5px] font-semibold text-(--color-text-muted) tracking-wider">
              INFORMASI AKUN
            </div>
            <div className="mt-1">
              Dibuat pada: <span className="font-mono">{user.dibuatPada || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3.5">
        {!isNewMode && user && (
          <button
            type="button"
            onClick={onToggleAktif}
            disabled={isCurrentLoggedInUser}
            title={
              isCurrentLoggedInUser
                ? 'Tidak bisa menonaktifkan akun yang sedang digunakan'
                : undefined
            }
            className={`h-6.5 px-2.5 rounded border-none text-[12.5px] transition-colors ${
              isCurrentLoggedInUser
                ? 'bg-transparent text-(--color-text-disabled) cursor-not-allowed'
                : user.aktif
                ? 'bg-transparent text-(--color-danger) hover:bg-(--color-danger-subtle) cursor-pointer'
                : 'bg-transparent text-[#2E7D32] hover:bg-[#E8F5E9] cursor-pointer'
            }`}
          >
            {user.aktif ? 'Nonaktifkan' : 'Aktifkan kembali'}
          </button>
        )}

        <div className="flex-1 min-w-1.5" />

        <button
          type="button"
          onClick={onCancel}
          className="h-6.5 px-3 rounded border border-(--color-border-strong) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-primary) text-[12.5px] font-medium cursor-pointer transition-colors"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-6.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>{isNewMode ? 'Simpan pengguna' : 'Simpan'}</span>
        </button>
      </div>
    </div>
  );
}

export function UserManagementScreen() {
  const navigate = useNavigate();
  const { data: users = [], isLoading: isLoadingUsers } = useUsersList();
  const { data: currentSession, isLoading: isLoadingSession } = useAuthSession();
  const { showToast } = useToast();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Search filter
  const [cari, setCari] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let res = [...users];
    if (cari.trim()) {
      const q = cari.trim().toLowerCase();
      res = res.filter(
        (u) =>
          u.nama.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
      );
    }
    return res.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  }, [users, cari]);

  // Selected User: stable synchronous resolution without race condition intermediate states
  const effectiveUserId = useMemo(() => {
    if (isNewMode) return null;
    if (selectedUserId && users.some((u) => u.id === selectedUserId)) {
      return selectedUserId;
    }
    return filteredUsers[0]?.id ?? null;
  }, [isNewMode, selectedUserId, users, filteredUsers]);

  const selectedUser = useMemo(() => {
    if (!effectiveUserId) return null;
    return users.find((u) => u.id === effectiveUserId) ?? null;
  }, [users, effectiveUserId]);

  // Handlers
  const handleNewUser = useCallback(() => {
    setIsNewMode(true);
    setSelectedUserId(null);
  }, []);

  const handleSelectUser = useCallback((id: string) => {
    setIsNewMode(false);
    setSelectedUserId(id);
  }, []);

  const handleCancel = useCallback(() => {
    if (isNewMode) {
      setIsNewMode(false);
    }
  }, [isNewMode]);

  const handleSaveUser = useCallback(
    async (formData: UserFormData) => {
      if (isNewMode) {
        const created = await createUserMutation.mutateAsync({
          nama: formData.nama,
          username: formData.username,
          password: formData.password || '',
          peran: formData.peran,
        });
        showToast({
          type: 'success',
          message: `Akun ${created.nama} berhasil ditambahkan.`,
        });
        setIsNewMode(false);
        setSelectedUserId(created.id);
      } else if (selectedUser) {
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          input: {
            nama: formData.nama,
            peran: formData.peran,
            aktif: formData.aktif,
            ...(formData.password ? { password: formData.password } : {}),
          },
        });
        showToast({
          type: 'success',
          message: 'Perubahan akun disimpan.',
        });
      }
    },
    [isNewMode, selectedUser, createUserMutation, updateUserMutation, showToast]
  );

  const handleToggleAktif = useCallback(() => {
    if (!selectedUser) return;

    const isCurrentLoggedIn = currentSession?.user?.id === selectedUser.id;
    if (isCurrentLoggedIn && selectedUser.aktif) {
      showToast({
        type: 'error',
        message: 'Tidak bisa menonaktifkan akun yang sedang digunakan saat ini.',
      });
      return;
    }

    const nextAktif = !selectedUser.aktif;
    updateUserMutation.mutate(
      { id: selectedUser.id, input: { aktif: nextAktif } },
      {
        onSuccess: () => {
          showToast({
            type: 'success',
            message: `Akun ${selectedUser.nama} ${
              nextAktif ? 'diaktifkan kembali' : 'dinonaktifkan'
            }.`,
            action: {
              label: 'Urungkan',
              onClick: () => {
                updateUserMutation.mutate({
                  id: selectedUser.id,
                  input: { aktif: selectedUser.aktif },
                });
              },
            },
          });
        },
      }
    );
  }, [selectedUser, currentSession, updateUserMutation, showToast]);

  // Keyboard shortcut Ctrl+N on screen level
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewUser();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewUser]);

  const isPageLoading = useMinimumLoading(
    ((isLoadingUsers && !cari) || isLoadingSession) && users.length === 0,
    350
  );
  if (isPageLoading) {
    return <UserManagementSkeleton />;
  }

  // Guard: Hanya admin yang berhak mengakses Manajemen Pengguna (DOMAIN.md & B6-izin)
  const isAdmin = currentSession?.user?.peran === 'admin';
  if (currentSession && !isAdmin) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center select-none bg-(--color-canvas) h-full">
        <div className="w-full max-w-md rounded-lg border border-(--color-border-strong) bg-(--color-surface) p-6 shadow-md flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3E0] text-[#8A5200]">
            <LockClosed24Regular className="text-2xl" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-(--color-text-primary)">
              Akses Terbatas
            </h2>
            <div className="mt-1">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#EBF3FC] text-[#0C548F] border border-[#C5DCFA]">
                Peran: {currentSession.user?.peran === 'operator' ? 'Operator' : currentSession.user?.peran}
              </span>
            </div>
            <p className="mt-3 text-xs text-(--color-text-secondary) leading-relaxed">
              Menu <strong>Manajemen Pengguna</strong> hanya dapat diakses oleh Administrator. Silakan hubungi admin bimbel jika Anda memerlukan penambahan atau perubahan akun.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/kalender')}
            className="mt-2 h-7.5 px-4 rounded bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Kembali ke Kalender
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-(--color-surface)">
      {/* Left Column (Table, flex 1) */}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col border-r border-(--color-border) bg-(--color-surface)">
        {/* Meta & Filter Toolbar */}
        <div className="flex flex-col shrink-0">
          <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-3.5 bg-(--color-surface)">
            <div className="shrink-0 text-[12.5px] text-(--color-text-muted) whitespace-nowrap">
              {users.length} akun operator & admin
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleNewUser}
              className="flex h-6.5 shrink-0 items-center gap-1.5 px-3 rounded border-none bg-(--color-brand) hover:bg-(--color-brand-pressed) text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <Add16Regular className="w-3.5 h-3.5 shrink-0" />
              <span>Pengguna baru</span>
            </button>
          </div>

          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-xs">
            <input
              type="text"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama atau username"
              className="h-6.5 flex-1 min-w-0 max-w-70 rounded-sm border border-(--color-border) bg-(--color-surface) px-2 text-xs outline-none focus:border-(--color-brand) transition-colors"
            />
            {cari && (
              <button
                type="button"
                onClick={() => setCari('')}
                className="flex h-6.5 shrink-0 items-center px-2 border-none bg-transparent text-(--color-brand) text-xs cursor-pointer rounded hover:bg-(--color-brand-subtle) whitespace-nowrap transition-colors"
              >
                Reset filter
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        {isLoadingUsers ? (
          <MasterTableSkeleton
            rowCount={8}
            columns={[
              { width: 'flex-1 min-w-40', isFlex: true, headerTitle: 'PENGGUNA' },
              { width: 'w-30', headerTitle: 'USERNAME' },
              { width: 'w-22.5', headerTitle: 'PERAN' },
              { width: 'w-20', headerTitle: 'STATUS', align: 'right' },
            ]}
          />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col min-h-full">
              <div className="sticky top-0 z-3 flex h-6.5 shrink-0 items-center border-b border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[10.5px] font-semibold tracking-wider text-(--color-text-muted)">
                <div className="flex-1 min-w-40 pr-2">PENGGUNA</div>
                <div className="w-30 shrink-0 pr-2">USERNAME</div>
                <div className="w-22.5 shrink-0 pr-2">PERAN</div>
                <div className="w-20 shrink-0 text-right pr-2">STATUS</div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-(--color-surface-sunken) flex items-center justify-center text-(--color-text-muted) mb-3">
                    {cari ? (
                      <Search24Regular className="w-6 h-6" />
                    ) : (
                      <Person24Regular className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">
                    {cari ? 'Tidak ada pengguna yang cocok' : 'Belum ada pengguna'}
                  </h3>
                  <p className="text-xs text-(--color-text-muted) max-w-70 mb-3 leading-relaxed">
                    {cari
                      ? `Pencarian "${cari}" tidak menemukan pengguna mana pun.`
                      : 'Belum ada data operator yang tersimpan.'}
                  </p>
                  {cari && (
                    <button
                      type="button"
                      onClick={() => setCari('')}
                      className="h-6.5 px-3 border border-(--color-border-strong) rounded bg-white text-(--color-text-primary) text-xs cursor-pointer hover:bg-(--color-surface-alt) transition-colors"
                    >
                      Reset pencarian
                    </button>
                  )}
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = !isNewMode && effectiveUserId === u.id;
                  const isCurrentUser = currentSession?.user?.id === u.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u.id)}
                      className={`flex h-9 shrink-0 items-center border-b border-(--color-border-subtle) px-3.5 text-[12.5px] cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-(--color-brand-subtle) shadow-[inset_3px_0_0_var(--color-brand)]'
                          : 'bg-(--color-surface) hover:bg-(--color-surface-alt)'
                      }`}
                    >
                      {/* Nama & Avatar */}
                      <div className="flex-1 min-w-40 flex items-center gap-2 truncate pr-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-brand-subtle) text-(--color-brand) text-[10.5px] font-semibold">
                          {u.nama
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <span
                          className={`truncate ${
                            isSelected
                              ? 'font-semibold text-(--color-text-primary)'
                              : 'font-normal text-(--color-text-primary)'
                          } ${!u.aktif ? 'text-(--color-text-muted) line-through' : ''}`}
                        >
                          {u.nama}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-(--color-brand-subtle) text-(--color-brand) font-semibold px-1 rounded">
                            Anda
                          </span>
                        )}
                      </div>

                      {/* Username */}
                      <div className="w-30 shrink-0 text-xs font-mono text-(--color-text-secondary) truncate pr-2">
                        {u.username}
                      </div>

                      {/* Peran Pill */}
                      <div className="w-22.5 shrink-0 pr-2">
                        <span
                          className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10px] font-semibold border ${
                            u.peran === 'admin'
                              ? 'border-[#8764B8] bg-[#F3EFFA] text-[#5B4394]'
                              : 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand)'
                          }`}
                        >
                          {u.peran === 'admin' ? 'Admin' : 'Operator'}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="w-20 shrink-0 text-right pr-2">
                        <span
                          className={`inline-flex items-center h-4.5 px-2 rounded-full text-[10px] font-semibold border ${
                            u.aktif
                              ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
                              : 'border-(--color-border) bg-(--color-surface-alt) text-(--color-text-muted)'
                          }`}
                        >
                          {u.aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex h-7.5 shrink-0 items-center border-t border-(--color-border) bg-(--color-surface-alt) px-3.5 text-[11.5px] text-(--color-text-muted)">
          Menampilkan {filteredUsers.length} dari {users.length} pengguna
        </div>
      </div>

      {/* Right Column (Form Panel, 352px) */}
      <div className="flex w-88 flex-[0_0_352px] min-w-0 min-h-0 flex-col overflow-hidden bg-(--color-surface-alt)">
        {isLoadingUsers ? (
          <FormPanelSkeleton title="Memuat pengguna..." />
        ) : selectedUser || isNewMode ? (
          <UserFormView
            key={isNewMode ? 'user-baru' : `user-${selectedUser?.id}`}
            user={selectedUser}
            isNewMode={isNewMode}
            users={users}
            currentUserId={currentSession?.user?.id}
            onSave={handleSaveUser}
            onToggleAktif={handleToggleAktif}
            onCancel={handleCancel}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-(--color-text-secondary)">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-(--color-surface-sunken) flex items-center justify-center text-(--color-text-muted) mb-3">
                <Person24Regular className="w-6 h-6" />
              </div>
              <div className="text-[14px] font-semibold text-(--color-text-primary) mb-1">
                Pilih atau buat pengguna
              </div>
              <div className="text-xs text-(--color-text-muted) max-w-70 mx-auto leading-relaxed">
                Pilih pengguna dari daftar di sebelah kiri untuk melihat atau mengubah akun operator bimbel.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
