import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/components/layouts/main-layout";
import { LoginPage } from "@/pages/login-page";
import { PagePlaceholder } from "@/pages/page-placeholder";

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
        <Route path="/users" element={<PagePlaceholder title="کاربران" />} />
        <Route
          path="/settings"
          element={<PagePlaceholder title="تنظیمات" />}
        />
      </Route>
      <Route path="/logout" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
