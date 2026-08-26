import { NavLink, Outlet } from 'react-router-dom';

import { useLogoutMutation } from '@services/api/stellarApi.ts';

import styles from './profile-page.module.css';

export const ProfilePage = (): React.JSX.Element => {
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    try {
      await logout().unwrap();
    } catch (_error) {
      // Logout side effects clear local auth state even when the server rejects.
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav aria-label="Навигация профиля">
            <ul className={styles.menu}>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.link_active : ''}`
                  }
                  end
                  to="/profile"
                >
                  Профиль
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.link_active : ''}`
                  }
                  to="/profile/orders"
                >
                  История заказов
                </NavLink>
              </li>
              <li>
                <button
                  className={styles.logout}
                  onClick={() => void handleLogout()}
                  type="button"
                >
                  {isLoading ? 'Выходим...' : 'Выход'}
                </button>
              </li>
            </ul>
          </nav>
          <p className="text text_type_main-default text_color_inactive mt-20">
            В этом разделе вы можете изменить свои персональные данные
          </p>
        </aside>
        <section className={styles.content}>
          <Outlet />
        </section>
      </section>
    </main>
  );
};
