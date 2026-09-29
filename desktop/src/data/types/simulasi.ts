// ==========================================
// SIMULASI SERVER & ERROR INJECTION (PHASE 3)
// ==========================================

export type ErrorInjectionType =
  | 'none'
  | 'offline'
  | 'unauthorized'
  | 'concurrency_conflict'
  | 'update_required';

export interface SimulasiConfig {
  latencyMs: number; // 0 = no latency, > 0 = delay in ms
  errorType: ErrorInjectionType;
  offlineBannerVisible: boolean;
  lastSyncedAt: string;
  simulatedToday: string; // '2026-09-16'
  simulatedNow: string; // '11:39'
}

export class BandrekApiError extends Error {
  public readonly code: ErrorInjectionType | 'unknown';
  public readonly status: number;
  public readonly details?: unknown;

  constructor(
    code: ErrorInjectionType | 'unknown',
    message: string,
    status: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = 'BandrekApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, BandrekApiError.prototype);
  }
}
