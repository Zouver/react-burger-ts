import { useNavigate, useParams } from 'react-router-dom';

import { Modal } from '@components/modal/modal.tsx';
import { OrderInformation } from '@components/order-information/order-information.tsx';
import { Preloader } from '@components/preloader/preloader.tsx';
import { getErrorMessage } from '@services/api/get-error-message.ts';
import {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetUserOrdersQuery,
} from '@services/api/ordersApi.ts';
import { useGetIngredientsQuery } from '@services/api/stellarApi.ts';

import styles from './order-modal-route.module.css';

type TOrderModalRouteProps = {
  closeTo: '/feed' | '/profile/orders';
  source: 'all' | 'user';
};

export const OrderModalRoute = ({
  closeTo,
  source,
}: TOrderModalRouteProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const allOrdersQuery = useGetAllOrdersQuery(undefined, {
    skip: source !== 'all',
  });
  const userOrdersQuery = useGetUserOrdersQuery(undefined, {
    skip: source !== 'user',
  });
  const feed = source === 'all' ? allOrdersQuery.data : userOrdersQuery.data;
  const streamedOrder = feed?.orders.find((order) => order._id === id);
  const canUseFallback = Boolean(
    id &&
      !streamedOrder &&
      (feed?.hasReceivedData === true || feed?.connectionStatus === 'error')
  );
  const {
    data: fetchedOrder,
    error: orderError,
    isError: isOrderError,
    isFetching: isOrderFetching,
    isLoading: isOrderLoading,
  } = useGetOrderByIdQuery(id, { skip: !canUseFallback });
  const {
    data: ingredients = [],
    error: ingredientsError,
    isError: isIngredientsError,
    isLoading: isIngredientsLoading,
  } = useGetIngredientsQuery();
  const order = streamedOrder ?? fetchedOrder;
  const isWaitingForFeed =
    !streamedOrder && !feed?.hasReceivedData && feed?.connectionStatus !== 'error';
  const isLoading =
    isIngredientsLoading ||
    isWaitingForFeed ||
    (canUseFallback && (isOrderLoading || isOrderFetching));
  const error = isIngredientsError
    ? getErrorMessage(ingredientsError, 'Не удалось загрузить ингредиенты заказа.')
    : isOrderError
      ? getErrorMessage(orderError, 'Не удалось загрузить заказ.')
      : null;

  const handleClose = (): void => {
    void navigate(closeTo, { replace: true });
  };

  return (
    <Modal ariaLabel="Информация о заказе" onClose={handleClose}>
      {isLoading ? <Preloader /> : null}
      {!isLoading && error ? (
        <section className={styles.status} role="alert">
          <p className="text text_type_main-medium">{error}</p>
        </section>
      ) : null}
      {!isLoading && !error && !order ? (
        <section className={styles.status}>
          <p className="text text_type_main-medium">Заказ не найден</p>
        </section>
      ) : null}
      {!isLoading && !error && order ? (
        <OrderInformation ingredients={ingredients} order={order} />
      ) : null}
    </Modal>
  );
};
