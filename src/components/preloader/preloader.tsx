import { Preloader as BurgerUiPreloader } from '@krgaa/react-developer-burger-ui-components';

import styles from './preloader.module.css';

export const Preloader = (): React.JSX.Element => {
  return (
    <section className={styles.preloader} aria-live="polite" aria-busy="true">
      <BurgerUiPreloader />
    </section>
  );
};
