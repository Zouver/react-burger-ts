import { Link } from 'react-router-dom';

import styles from './not-found-page.module.css';

export const NotFoundPage = (): React.JSX.Element => {
  return (
    <main className={styles.page}>
      <h1 className="text text_type_digits-large mb-6">404</h1>
      <p className="text text_type_main-medium mb-8">Страница не найдена</p>
      <Link className={`${styles.link} text text_type_main-default`} to="/">
        Вернуться на главную
      </Link>
    </main>
  );
};
