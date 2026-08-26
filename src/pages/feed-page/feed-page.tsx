import styles from './feed-page.module.css';

export const FeedPage = (): React.JSX.Element => {
  return (
    <main className={styles.page}>
      <h1 className="text text_type_main-large mb-6">Лента заказов</h1>
      <p className="text text_type_main-medium text_color_inactive">
        Лента заказов находится в разработке
      </p>
    </main>
  );
};
