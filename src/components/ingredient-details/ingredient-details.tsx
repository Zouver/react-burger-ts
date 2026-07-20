import type { TIngredient } from '@utils/types';

import styles from './ingredient-details.module.css';

type TIngredientDetailsProps = {
  ingredient: TIngredient;
};

type TNutritionItem = {
  label: string;
  value: number;
};

export const IngredientDetails = ({
  ingredient,
}: TIngredientDetailsProps): React.JSX.Element => {
  const nutrition: TNutritionItem[] = [
    { label: 'Калории,ккал', value: ingredient.calories },
    { label: 'Белки, г', value: ingredient.proteins },
    { label: 'Жиры, г', value: ingredient.fat },
    { label: 'Углеводы, г', value: ingredient.carbohydrates },
  ];

  return (
    <article className={styles.details}>
      <img alt={ingredient.name} className={styles.image} src={ingredient.image_large} />
      <h3 className={`${styles.title} text text_type_main-medium mt-4 mb-8`}>
        {ingredient.name}
      </h3>
      <ul className={styles.nutrition}>
        {nutrition.map((item) => (
          <li className={styles.nutrition_item} key={item.label}>
            <p className="text text_type_main-default text_color_inactive">
              {item.label}
            </p>
            <p className="text text_type_digits-default text_color_inactive mt-2">
              {item.value}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
};
