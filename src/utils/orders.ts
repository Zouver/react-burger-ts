import type {
  TIngredient,
  TOrder,
  TOrderIngredient,
  TOrdersSnapshot,
  TOrderStatus,
} from '@utils/types.ts';

type TIngredientPreviews = {
  hiddenCount: number;
  items: TIngredient[];
};

const ORDER_STATUSES = new Set<string>(['created', 'pending', 'done']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isValidDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

const getDayLabel = (days: number): string => {
  const lastTwoDigits = days % 100;
  const lastDigit = days % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${days} дней назад`;
  }

  if (lastDigit === 1) {
    return `${days} день назад`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${days} дня назад`;
  }

  return `${days} дней назад`;
};

const getStartOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const isOrder = (value: unknown): value is TOrder => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value._id === 'string' &&
    value._id.length > 0 &&
    typeof value.name === 'string' &&
    value.name.length > 0 &&
    Array.isArray(value.ingredients) &&
    value.ingredients.every(
      (ingredientId) => typeof ingredientId === 'string' && ingredientId.length > 0
    ) &&
    typeof value.status === 'string' &&
    ORDER_STATUSES.has(value.status) &&
    isNonNegativeNumber(value.number) &&
    isValidDate(value.createdAt) &&
    isValidDate(value.updatedAt)
  );
};

export const parseOrdersSnapshot = (value: unknown): TOrdersSnapshot | null => {
  if (
    !isRecord(value) ||
    value.success !== true ||
    !Array.isArray(value.orders) ||
    !isNonNegativeNumber(value.total) ||
    !isNonNegativeNumber(value.totalToday)
  ) {
    return null;
  }

  return {
    orders: value.orders.filter(isOrder),
    total: value.total,
    totalToday: value.totalToday,
  };
};

export const parseOrderResponse = (value: unknown): TOrder | null => {
  if (!isRecord(value) || value.success !== true) {
    return null;
  }

  if (isOrder(value.order)) {
    return value.order;
  }

  return Array.isArray(value.orders) ? (value.orders.find(isOrder) ?? null) : null;
};

export const getOrderStatusLabel = (status: TOrderStatus): string => {
  const labels: Record<TOrderStatus, string> = {
    created: 'Создан',
    done: 'Выполнен',
    pending: 'Готовится',
  };

  return labels[status];
};

export const getOrderIngredients = (
  order: TOrder,
  ingredients: TIngredient[]
): TOrderIngredient[] => {
  const ingredientById = new Map(
    ingredients.map((ingredient) => [ingredient._id, ingredient])
  );
  const groupedIngredients = new Map<string, TOrderIngredient>();

  order.ingredients.forEach((ingredientId) => {
    const ingredient = ingredientById.get(ingredientId);

    if (!ingredient) {
      return;
    }

    const groupedIngredient = groupedIngredients.get(ingredientId);

    if (groupedIngredient) {
      groupedIngredient.count += 1;
      return;
    }

    groupedIngredients.set(ingredientId, { count: 1, ingredient });
  });

  return Array.from(groupedIngredients.values());
};

export const getOrderTotal = (order: TOrder, ingredients: TIngredient[]): number => {
  const priceById = new Map(
    ingredients.map((ingredient) => [ingredient._id, ingredient.price])
  );

  return order.ingredients.reduce(
    (total, ingredientId) => total + (priceById.get(ingredientId) ?? 0),
    0
  );
};

export const getIngredientPreviews = (
  order: TOrder,
  ingredients: TIngredient[],
  limit = 6
): TIngredientPreviews => {
  const ingredientById = new Map(
    ingredients.map((ingredient) => [ingredient._id, ingredient])
  );
  const uniqueIngredientIds = Array.from(new Set(order.ingredients));
  const knownIngredients = uniqueIngredientIds.flatMap((ingredientId) => {
    const ingredient = ingredientById.get(ingredientId);

    return ingredient ? [ingredient] : [];
  });

  return {
    hiddenCount: Math.max(knownIngredients.length - limit, 0),
    items: knownIngredients.slice(0, limit),
  };
};

export const getDisplayableOrders = (
  orders: TOrder[],
  ingredients: TIngredient[]
): TOrder[] => {
  const ingredientIds = new Set(ingredients.map((ingredient) => ingredient._id));

  return orders.filter((order) =>
    order.ingredients.some((ingredientId) => ingredientIds.has(ingredientId))
  );
};

export const splitOrderNumbers = (numbers: number[]): number[][] =>
  [numbers.slice(0, 10), numbers.slice(10, 20)].filter((column) => column.length > 0);

export const formatOrderDate = (dateValue: string, now = new Date()): string => {
  const date = new Date(dateValue);
  const differenceInDays = Math.max(
    Math.round((getStartOfDay(now) - getStartOfDay(date)) / 86_400_000),
    0
  );
  const day =
    differenceInDays === 0
      ? 'Сегодня'
      : differenceInDays === 1
        ? 'Вчера'
        : getDayLabel(differenceInDays);
  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  const offsetHours = -date.getTimezoneOffset() / 60;
  const offset = `${offsetHours >= 0 ? '+' : ''}${offsetHours}`;

  return `${day}, ${time} i-GMT${offset}`;
};
