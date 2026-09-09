import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { Link } from 'react-router-dom';

import {
  formatOrderDate,
  getIngredientPreviews,
  getOrderStatusLabel,
  getOrderTotal,
} from '@utils/orders.ts';

import type { TIngredient, TOrder } from '@utils/types.ts';

import styles from './order-card.module.css';

type TOrderCardProps = {
  ingredients: TIngredient[];
  order: TOrder;
  showStatus?: boolean;
  to: string;
};

export const OrderCard = ({
  ingredients,
  order,
  showStatus = false,
  to,
}: TOrderCardProps): React.JSX.Element => {
  const previews = getIngredientPreviews(order, ingredients);
  const total = getOrderTotal(order, ingredients);

  return (
    <Link aria-label={`Открыть заказ №${order.number}`} className={styles.link} to={to}>
      <article className={styles.card}>
        <header className={styles.header}>
          <span className="text text_type_digits-default">#{order.number}</span>
          <time
            className="text text_type_main-default text_color_inactive"
            dateTime={order.createdAt}
          >
            {formatOrderDate(order.createdAt)}
          </time>
        </header>
        <h2 className={`${styles.name} text text_type_main-medium mt-6`}>
          {order.name}
        </h2>
        {showStatus ? (
          <p
            className={`${styles.status} ${order.status === 'done' ? styles.status_done : ''} text text_type_main-default mt-2`}
          >
            {getOrderStatusLabel(order.status)}
          </p>
        ) : null}
        <footer className={`${styles.footer} mt-6`}>
          <div aria-label="Ингредиенты заказа" className={styles.previews}>
            {previews.items.map((ingredient, index) => {
              const isLast = index === previews.items.length - 1;

              return (
                <span className={styles.preview} key={ingredient._id}>
                  <img
                    alt={ingredient.name}
                    className={styles.image}
                    loading="lazy"
                    src={ingredient.image_mobile}
                  />
                  {isLast && previews.hiddenCount > 0 ? (
                    <span
                      aria-label={`Ещё ${previews.hiddenCount} ингредиентов`}
                      className={`${styles.more} text text_type_main-default`}
                    >
                      +{previews.hiddenCount}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className={styles.price}>
            <span className="text text_type_digits-default">{total}</span>
            <CurrencyIcon type="primary" />
          </div>
        </footer>
      </article>
    </Link>
  );
};
