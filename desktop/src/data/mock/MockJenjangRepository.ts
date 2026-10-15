import type { IJenjangRepository } from '../interfaces/IJenjangRepository';
import type { JenjangOption } from '../types/master';

const STORAGE_KEY = 'bandrek:mock-jenjang';

const DEFAULT_JENJANG: JenjangOption[] = [
  { id: 'SD', nama: 'SD', urutan: 1, jumlahSiswa: 0 },
  { id: 'SMP', nama: 'SMP', urutan: 2, jumlahSiswa: 0 },
  { id: 'SMA', nama: 'SMA', urutan: 3, jumlahSiswa: 0 },
];

export class MockJenjangRepository implements IJenjangRepository {
  private getStore(): JenjangOption[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_JENJANG;
  }

  private saveStore(items: JenjangOption[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  async getJenjangList(): Promise<JenjangOption[]> {
    return this.getStore();
  }

  async createJenjang(nama: string, urutan?: number): Promise<JenjangOption> {
    const list = this.getStore();
    const id = nama.trim().toUpperCase();
    if (list.some((x) => x.id === id || x.nama.toLowerCase() === nama.trim().toLowerCase())) {
      throw new Error(`Jenjang “${nama}” sudah ada.`);
    }
    const maxOrder = list.reduce((max, cur) => Math.max(max, cur.urutan || 0), 0);
    const newOption: JenjangOption = {
      id,
      nama: nama.trim(),
      urutan: urutan ?? maxOrder + 1,
      jumlahSiswa: 0,
    };
    list.push(newOption);
    this.saveStore(list);
    return newOption;
  }

  async updateJenjang(id: string, nama: string, urutan?: number): Promise<JenjangOption> {
    const list = this.getStore();
    const idx = list.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Jenjang tidak ditemukan');
    list[idx] = {
      ...list[idx],
      nama: nama.trim(),
      urutan: urutan ?? list[idx].urutan,
    };
    this.saveStore(list);
    return list[idx];
  }

  async deleteJenjang(id: string): Promise<void> {
    const list = this.getStore();
    const filtered = list.filter((x) => x.id !== id);
    this.saveStore(filtered);
  }
}
