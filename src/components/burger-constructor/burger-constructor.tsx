import {
  Button,
  ConstructorElement,
  CurrencyIcon,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import {
  addIngredient,
  moveIngredient,
  removeIngredient,
  selectConstructorTotalPrice,
  selectBurgerConstructor,
} from '@services/burgerConstructor/burgerConstructorSlice.ts';
import { useAppDispatch, useAppSelector } from '@services/hooks.ts';
import { ConstructorIngredientDragType, IngredientDragType } from '@utils/dnd.ts';

import type { TConstructorIngredient, TIngredient } from '@utils/types';
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd';

import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  isOrderLoading: boolean;
  onOrderClick: () => Promise<void>;
  orderError: string | null;
};

type TConstructorIngredientItemProps = {
  index: number;
  ingredient: TConstructorIngredient;
};

type TSortableIngredientDragItem = {
  constructorId: string;
  index: number;
};

const ConstructorIngredientItem = ({
  index,
  ingredient,
}: TConstructorIngredientItemProps): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const itemRef = useRef<HTMLLIElement | null>(null);
  const [{ isDragging }, drag] = useDrag<
    TSortableIngredientDragItem,
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      collect: (
        monitor: DragSourceMonitor<TSortableIngredientDragItem, unknown>
      ): { isDragging: boolean } => ({
        isDragging: monitor.isDragging(),
      }),
      item: { constructorId: ingredient.constructorId, index },
      type: ConstructorIngredientDragType,
    }),
    [index, ingredient.constructorId]
  );
  const [, drop] = useDrop<TSortableIngredientDragItem>({
    accept: ConstructorIngredientDragType,
    hover: (dragItem, monitor): void => {
      if (!itemRef.current || dragItem.constructorId === ingredient.constructorId) {
        return;
      }

      const hoverIndex = index;
      const dragIndex = dragItem.index;
      const hoverRect = itemRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      dispatch(moveIngredient({ fromIndex: dragIndex, toIndex: hoverIndex }));
      dragItem.index = hoverIndex;
    },
  });

  drag(drop(itemRef));

  return (
    <li
      className={`${styles.ingredient_item} ${isDragging ? styles.item_dragging : ''}`}
      ref={itemRef}
    >
      <DragIcon type="primary" />
      <ConstructorElement
        handleClose={() => dispatch(removeIngredient(ingredient.constructorId))}
        price={ingredient.price}
        text={ingredient.name}
        thumbnail={ingredient.image}
      />
    </li>
  );
};

export const BurgerConstructor = ({
  isOrderLoading,
  onOrderClick,
  orderError,
}: TBurgerConstructorProps): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const { bun, ingredients } = useAppSelector(selectBurgerConstructor);
  const totalPrice = useAppSelector(selectConstructorTotalPrice);
  const [{ canDrop, isOver }, drop] = useDrop<
    TIngredient,
    unknown,
    { canDrop: boolean; isOver: boolean }
  >(
    () => ({
      accept: IngredientDragType,
      canDrop: (ingredient): boolean =>
        ['bun', 'main', 'sauce'].includes(ingredient.type),
      collect: (
        monitor: DropTargetMonitor<TIngredient, unknown>
      ): { canDrop: boolean; isOver: boolean } => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      }),
      drop: (ingredient): void => {
        dispatch(addIngredient(ingredient));
      },
    }),
    [dispatch]
  );
  const dropRef = useRef<HTMLElement | null>(null);
  const isDropActive = canDrop && isOver;

  drop(dropRef);

  return (
    <section
      className={`${styles.burger_constructor} ${isDropActive ? styles.drop_active : ''}`}
      ref={dropRef}
    >
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
        ) : (
          <div className={`${styles.placeholder} ${styles.placeholder_top} ml-8`}>
            <p className="text text_type_main-default text_color_inactive">
              Выберите булку
            </p>
          </div>
        )}
      </div>
      <ul className={`${styles.ingredients_list} custom-scroll mt-4 mb-4 pr-2`}>
        {ingredients.length > 0 ? (
          ingredients.map((ingredient, index) => (
            <ConstructorIngredientItem
              index={index}
              ingredient={ingredient}
              key={ingredient.constructorId}
            />
          ))
        ) : (
          <li className={styles.empty_item}>
            <div className={styles.placeholder}>
              <p className="text text_type_main-default text_color_inactive">
                Перетащите ингредиенты
              </p>
            </div>
          </li>
        )}
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
        ) : (
          <div className={`${styles.placeholder} ${styles.placeholder_bottom} ml-8`}>
            <p className="text text_type_main-default text_color_inactive">
              Выберите булку
            </p>
          </div>
        )}
      </div>
      <div className={`${styles.footer} mt-10`}>
        <div className={styles.total}>
          <p className="text text_type_digits-medium">{totalPrice}</p>
          <CurrencyIcon type="primary" />
        </div>
        <Button
          disabled={!bun || isOrderLoading}
          htmlType="button"
          onClick={() => {
            void onOrderClick();
          }}
          size="large"
          type="primary"
        >
          {isOrderLoading ? 'Оформляем...' : 'Оформить заказ'}
        </Button>
      </div>
      {orderError ? (
        <p className={`${styles.error} text text_type_main-default mt-4`}>
          {orderError}
        </p>
      ) : null}
    </section>
  );
};
