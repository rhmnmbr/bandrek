import type { JenjangPendidikan } from '../types/common';
import type {
  MatriksBelajarResult,
  MatriksFilterParams,
  CeklisManual,
  TandaiManualInput,
} from '../types/matriks';

export interface IMatriksRepository {
  getMatriks(
    mapelId: string,
    jenjang: JenjangPendidikan,
    filter?: MatriksFilterParams
  ): Promise<MatriksBelajarResult>;
  tandaiManual(input: TandaiManualInput): Promise<CeklisManual>;
  hapusManual(id: string): Promise<void>;
  tandaiManualMassal(items: TandaiManualInput[]): Promise<CeklisManual[]>;
}
