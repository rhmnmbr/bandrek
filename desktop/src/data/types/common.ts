export type JenjangPendidikan = 'SD' | 'SMP' | 'SMA';

export type JenisKelamin = 'L' | 'P';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
