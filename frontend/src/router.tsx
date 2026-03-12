import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { ProtectedLayout } from './shared/components/ProtectedLayout';
import { LoginPage } from './features/auth/LoginPage';
import { CatalogPage } from './features/catalog/CatalogPage';
import { SkillDetailPage } from './features/skill-detail/SkillDetailPage';
import { PublishSkillPage } from './features/publish/PublishSkillPage';
import { NewVersionPage } from './features/publish/NewVersionPage';
import { MyPanelPage } from './features/panel/MyPanelPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <CatalogPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/skills/:slug', element: <SkillDetailPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/publish', element: <PublishSkillPage /> },
          { path: '/skills/:slug/new-version', element: <NewVersionPage /> },
          { path: '/panel', element: <MyPanelPage /> },
          { path: '/panel/:section', element: <MyPanelPage /> },
          { path: '/settings', element: <Navigate to="/panel/settings" replace /> },
        ],
      },
    ],
  },
]);
