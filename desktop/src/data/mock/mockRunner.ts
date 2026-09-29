import { BandrekApiError, type SimulasiConfig } from '../types/simulasi';

// In-memory or localStorage configuration for simulation
const STORAGE_KEY = 'bandrek_simulasi_config';

const DEFAULT_CONFIG: SimulasiConfig = {
  latencyMs: 150, // Default 150ms for realistic desktop app feel, toggleable to 0 or higher
  errorType: 'none',
  offlineBannerVisible: false,
  lastSyncedAt: new Date().toISOString(),
  simulatedToday: '2026-09-16',
  simulatedNow: '11:39',
};

class SimulasiManager {
  private config: SimulasiConfig;
  private listeners: Set<(config: SimulasiConfig) => void> = new Set();

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SimulasiConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback if localStorage unavailable
    }
    return { ...DEFAULT_CONFIG };
  }

  public getConfig(): SimulasiConfig {
    return { ...this.config };
  }

  public updateConfig(patch: Partial<SimulasiConfig>): void {
    this.config = { ...this.config, ...patch };
    if (patch.errorType !== undefined) {
      this.config.offlineBannerVisible = patch.errorType === 'offline';
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // Ignore storage errors
    }
    this.notify();
  }

  public subscribe(listener: (config: SimulasiConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const current = this.getConfig();
    this.listeners.forEach((fn) => fn(current));
  }
}

export const simulasiManager = new SimulasiManager();

/**
 * Wraps mock repository methods with simulated network latency and error injection.
 */
export async function mockRunner<T>(
  action: () => T | Promise<T>,
  options: { isMutation?: boolean } = {}
): Promise<T> {
  const config = simulasiManager.getConfig();

  // 1. Error Injection
  if (config.errorType === 'offline') {
    throw new BandrekApiError(
      'offline',
      'Tidak terhubung ke server. Mode baca cache lokal aktif (Offline).',
      0
    );
  }

  if (config.errorType === 'unauthorized') {
    throw new BandrekApiError(
      'unauthorized',
      'Sesi autentikasi telah kedaluwarsa atau tidak valid (401 Unauthorized). Silakan login kembali.',
      401
    );
  }

  if (config.errorType === 'update_required') {
    throw new BandrekApiError(
      'update_required',
      'Versi aplikasi ini tidak lagi didukung oleh server (426 Update Required). Silakan perbarui aplikasi.',
      426
    );
  }

  if (config.errorType === 'concurrency_conflict' && options.isMutation) {
    throw new BandrekApiError(
      'concurrency_conflict',
      'Data telah diubah oleh operator lain saat Anda sedang mengedit (409 Conflict). Muat ulang untuk melihat perubahan terbaru.',
      409
    );
  }

  // 2. Simulated Latency
  if (config.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, config.latencyMs));
  }

  // 3. Execute action
  return await action();
}
