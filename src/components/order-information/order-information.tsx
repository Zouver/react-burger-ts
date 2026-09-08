import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';

import {
  formatOrderDate,
  getOrderIngredients,
  getOrderStatusLabel,
  getOrderTotal,
} from '@utils/orders.ts';

import type { TIngredient, TOrder } from '@utils/types.ts';

import styles from './order-information.module.css';

type TOrderInformationProps = {
  ingredients: TIngredient[];
  order: TOrder;
};

export const OrderInformation = ({
  ingredients,
  order,
}: TOrderInformationProps): React.JSX.Element => {
  const groupedIngredients = getOrderIngredients(order, ingredients);
  const total = getOrderTotal(order, ingredients);

  return (
    <div className={styles.content}>
      <p className={`${styles.number} text text_type_digits-default`}>#{order.number}</p>
      <h2 className={`${styles.name} text text_type_main-medium mt-10`}>{order.name}</h2>
      <p
        className={`${styles.status} ${order.status === 'done' ? styles.status_done : ''} text text_type_main-default mt-3`}
      >
        {getOrderStatusLabel(order.status)}
      </p>
      <h3 className="text text_type_main-medium mt-15 mb-6">Состав:</h3>
      <ul className={`${styles.ingredients} custom-scroll pr-6`}>
        {groupedIngredients.map(({ count, ingredient }) => (
          <li className={styles.ingredient} key={ingredient._id}>
            <span className={styles.preview}>
              <img
                alt={ingredient.name}
                className={styles.image}
                src={ingredient.image_mobile}
              />
            </span>
            <span className={`${styles.ingredient_name} text text_type_main-default`}>
              {ingredient.name}
            </span>
            <span className={`${styles.ingredient_price} text text_type_digits-default`}>
              {count} x {ingredient.price}
              <CurrencyIcon type="primary" />
            </span>
          </li>
        ))}
      </ul>
      <footer className={`${styles.footer} mt-10`}>
        <time
          className="text text_type_main-default text_color_inactive"
          dateTime={order.createdAt}
        >
          {formatOrderDate(order.createdAt)}
        </time>
        <span className={`${styles.total} text text_type_digits-default`}>
          {total}
          <CurrencyIcon type="primary" />
        </span>
      </footer>
    </div>
  );
};
