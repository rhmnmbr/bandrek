import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories';
import type { SimulasiConfig } from '../types/simulasi';

export function useSimulasi() {
  const queryClient = useQueryClient();
  const [config, setConfig] = React.useState<SimulasiConfig>(() =>
    repositories.simulasi.getConfig()
  );

  React.useEffect(() => {
    const unsubscribe = repositories.simulasi.subscribe((newConfig) => {
      setConfig(newConfig);
    });
    return unsubscribe;
  }, []);

  const updateConfig = React.useCallback((patch: Partial<SimulasiConfig>) => {
    repositories.simulasi.updateConfig(patch);
  }, []);

  const resetData = React.useCallback(() => {
    repositories.simulasi.resetToInitialSeed();
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    config,
    updateConfig,
    resetData,
  };
}
