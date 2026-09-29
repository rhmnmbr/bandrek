import type { SimulasiConfig } from '../types/simulasi';

export interface ISimulasiRepository {
  getConfig(): SimulasiConfig;
  updateConfig(config: Partial<SimulasiConfig>): void;
  resetToInitialSeed(): void;
  subscribe(listener: (config: SimulasiConfig) => void): () => void;
}
