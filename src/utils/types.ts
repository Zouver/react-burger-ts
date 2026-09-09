export type TIngredient = {
  _id: string;
  name: string;
  type: 'bun' | 'sauce' | 'main';
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_large: string;
  image_mobile: string;
  __v: number;
};

export type TConstructorIngredient = TIngredient & {
  constructorId: string;
};

export type TUser = {
  email: string;
  name: string;
};

export type TOrderStatus = 'created' | 'pending' | 'done';

export type TOrder = {
  _id: string;
  name: string;
  ingredients: string[];
  status: TOrderStatus;
  number: number;
  createdAt: string;
  updatedAt: string;
};

export type TConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'error';

export type TOrdersSnapshot = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

export type TOrdersFeed = TOrdersSnapshot & {
  hasReceivedData: boolean;
  connectionStatus: TConnectionStatus;
  error: string | null;
};

export type TOrderIngredient = {
  ingredient: TIngredient;
  count: number;
};
