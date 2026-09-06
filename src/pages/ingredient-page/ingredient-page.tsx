import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';
import { Preloader } from '@components/preloader/preloader';
import { Home } from '@pages/home/home.tsx';
import { useGetIngredientsQuery } from '@services/api/stellarApi.ts';

import type { Location } from 'react-router-dom';

import styles from './ingredient-page.module.css';

type TIngredientRouteState = {
  background?: Location;
};

const IngredientContent = (): React.JSX.Element => {
  const { id } = useParams();
  const { data: ingredients = [], isLoading, isFetching } = useGetIngredientsQuery();
  const ingredient = ingredients.find((item) => item._id === id);

  if (isLoading || isFetching) {
    return <Preloader />;
  }

  if (!ingredient) {
    return (
      <section className={styles.status}>
        <p className="text text_type_main-medium">Ингредиент не найден</p>
      </section>
    );
  }

  return <IngredientDetails ingredient={ingredient} />;
};

export const IngredientPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TIngredientRouteState | null;

  const handleClose = (): void => {
    void navigate(-1);
  };

  if (state?.background) {
    return (
      <>
        <Home />
        <Modal title="Детали ингредиента" onClose={handleClose}>
          <IngredientContent />
        </Modal>
      </>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className="text text_type_main-large mb-4">Детали ингредиента</h1>
      <IngredientContent />
    </main>
  );
};
