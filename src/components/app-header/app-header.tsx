import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { Link, NavLink } from 'react-router-dom';

import styles from './app-header.module.css';

export const AppHeader = (): React.JSX.Element => {
  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <ul className={styles.menu_part_left}>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.link_active : ''}`
              }
              end
              to="/"
            >
              {({ isActive }) => (
                <>
                  <BurgerIcon type={isActive ? 'primary' : 'secondary'} />
                  <p className="text text_type_main-default ml-2">Конструктор</p>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.link_active : ''} ml-10`
              }
              to="/feed"
            >
              {({ isActive }) => (
                <>
                  <ListIcon type={isActive ? 'primary' : 'secondary'} />
                  <p className="text text_type_main-default ml-2">Лента заказов</p>
                </>
              )}
            </NavLink>
          </li>
        </ul>
        <Link aria-label="Stellar Burgers" className={styles.logo} to="/">
          <Logo />
        </Link>
        <ul className={styles.menu_part_right}>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${styles.link_position_last} ${isActive ? styles.link_active : ''}`
              }
              to="/profile"
            >
              {({ isActive }) => (
                <>
                  <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
                  <p className="text text_type_main-default ml-2">Личный кабинет</p>
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};
