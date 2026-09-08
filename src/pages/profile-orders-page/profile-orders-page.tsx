import { Outlet } from 'react-router-dom';

import { OrderFeedList } from '@components/order-feed-list/order-feed-list.tsx';
import { Preloader } from '@components/preloader/preloader.tsx';
import { getErrorMessage } from '@services/api/get-error-message.ts';
import { useGetUserOrdersQuery } from '@services/api/ordersApi.ts';
import { useGetIngredientsQuery } from '@services/api/stellarApi.ts';
import { getDisplayableOrders } from '@utils/orders.ts';

import styles from './profile-orders-page.module.css';

export const ProfileOrdersPage = (): React.JSX.Element => {
  const { data: feed } = useGetUserOrdersQuery();
  const {
    data: ingredients = [],
    error: ingredientsError,
    isError: isIngredientsError,
    isLoading: isIngredientsLoading,
  } = useGetIngredientsQuery();
  const isFeedLoading = !feed?.hasReceivedData && feed?.connectionStatus !== 'error';
  const error = isIngredientsError
    ? getErrorMessage(
        ingredientsError,
        'Не удалось загрузить ингредиенты. Попробуйте позже.'
      )
    : !feed?.hasReceivedData && feed?.connectionStatus === 'error'
      ? feed.error
      : null;
  const orders = feed ? getDisplayableOrders(feed.orders, ingredients) : [];

  return (
    <section className={styles.page}>
      {isIngredientsLoading || isFeedLoading ? <Preloader /> : null}
      {!isIngredientsLoading && !isFeedLoading && error ? (
        <section className={styles.status} role="alert">
          <p className="text text_type_main-medium">{error}</p>
        </section>
      ) : null}
      {!isIngredientsLoading && !isFeedLoading && !error && feed ? (
        <>
          {orders.length > 0 ? (
            <div className={styles.orders}>
              <OrderFeedList
                ingredients={ingredients}
                orders={orders}
                routeBase="/profile/orders"
                showStatus
              />
            </div>
          ) : (
            <section className={styles.status}>
              <p className="text text_type_main-medium text_color_inactive">
                У вас пока нет заказов
              </p>
            </section>
          )}
          {feed.connectionStatus === 'reconnecting' ? (
            <p
              aria-live="polite"
              className={`${styles.connection} text text_type_main-default text_color_inactive`}
            >
              {feed.error}
            </p>
          ) : null}
        </>
      ) : null}
      <Outlet />
    </section>
  );
};
