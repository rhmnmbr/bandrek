import type { JenisKegiatanWarna } from '@/data/types/master';

export interface WarnaMeta {
  key: JenisKegiatanWarna;
  label: string;
  dot: string;
  bg: string;
  ink: string;
}

export const JENIS_WARNA: Record<JenisKegiatanWarna, WarnaMeta> = {
  pembelajaran: {
    key: 'pembelajaran',
    label: 'Biru',
    dot: '#0F6CBD',
    bg: '#EBF3FC',
    ink: '#0C548F',
  },
  rapat: {
    key: 'rapat',
    label: 'Ungu',
    dot: '#8764B8',
    bg: '#F3EFFA',
    ink: '#5B4394',
  },
  olahraga: {
    key: 'olahraga',
    label: 'Hijau',
    dot: '#4CAF50',
    bg: '#E8F5E9',
    ink: '#2E7D32',
  },
  ujian: {
    key: 'ujian',
    label: 'Merah',
    dot: '#C50F1F',
    bg: '#FDE7E9',
    ink: '#9B0C18',
  },
  lainnya: {
    key: 'lainnya',
    label: 'Abu',
    dot: '#605E5C',
    bg: '#EDEBE9',
    ink: '#424242',
  },
};

export const LIST_WARNA: JenisKegiatanWarna[] = [
  'pembelajaran',
  'rapat',
  'olahraga',
  'ujian',
  'lainnya',
];
