import { Outlet } from 'react-router';
import { VisitBeacon } from './VisitBeacon';

export function RootShell() {
  return (
    <>
      <VisitBeacon />
      <Outlet />
    </>
  );
}
