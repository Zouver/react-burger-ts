import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { Link, NavLink, matchPath, useLocation, useMatch } from 'react-router-dom';

import type { Location } from 'react-router-dom';

import styles from './app-header.module.css';

type THeaderLocationState = {
  background?: Location;
};

export const AppHeader = (): React.JSX.Element => {
  const location = useLocation();
  const feedMatch = useMatch('/feed');
  const feedNestedMatch = useMatch('/feed/*');
  const profileMatch = useMatch('/profile');
  const profileNestedMatch = useMatch('/profile/*');
  const state = location.state as THeaderLocationState | null;
  const navigationLocation = state?.background ?? location;
  const isHomeActive = navigationLocation.pathname === '/';
  const isFeedActive = Boolean(
    matchPath('/feed', navigationLocation.pathname) ??
      matchPath('/feed/*', navigationLocation.pathname) ??
      feedMatch ??
      feedNestedMatch
  );
  const isProfileActive = Boolean(
    matchPath('/profile', navigationLocation.pathname) ??
      matchPath('/profile/*', navigationLocation.pathname) ??
      profileMatch ??
      profileNestedMatch
  );

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <ul className={styles.menu_part_left}>
          <li>
            <NavLink
              className={`${styles.link} ${isHomeActive ? styles.link_active : ''}`}
              end
              to="/"
            >
              <BurgerIcon type={isHomeActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">Конструктор</p>
            </NavLink>
          </li>
          <li>
            <NavLink
              className={`${styles.link} ${isFeedActive ? styles.link_active : ''} ml-10`}
              to="/feed"
            >
              <ListIcon type={isFeedActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">Лента заказов</p>
            </NavLink>
          </li>
        </ul>
        <Link aria-label="Stellar Burgers" className={styles.logo} to="/">
          <Logo />
        </Link>
        <ul className={styles.menu_part_right}>
          <li>
            <NavLink
              className={`${styles.link} ${styles.link_position_last} ${isProfileActive ? styles.link_active : ''}`}
              to="/profile"
            >
              <ProfileIcon type={isProfileActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">Личный кабинет</p>
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};
