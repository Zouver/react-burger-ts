import { OrderCard } from '@components/order-card/order-card.tsx';

import type { TIngredient, TOrder } from '@utils/types.ts';

import styles from './order-feed-list.module.css';

type TOrderFeedListProps = {
  ingredients: TIngredient[];
  orders: TOrder[];
  routeBase: '/feed' | '/profile/orders';
  showStatus?: boolean;
};

export const OrderFeedList = ({
  ingredients,
  orders,
  routeBase,
  showStatus = false,
}: TOrderFeedListProps): React.JSX.Element => {
  return (
    <ul aria-label="Список заказов" className={`${styles.list} custom-scroll`}>
      {orders.map((order) => (
        <li className={styles.item} key={order._id}>
          <OrderCard
            ingredients={ingredients}
            order={order}
            showStatus={showStatus}
            to={`${routeBase}/${order._id}`}
          />
        </li>
      ))}
    </ul>
  );
};
