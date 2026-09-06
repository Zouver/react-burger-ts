import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Preloader } from '@components/preloader/preloader';
import { selectIsAuthChecked, selectIsAuthenticated } from '@services/auth/authSlice.ts';
import { useAppSelector } from '@services/hooks.ts';

import type { Location } from 'react-router-dom';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
};

type TLocationState = {
  from?: Location;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
}: TProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useAppSelector(selectIsAuthChecked);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && isAuthenticated) {
    const state = location.state as TLocationState | null;

    return <Navigate replace to={state?.from?.pathname ?? '/'} />;
  }

  if (!onlyUnAuth && !isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
};
