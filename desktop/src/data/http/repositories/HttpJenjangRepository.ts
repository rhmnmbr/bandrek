import type { IJenjangRepository } from '../../interfaces/IJenjangRepository';
import type { JenjangOption } from '../../types/master';
import { customFetch } from '../../api/client';

interface EducationalLevelDto {
  id: string;
  name: string;
  order: number;
  studentCount: number;
}

export class HttpJenjangRepository implements IJenjangRepository {
  async getJenjangList(): Promise<JenjangOption[]> {
    const res = await customFetch<{ data: EducationalLevelDto[] }>('/api/educational-levels', {
      method: 'GET',
    });
    return (res.data || []).map((d) => ({
      id: d.id,
      nama: d.name,
      urutan: d.order,
      jumlahSiswa: d.studentCount,
    }));
  }

  async createJenjang(nama: string, urutan?: number): Promise<JenjangOption> {
    const res = await customFetch<{ data: EducationalLevelDto }>('/api/educational-levels', {
      method: 'POST',
      body: JSON.stringify({ name: nama.trim(), order: urutan }),
    });
    return {
      id: res.data.id,
      nama: res.data.name,
      urutan: res.data.order,
      jumlahSiswa: res.data.studentCount,
    };
  }

  async updateJenjang(id: string, nama: string, urutan?: number): Promise<JenjangOption> {
    const res = await customFetch<{ data: EducationalLevelDto }>(
      `/api/educational-levels/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name: nama.trim(), order: urutan }),
      }
    );
    return {
      id: res.data.id,
      nama: res.data.name,
      urutan: res.data.order,
      jumlahSiswa: res.data.studentCount,
    };
  }

  async deleteJenjang(id: string): Promise<void> {
    await customFetch(`/api/educational-levels/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
