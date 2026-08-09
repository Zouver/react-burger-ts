import {
  Button,
  ConstructorElement,
  CurrencyIcon,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useMemo } from 'react';

import type { TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  ingredients: TIngredient[];
  onOrderClick: () => void;
};

export const BurgerConstructor = ({
  ingredients,
  onOrderClick,
}: TBurgerConstructorProps): React.JSX.Element => {
  const bun = useMemo(
    () => ingredients.find((ingredient) => ingredient.type === 'bun') ?? null,
    [ingredients]
  );
  const fillingIngredients = useMemo(
    () => ingredients.filter((ingredient) => ingredient.type !== 'bun'),
    [ingredients]
  );
  const totalPrice = useMemo(() => {
    const fillingsTotal = fillingIngredients.reduce(
      (total, ingredient) => total + ingredient.price,
      0
    );

    return fillingsTotal + (bun ? bun.price * 2 : 0);
  }, [bun, fillingIngredients]);

  return (
    <section className={styles.burger_constructor}>
      <div className={styles.fixed_element}>
        {bun ? (
          <ConstructorElement
            extraClass="ml-8"
            isLocked={true}
            price={bun.price}
            text={`${bun.name} (верх)`}
            thumbnail={bun.image}
            type="top"
          />
        ) : null}
      </div>
      <ul className={`${styles.ingredients_list} custom-scroll mt-4 mb-4 pr-2`}>
        {fillingIngredients.map((ingredient) => (
          <li className={styles.ingredient_item} key={ingredient._id}>
            <DragIcon type="primary" />
            <ConstructorElement
              price={ingredient.price}
              text={ingredient.name}
              thumbnail={ingredient.image}
            />
          </li>
        ))}
      </ul>
      <div className={styles.fixed_element}>
        {bun ? (
          <ConstructorElement
            extraClass="ml-8"
            isLocked={true}
            price={bun.price}
            text={`${bun.name} (низ)`}
            thumbnail={bun.image}
            type="bottom"
          />
        ) : null}
      </div>
      <div className={`${styles.footer} mt-10`}>
        <div className={styles.total}>
          <p className="text text_type_digits-medium">{totalPrice}</p>
          <CurrencyIcon type="primary" />
        </div>
        <Button htmlType="button" onClick={onOrderClick} type="primary" size="large">
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};
