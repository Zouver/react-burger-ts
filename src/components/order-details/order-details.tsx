import { CheckMarkIcon } from '@krgaa/react-developer-burger-ui-components';

import styles from './order-details.module.css';

type TOrderDetailsProps = {
  orderNumber?: number;
};

export const OrderDetails = ({
  orderNumber = 12345,
}: TOrderDetailsProps): React.JSX.Element => {
  return (
    <section className={styles.order}>
      <p className="text text_type_digits-large mt-4 mb-8">{orderNumber}</p>
      <p className="text text_type_main-medium mb-15">идентификатор заказа</p>
      <div className={styles.icon_wrapper}>
        <CheckMarkIcon type="success" />
      </div>
      <p className="text text_type_main-default mt-15 mb-2">Ваш заказ начали готовить</p>
      <p className="text text_type_main-default text_color_inactive mb-15">
        Дождитесь готовности на орбитальной станции
      </p>
    </section>
  );
};
