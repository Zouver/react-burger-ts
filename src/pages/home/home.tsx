import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { Modal } from '@components/modal/modal';
import { OrderDetails } from '@components/order-details/order-details';
import { Preloader } from '@components/preloader/preloader';
import {
  useCreateOrderMutation,
  useGetIngredientsQuery,
} from '@services/api/stellarApi.ts';
import {
  clearBurgerConstructor,
  selectBurgerConstructor,
} from '@services/burgerConstructor/burgerConstructorSlice.ts';
import { useAppDispatch, useAppSelector } from '@services/hooks.ts';

import styles from './home.module.css';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = error.data;

    if (
      typeof data === 'object' &&
      data &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      return data.message;
    }
  }

  return fallback;
};

export const Home = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const { bun, ingredients: constructorIngredients } = useAppSelector(
    selectBurgerConstructor
  );
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const {
    data: ingredients = [],
    error: ingredientsError,
    isError: isIngredientsError,
    isFetching: isIngredientsFetching,
    isLoading: isIngredientsLoading,
  } = useGetIngredientsQuery();
  const [
    createOrder,
    {
      data: orderData,
      error: orderError,
      isError: isOrderError,
      isLoading: isOrderLoading,
      reset: resetOrder,
    },
  ] = useCreateOrderMutation();

  const handleOrderClick = async (): Promise<void> => {
    if (!bun || isOrderLoading) {
      return;
    }

    const ingredientIds = [
      bun._id,
      ...constructorIngredients.map((ingredient) => ingredient._id),
      bun._id,
    ];

    try {
      await createOrder(ingredientIds).unwrap();
      dispatch(clearBurgerConstructor());
      setIsOrderModalOpen(true);
    } catch (_error) {
      setIsOrderModalOpen(false);
    }
  };

  const handleOrderModalClose = (): void => {
    setIsOrderModalOpen(false);
    resetOrder();
  };

  const isLoading = isIngredientsLoading || isIngredientsFetching;
  const error = isIngredientsError
    ? getErrorMessage(
        ingredientsError,
        'Не удалось загрузить ингредиенты. Попробуйте позже.'
      )
    : null;
  const orderErrorMessage = isOrderError
    ? getErrorMessage(orderError, 'Не удалось оформить заказ. Попробуйте позже.')
    : null;

  return (
    <main className={styles.content}>
      <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5`}>
        Соберите бургер
      </h1>
      {isLoading ? <Preloader /> : null}
      {!isLoading && error ? (
        <section className={styles.status}>
          <p className="text text_type_main-medium">{error}</p>
        </section>
      ) : null}
      {!isLoading && !error ? (
        <DndProvider backend={HTML5Backend}>
          <section className={`${styles.main} pl-5 pr-5`}>
            <BurgerIngredients ingredients={ingredients} />
            <BurgerConstructor
              isOrderLoading={isOrderLoading}
              onOrderClick={handleOrderClick}
              orderError={orderErrorMessage}
            />
          </section>
        </DndProvider>
      ) : null}
      {isOrderModalOpen && orderData ? (
        <Modal title="Детали заказа" onClose={handleOrderModalClose}>
          <OrderDetails orderNumber={orderData.order.number} />
        </Modal>
      ) : null}
    </main>
  );
};
