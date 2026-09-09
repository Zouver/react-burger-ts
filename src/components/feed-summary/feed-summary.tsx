import { splitOrderNumbers } from '@utils/orders.ts';

import type { TOrder } from '@utils/types.ts';

import styles from './feed-summary.module.css';

type TFeedSummaryProps = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

type TNumberColumnsProps = {
  accent?: boolean;
  numbers: number[];
  title: string;
};

const NumberColumns = ({
  accent = false,
  numbers,
  title,
}: TNumberColumnsProps): React.JSX.Element => {
  const columns = splitOrderNumbers(numbers);

  return (
    <section className={styles.status_group}>
      <h2 className="text text_type_main-medium mb-6">{title}</h2>
      {columns.length > 0 ? (
        <div className={styles.number_columns}>
          {columns.map((column, columnIndex) => (
            <ul className={styles.numbers} key={`${title}-${columnIndex}`}>
              {column.map((number) => (
                <li
                  className={`${accent ? styles.number_accent : ''} text text_type_digits-default`}
                  key={number}
                >
                  {number}
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="text text_type_main-default text_color_inactive">
          Пока нет заказов
        </p>
      )}
    </section>
  );
};

export const FeedSummary = ({
  orders,
  total,
  totalToday,
}: TFeedSummaryProps): React.JSX.Element => {
  const readyNumbers = orders
    .filter((order) => order.status === 'done')
    .map((order) => order.number);
  const workingNumbers = orders
    .filter((order) => order.status !== 'done')
    .map((order) => order.number);

  return (
    <aside aria-label="Статистика заказов" className={styles.summary}>
      <div className={styles.statuses}>
        <NumberColumns accent numbers={readyNumbers} title="Готовы:" />
        <NumberColumns numbers={workingNumbers} title="В работе:" />
      </div>
      <section className={styles.total_section}>
        <h2 className="text text_type_main-medium">Выполнено за всё время:</h2>
        <p className={`${styles.total} text text_type_digits-large`}>{total}</p>
      </section>
      <section className={styles.total_section}>
        <h2 className="text text_type_main-medium">Выполнено за сегодня:</h2>
        <p className={`${styles.total} text text_type_digits-large`}>{totalToday}</p>
      </section>
    </aside>
  );
};
