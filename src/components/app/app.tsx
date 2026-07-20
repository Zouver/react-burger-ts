import { useEffect, useState } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';
import { OrderDetails } from '@components/order-details/order-details';
import { Preloader } from '@components/preloader/preloader';
import { getIngredients } from '@services/api';

import type { TIngredient } from '@utils/types';

import styles from './app.module.css';

const getDefaultConstructorIngredients = (ingredients: TIngredient[]): TIngredient[] => {
  const bun = ingredients.find((ingredient) => ingredient.type === 'bun');
  const fillings = ingredients
    .filter((ingredient) => ingredient.type !== 'bun')
    .slice(0, 3);

  return bun ? [bun, ...fillings] : fillings;
};

export const App = (): React.JSX.Element => {
  const [ingredients, setIngredients] = useState<TIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<TIngredient | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const loadIngredients = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError('');

        const data = await getIngredients(abortController.signal);

        setIngredients(data);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Неизвестная ошибка при загрузке ингредиентов.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadIngredients();

    return (): void => {
      abortController.abort();
    };
  }, []);

  const burgerConstructorIngredients = getDefaultConstructorIngredients(ingredients);

  return (
    <div className={styles.app}>
      <AppHeader />
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
          <section className={`${styles.main} pl-5 pr-5`}>
            <BurgerIngredients
              ingredients={ingredients}
              onIngredientClick={setSelectedIngredient}
            />
            <BurgerConstructor
              ingredients={burgerConstructorIngredients}
              onOrderClick={() => setIsOrderModalOpen(true)}
            />
          </section>
        ) : null}
      </main>
      {selectedIngredient ? (
        <Modal title="Детали ингредиента" onClose={() => setSelectedIngredient(null)}>
          <IngredientDetails ingredient={selectedIngredient} />
        </Modal>
      ) : null}
      {isOrderModalOpen ? (
        <Modal title="" onClose={() => setIsOrderModalOpen(false)}>
          <OrderDetails />
        </Modal>
      ) : null}
    </div>
  );
};

export default App;
