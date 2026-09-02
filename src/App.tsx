import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/components/layouts/main-layout";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { PagePlaceholder } from "@/pages/page-placeholder";
import { GameDetailPage } from "@/pages/games/game-detail-page";
import { GameListPage } from "@/pages/games/game-list-page";
import { CpuListPage } from "@/pages/parts/cpu-list-page";
import { CpuDetailPage } from "@/pages/parts/cpu-detail-page";
import { GpuListPage } from "@/pages/parts/gpu-list-page";
import { GpuDetailPage } from "@/pages/parts/gpu-detail-page";

function AdminLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={<PagePlaceholder title="داشبورد" />}
        />
        <Route path="/events" element={<PagePlaceholder title="رویدادها" />} />
        <Route path="/games" element={<GameListPage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
        <Route path="/parts/cpu" element={<CpuListPage />} />
        <Route path="/parts/cpu/:id" element={<CpuDetailPage />} />
        <Route path="/parts/gpu" element={<GpuListPage />} />
        <Route path="/parts/gpu/:id" element={<GpuDetailPage />} />
        <Route path="/users" element={<PagePlaceholder title="کاربران" />} />
        <Route
          path="/settings"
          element={<PagePlaceholder title="تنظیمات" />}
        />
      </Route>
      <Route path="/logout" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
