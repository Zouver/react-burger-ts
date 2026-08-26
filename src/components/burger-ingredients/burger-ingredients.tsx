import { Counter, CurrencyIcon, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { Link, useLocation } from 'react-router-dom';

import { stellarApi } from '@services/api/stellarApi.ts';
import { selectIngredientCounters } from '@services/burgerConstructor/burgerConstructorSlice.ts';
import { useAppSelector } from '@services/hooks.ts';
import { IngredientDragType } from '@utils/dnd.ts';

import type { TIngredient } from '@utils/types';
import type { DragSourceMonitor } from 'react-dnd';

import styles from './burger-ingredients.module.css';

type TIngredientType = 'bun' | 'sauce' | 'main';

type TIngredientSection = {
  type: TIngredientType;
  title: string;
  items: TIngredient[];
};

type TIngredientCardProps = {
  count: number;
  ingredient: TIngredient;
};

const selectIngredients = stellarApi.endpoints.getIngredients.select();

const IngredientCard = ({
  count,
  ingredient,
}: TIngredientCardProps): React.JSX.Element => {
  const location = useLocation();
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const [{ isDragging }, drag] = useDrag<TIngredient, unknown, { isDragging: boolean }>(
    () => ({
      collect: (
        monitor: DragSourceMonitor<TIngredient, unknown>
      ): { isDragging: boolean } => ({
        isDragging: monitor.isDragging(),
      }),
      item: ingredient,
      type: IngredientDragType,
    }),
    [ingredient]
  );

  drag(cardRef);

  return (
    <Link
      className={`${styles.card} ${isDragging ? styles.card_dragging : ''}`}
      ref={cardRef}
      state={{ background: location }}
      to={`/ingredients/${ingredient._id}`}
    >
      {count > 0 ? <Counter count={count} extraClass={styles.counter} /> : null}
      <img alt={ingredient.name} className={styles.image} src={ingredient.image} />
      <div className={`${styles.price} mt-1 mb-1`}>
        <p className="text text_type_digits-default">{ingredient.price}</p>
        <CurrencyIcon type="primary" />
      </div>
      <p className={`${styles.name} text text_type_main-default`}>{ingredient.name}</p>
    </Link>
  );
};

export const BurgerIngredients = (): React.JSX.Element => {
  const counters = useAppSelector(selectIngredientCounters);
  const ingredients = useAppSelector(selectIngredients).data ?? [];
  const [currentTab, setCurrentTab] = useState<TIngredientType>('bun');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<TIngredientType, HTMLElement | null>>({
    bun: null,
    main: null,
    sauce: null,
  });

  const sections = useMemo<TIngredientSection[]>(
    () => [
      {
        items: ingredients.filter((ingredient) => ingredient.type === 'bun'),
        title: 'Булки',
        type: 'bun',
      },
      {
        items: ingredients.filter((ingredient) => ingredient.type === 'sauce'),
        title: 'Соусы',
        type: 'sauce',
      },
      {
        items: ingredients.filter((ingredient) => ingredient.type === 'main'),
        title: 'Начинки',
        type: 'main',
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
        distance: Math.abs((element?.getBoundingClientRect().top ?? 0) - containerTop),
        type,
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
                  <IngredientCard
                    count={counters[ingredient._id] ?? 0}
                    ingredient={ingredient}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
};
