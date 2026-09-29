import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { AppShell } from '@/components/layout/AppShell';
import { KalenderScreen } from '@/screens/KalenderScreen';
import { DetailKegiatanScreen } from '@/screens/DetailKegiatanScreen';
import { RealisasiScreen } from '@/screens/RealisasiScreen';
import { MatriksScreen } from '@/screens/MatriksScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { KatalogScreen } from '@/screens/KatalogScreen';
import { DataLayerScreen } from '@/screens/DataLayerScreen';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Main App Shell Layout Frame */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/kalender" replace />} />
          <Route path="/kalender" element={<KalenderScreen />} />
          <Route path="/kegiatan/:id/realisasi" element={<RealisasiScreen />} />
          <Route path="/kegiatan/:id" element={<DetailKegiatanScreen />} />
          <Route path="/kegiatan" element={<PlaceholderScreen />} />
          <Route path="/matriks" element={<MatriksScreen />} />
          <Route path="/master/siswa" element={<PlaceholderScreen />} />
          <Route path="/master/subjek" element={<PlaceholderScreen />} />
          <Route path="/master/mapel" element={<PlaceholderScreen />} />
          <Route path="/master/kelas" element={<PlaceholderScreen />} />
          <Route path="/master/tempat" element={<PlaceholderScreen />} />
          <Route path="/master/jenis" element={<PlaceholderScreen />} />
        </Route>

        {/* Development & Inspection Screens */}
        <Route path="/katalog" element={<KatalogScreen />} />
        <Route path="/data" element={<DataLayerScreen />} />

        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/kalender" replace />} />
      </Routes>
    </ToastProvider>
  );
}
