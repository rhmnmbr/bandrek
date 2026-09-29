import type { ISimulasiRepository } from '../interfaces/ISimulasiRepository';
import type { SimulasiConfig } from '../types/simulasi';
import { simulasiManager } from './mockRunner';
import { mockStore } from './mockStore';

export class MockSimulasiRepository implements ISimulasiRepository {
  public getConfig(): SimulasiConfig {
    return simulasiManager.getConfig();
  }

  public updateConfig(config: Partial<SimulasiConfig>): void {
    simulasiManager.updateConfig(config);
  }

  public resetToInitialSeed(): void {
    mockStore.resetToInitial();
  }

  public subscribe(listener: (config: SimulasiConfig) => void): () => void {
    return simulasiManager.subscribe(listener);
  }
}
