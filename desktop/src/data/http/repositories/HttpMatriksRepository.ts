import type { IMatriksRepository } from '../../interfaces/IMatriksRepository';
import type {
  MatriksBelajarResult,
  MatriksFilterParams,
  CeklisManual,
  TandaiManualInput,
} from '../../types/matriks';
import {
  getLearningMatrix,
  markManualChecklist,
  deleteManualChecklist,
  bulkMarkManualChecklist,
  bulkDeleteManualChecklist,
} from '../../api/generated/endpoints';
import type {
  LearningMatrixResult,
  ManualChecklistDto,
  BulkDeleteResultDto,
} from '../../api/generated/models';
import {
  mapLearningMatrixResultToMatriksBelajarResult,
  mapTandaiManualInputToRequest,
  mapManualChecklistDtoToCeklisManual,
  mapMatriksFilterParamsToGetLearningMatrixParams,
} from '../mappers/matriksMapper';

export class HttpMatriksRepository implements IMatriksRepository {
  public async getMatriks(
    mapelId: string,
    filter?: MatriksFilterParams
  ): Promise<MatriksBelajarResult> {
    const params = mapMatriksFilterParamsToGetLearningMatrixParams(filter);
    const res = await getLearningMatrix(mapelId, params);
    return mapLearningMatrixResultToMatriksBelajarResult(
      res.data as LearningMatrixResult
    );
  }

  public async tandaiManual(input: TandaiManualInput): Promise<CeklisManual> {
    const request = mapTandaiManualInputToRequest(input);
    const res = await markManualChecklist(request);
    return mapManualChecklistDtoToCeklisManual(res.data as ManualChecklistDto);
  }

  public async hapusManual(id: string): Promise<void> {
    await deleteManualChecklist(id);
  }

  public async tandaiManualMassal(
    items: TandaiManualInput[]
  ): Promise<CeklisManual[]> {
    const request = {
      items: items.map(mapTandaiManualInputToRequest),
    };
    const res = await bulkMarkManualChecklist(request);
    return ((res.data as ManualChecklistDto[]) || []).map(
      mapManualChecklistDtoToCeklisManual
    );
  }

  public async hapusManualMassal(
    keys: Array<{ siswaId: string; materiId: string }>
  ): Promise<number> {
    const request = {
      keys: keys.map((k) => ({
        studentId: k.siswaId,
        topicId: k.materiId,
      })),
    };
    const res = await bulkDeleteManualChecklist(request);
    return Number((res.data as BulkDeleteResultDto).deletedCount) || 0;
  }
}
