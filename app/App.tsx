import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';

export default function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                  جارٍ التحميل...
                </div>
              }
            >
              <RouterProvider router={router} />
            </Suspense>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}