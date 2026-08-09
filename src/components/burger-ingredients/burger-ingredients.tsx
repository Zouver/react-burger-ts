import { Counter, CurrencyIcon, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { TIngredient } from '@utils/types';

import styles from './burger-ingredients.module.css';

type TBurgerIngredientsProps = {
  ingredients: TIngredient[];
  onIngredientClick: (ingredient: TIngredient) => void;
};

type TIngredientType = 'bun' | 'sauce' | 'main';

type TIngredientSection = {
  type: TIngredientType;
  title: string;
  items: TIngredient[];
};

export const BurgerIngredients = ({
  ingredients,
  onIngredientClick,
}: TBurgerIngredientsProps): React.JSX.Element => {
  const [currentTab, setCurrentTab] = useState<TIngredientType>('bun');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<TIngredientType, HTMLElement | null>>({
    bun: null,
    sauce: null,
    main: null,
  });

  const sections = useMemo<TIngredientSection[]>(
    () => [
      {
        type: 'bun',
        title: 'Булки',
        items: ingredients.filter((ingredient) => ingredient.type === 'bun'),
      },
      {
        type: 'sauce',
        title: 'Соусы',
        items: ingredients.filter((ingredient) => ingredient.type === 'sauce'),
      },
      {
        type: 'main',
        title: 'Начинки',
        items: ingredients.filter((ingredient) => ingredient.type === 'main'),
      },
    ],
    [ingredients]
  );

  const handleTabClick = useCallback((tab: string): void => {
    const nextTab = tab as TIngredientType;

    setCurrentTab(nextTab);
    sectionRefs.current[nextTab]?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback((): void => {
    const containerTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    const closestSection = (
      Object.entries(sectionRefs.current) as [TIngredientType, HTMLElement | null][]
    )
      .filter(([, element]) => element)
      .map(([type, element]) => ({
        type,
        distance: Math.abs((element?.getBoundingClientRect().top ?? 0) - containerTop),
      }))
      .sort((sectionA, sectionB) => sectionA.distance - sectionB.distance)[0];

    if (closestSection) {
      setCurrentTab(closestSection.type);
    }
  }, []);

  return (
    <section className={styles.burger_ingredients}>
      <nav aria-label="Категории ингредиентов">
        <ul className={styles.menu}>
          <li>
            <Tab value="bun" active={currentTab === 'bun'} onClick={handleTabClick}>
              Булки
            </Tab>
          </li>
          <li>
            <Tab value="sauce" active={currentTab === 'sauce'} onClick={handleTabClick}>
              Соусы
            </Tab>
          </li>
          <li>
            <Tab value="main" active={currentTab === 'main'} onClick={handleTabClick}>
              Начинки
            </Tab>
          </li>
        </ul>
      </nav>
      <div
        className={`${styles.sections} custom-scroll mt-10 pr-2`}
        onScroll={handleScroll}
        ref={containerRef}
      >
        {sections.map((section) => (
          <section
            className={styles.section}
            key={section.type}
            ref={(element) => {
              sectionRefs.current[section.type] = element;
            }}
          >
            <h2 className="text text_type_main-medium mb-6">{section.title}</h2>
            <ul className={styles.cards}>
              {section.items.map((ingredient) => (
                <li key={ingredient._id}>
                  <button
                    className={styles.card}
                    onClick={() => onIngredientClick(ingredient)}
                    type="button"
                  >
                    <Counter count={1} extraClass={styles.counter} />
                    <img
                      alt={ingredient.name}
                      className={styles.image}
                      src={ingredient.image}
                    />
                    <div className={`${styles.price} mt-1 mb-1`}>
                      <p className="text text_type_digits-default">{ingredient.price}</p>
                      <CurrencyIcon type="primary" />
                    </div>
                    <p className={`${styles.name} text text_type_main-default`}>
                      {ingredient.name}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
};
