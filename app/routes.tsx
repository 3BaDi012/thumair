import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RootShell } from './components/RootShell';
import { WelcomePage } from './pages/WelcomePage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { BuyerDashboardLayout } from './pages/BuyerDashboardLayout';
import { FarmerDashboard } from './pages/dashboards/FarmerDashboard';
import { BuyerDashboard } from './pages/dashboards/BuyerDashboard';
import { SupplierDashboard } from './pages/dashboards/SupplierDashboard';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MessagesPage } from './pages/MessagesPage';
import { ConversationPage } from './pages/ConversationPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SellerListingsPage } from './pages/dashboard/SellerListingsPage';
import { SellerNewListingPage } from './pages/dashboard/SellerNewListingPage';
import { SellerEditListingPage } from './pages/dashboard/SellerEditListingPage';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const AdminListingsPage = lazy(() => import('./pages/admin/AdminListingsPage').then((m) => ({ default: m.AdminListingsPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const AdminFeedbackPage = lazy(() => import('./pages/admin/AdminFeedbackPage').then((m) => ({ default: m.AdminFeedbackPage })));
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminBroadcastPage = lazy(() => import('./pages/admin/AdminBroadcastPage').then((m) => ({ default: m.AdminBroadcastPage })));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })));

const adminSuspense = (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
    جارٍ تحميل لوحة الإدارة...
  </div>
);

export const router = createBrowserRouter([
  {
    Component: RootShell,
    children: [
      { path: '/', Component: WelcomePage },
      { path: '/market', Component: ProductsPage },
      { path: '/home', Component: LandingPage },
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
      {
        path: '/dashboard',
        Component: DashboardLayout,
        children: [
          { path: 'farmer', Component: FarmerDashboard },
          { path: 'listings', Component: SellerListingsPage },
          { path: 'listings/new', Component: SellerNewListingPage },
          { path: 'listings/:id/edit', Component: SellerEditListingPage },
          { path: 'supplier', Component: SupplierDashboard },
        ],
      },
      {
        path: '/dashboard/buyer',
        Component: BuyerDashboardLayout,
        children: [{ index: true, Component: BuyerDashboard }],
      },
      { path: '/products', Component: ProductsPage },
      { path: '/products/:category', Component: ProductsPage },
      { path: '/listing/:id', Component: ProductDetailPage },
      { path: '/messages', Component: MessagesPage },
      { path: '/messages/:conversationId', Component: ConversationPage },
      { path: '/favorites', Component: FavoritesPage },
      {
        path: '/admin',
        element: (
          <Suspense fallback={adminSuspense}>
            <AdminLayout />
          </Suspense>
        ),
        children: [
          { index: true, Component: AdminOverviewPage },
          { path: 'listings', Component: AdminListingsPage },
          { path: 'orders', Component: AdminOrdersPage },
          { path: 'users', Component: AdminUsersPage },
          { path: 'reports', Component: AdminReportsPage },
          { path: 'feedback', Component: AdminFeedbackPage },
          { path: 'audit', Component: AdminAuditPage },
          { path: 'broadcast', Component: AdminBroadcastPage },
          { path: 'messages', Component: AdminMessagesPage },
        ],
      },
      { path: '/product/:id', Component: ProductDetailPage },
      { path: '/about', Component: AboutPage },
      { path: '/contact', Component: ContactPage },
      { path: '/privacy', Component: PrivacyPolicyPage },
      { path: '/terms', Component: TermsPage },
      { path: '/profile/edit', Component: ProfileEditPage },
      { path: '/settings', Component: SettingsPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
