import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { TooltipProvider, GlobalTooltip } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { KalenderScreen } from '@/screens/KalenderScreen';
import { DetailKegiatanScreen } from '@/screens/DetailKegiatanScreen';
import { RealisasiScreen } from '@/screens/RealisasiScreen';
import { MatriksScreen } from '@/screens/MatriksScreen';
import { DaftarKegiatanScreen } from '@/screens/DaftarKegiatanScreen';
import { SiswaScreen } from '@/screens/SiswaScreen';
import { SubjekScreen } from '@/screens/SubjekScreen';
import { KelasScreen } from '@/screens/KelasScreen';
import { MapelScreen } from '@/screens/MapelScreen';
import { TempatScreen } from '@/screens/TempatScreen';
import { JenisKegiatanScreen } from '@/screens/JenisKegiatanScreen';
import { KatalogScreen } from '@/screens/KatalogScreen';
import { DataLayerScreen } from '@/screens/DataLayerScreen';
import { SetupServerScreen } from '@/screens/SetupServerScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { UserManagementScreen } from '@/screens/UserManagementScreen';
import { AuditLogScreen } from '@/screens/AuditLogScreen';
import { UpdateRequiredScreen } from '@/screens/UpdateRequiredScreen';

export default function App() {
  return (
    <ToastProvider>
      <TooltipProvider delayDuration={350} skipDelayDuration={150}>
        <Routes>
          {/* Main App Shell Layout Frame */}
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/kalender" replace />} />
            <Route path="/kalender" element={<KalenderScreen />} />
            <Route path="/kegiatan/:id/realisasi" element={<RealisasiScreen />} />
            <Route path="/kegiatan/:id" element={<DetailKegiatanScreen />} />
            <Route path="/kegiatan" element={<DaftarKegiatanScreen />} />
            <Route path="/matriks" element={<MatriksScreen />} />
            <Route path="/master/siswa" element={<SiswaScreen />} />
            <Route path="/master/siswa/:id" element={<SiswaScreen />} />
            <Route path="/master/subjek" element={<SubjekScreen />} />
            <Route path="/master/subjek/:id" element={<SubjekScreen />} />
            <Route path="/master/mapel" element={<MapelScreen />} />
            <Route path="/master/mapel/:id" element={<MapelScreen />} />
            <Route path="/master/kelas" element={<KelasScreen />} />
            <Route path="/master/kelas/:id" element={<KelasScreen />} />
            <Route path="/master/tempat" element={<TempatScreen />} />
            <Route path="/master/tempat/:id" element={<TempatScreen />} />
            <Route path="/master/jenis" element={<JenisKegiatanScreen />} />
            <Route path="/master/jenis/:id" element={<JenisKegiatanScreen />} />
            <Route path="/pengaturan/pengguna" element={<UserManagementScreen />} />
            <Route path="/pengaturan/audit-log" element={<AuditLogScreen />} />
          </Route>

          {/* Client-Server Standalone Screens */}
          <Route path="/setup-server" element={<SetupServerScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/update-required" element={<UpdateRequiredScreen />} />

          {/* Development & Inspection Screens */}
          <Route path="/katalog" element={<KatalogScreen />} />
          <Route path="/data" element={<DataLayerScreen />} />

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/kalender" replace />} />
        </Routes>
        <GlobalTooltip />
      </TooltipProvider>
    </ToastProvider>
  );
}
