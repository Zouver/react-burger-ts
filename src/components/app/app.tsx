import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { AppHeader } from '@components/app-header/app-header';
import { useLazyGetUserQuery } from '@services/api/stellarApi.ts';
import { resetAuthState, selectIsAuthChecked } from '@services/auth/authSlice.ts';
import { getAccessToken, getRefreshToken } from '@services/auth/tokenStorage.ts';
import { useAppDispatch, useAppSelector } from '@services/hooks.ts';

import styles from './app.module.css';

export const App = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const isAuthChecked = useAppSelector(selectIsAuthChecked);
  const [triggerGetUser] = useLazyGetUserQuery();

  useEffect(() => {
    if (isAuthChecked) {
      return;
    }

    if (getAccessToken() || getRefreshToken()) {
      void triggerGetUser();
      return;
    }

    dispatch(resetAuthState());
  }, [dispatch, isAuthChecked, triggerGetUser]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <Outlet />
    </div>
  );
};

export default App;
