import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
} from '@krgaa/react-developer-burger-ui-components';

import styles from './app-header.module.css';

export const AppHeader = (): React.JSX.Element => {
  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <ul className={styles.menu_part_left}>
          <li>
            <a href="/" className={`${styles.link} ${styles.link_active}`}>
              <BurgerIcon type="primary" />
              <p className="text text_type_main-default ml-2">Конструктор</p>
            </a>
          </li>
          <li>
            <a href="/feed" className={`${styles.link} ml-10`}>
              <ListIcon type="secondary" />
              <p className="text text_type_main-default ml-2">Лента заказов</p>
            </a>
          </li>
        </ul>
        <div className={styles.logo}>
          <Logo />
        </div>
        <ul className={styles.menu_part_right}>
          <li>
            <a href="/profile" className={`${styles.link} ${styles.link_position_last}`}>
              <ProfileIcon type="secondary" />
              <p className="text text_type_main-default ml-2">Личный кабинет</p>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
