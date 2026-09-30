import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { FeedbackProvider } from './components/Feedback';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { WorkoutDetailPage } from './pages/WorkoutDetailPage';
import { WorkoutEditPage } from './pages/WorkoutEditPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';

function TabsLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

/**
 * HashRouter: funciona em qualquer hospedagem estática (Netlify, Vercel, GitHub Pages)
 * e no PWA offline, sem configurar redirecionamento no servidor.
 */
export function App() {
  return (
    <HashRouter>
      <FeedbackProvider>
        <ScrollToTop />
        <div className="app">
          <Routes>
            <Route element={<TabsLayout />}>
              <Route index element={<HomePage />} />
              <Route path="treinos" element={<WorkoutsPage />} />
              <Route path="evolucao" element={<ProgressPage />} />
              <Route path="ajustes" element={<SettingsPage />} />
            </Route>
            <Route path="treinos/novo" element={<WorkoutEditPage />} />
            <Route path="treinos/:id" element={<WorkoutDetailPage />} />
            <Route path="treinos/:id/editar" element={<WorkoutEditPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </FeedbackProvider>
    </HashRouter>
  );
}
