import { Outlet } from 'react-router';
import { VisitBeacon } from './VisitBeacon';
import { LanguageToggle } from './LanguageToggle';

export function RootShell() {
  return (
    <>
      <VisitBeacon />
      <div className="fixed top-4 end-4 z-50">
        <LanguageToggle />
      </div>
      <Outlet />
    </>
  );
}
