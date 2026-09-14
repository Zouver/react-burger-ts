import { expect, test } from '@playwright/test';

import { bun, main } from './fixtures/constructor.ts';
import { mockApi } from './fixtures/mock-api.ts';

const navigationHistoryKey = 'constructor-e2e-navigation-history';
const authPathnames = ['/login', '/register', '/forgot-password', '/reset-password'];

test('собирает бургер и оформляет заказ без переходов на auth-страницы', async ({
  page,
}): Promise<void> => {
  await mockApi(page);

  await page.addInitScript((historyKey: string): void => {
    localStorage.setItem('accessToken', 'Bearer tests-access-token');
    localStorage.setItem('refreshToken', 'tests-refresh-token');

    const recordPathname = (): void => {
      const pathnames = (sessionStorage.getItem(historyKey) ?? '')
        .split('|')
        .filter(Boolean);

      pathnames.push(window.location.pathname);
      sessionStorage.setItem(historyKey, pathnames.join('|'));
    };
    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);

    history.pushState = (...args): void => {
      pushState(...args);
      recordPathname();
    };
    history.replaceState = (...args): void => {
      replaceState(...args);
      recordPathname();
    };
    window.addEventListener('popstate', recordPathname);
    recordPathname();
  }, navigationHistoryKey);

  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Соберите бургер' })
  ).toBeVisible();

  const mainCard = page.getByText(main.name, { exact: true }).locator('..');

  await mainCard.click();

  const ingredientDialog = page.getByRole('dialog', {
    name: 'Детали ингредиента',
  });

  await expect(ingredientDialog).toBeVisible();
  await expect(ingredientDialog.getByText(main.name, { exact: true })).toBeVisible();
  await expect(ingredientDialog.getByText('Калории,ккал')).toBeVisible();
  await expect(
    ingredientDialog.getByText(String(main.calories), { exact: true })
  ).toBeVisible();
  await expect(ingredientDialog.getByText('Белки, г')).toBeVisible();
  await expect(
    ingredientDialog.getByText(String(main.proteins), { exact: true })
  ).toBeVisible();
  await expect(ingredientDialog.getByText('Жиры, г')).toBeVisible();
  await expect(
    ingredientDialog.getByText(String(main.fat), { exact: true })
  ).toBeVisible();
  await expect(ingredientDialog.getByText('Углеводы, г')).toBeVisible();
  await expect(
    ingredientDialog.getByText(String(main.carbohydrates), { exact: true })
  ).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(ingredientDialog).toBeHidden();
  await expect(page).toHaveURL('/');

  const bunCard = page.getByText(bun.name, { exact: true }).locator('..');
  const constructor = page.getByRole('region', { name: 'Конструктор бургера' });
  const bunDropTarget = constructor.getByText('Выберите булку', { exact: true }).first();
  const ingredientDropTarget = constructor.getByText('Перетащите ингредиенты', {
    exact: true,
  });

  await bunCard.dragTo(bunDropTarget);
  await mainCard.dragTo(ingredientDropTarget);

  await expect(
    constructor.getByText(`${bun.name} (верх)`, { exact: true })
  ).toBeVisible();
  await expect(
    constructor.getByText(`${bun.name} (низ)`, { exact: true })
  ).toBeVisible();
  await expect(constructor.getByText(main.name, { exact: true })).toBeVisible();
  await expect(bunCard.getByText('2', { exact: true })).toBeVisible();
  await expect(mainCard.getByText('1', { exact: true })).toBeVisible();
  await expect(
    constructor.getByText(String(bun.price * 2 + main.price), { exact: true })
  ).toBeVisible();

  const createOrderButton = page.getByRole('button', { name: 'Оформить заказ' });
  const orderRequestPromise = page.waitForRequest('**/api/orders');

  await expect(createOrderButton).toBeEnabled();
  await createOrderButton.click();

  const orderRequest = await orderRequestPromise;

  expect(orderRequest.method()).toBe('POST');
  expect(orderRequest.postDataJSON()).toEqual({
    ingredients: [bun._id, main._id, bun._id],
  });
  expect(orderRequest.headers().authorization).toBe('Bearer tests-access-token');

  const orderDialog = page.getByRole('dialog', { name: 'Детали заказа' });

  await expect(orderDialog).toBeVisible();
  await expect(orderDialog.getByText('424242', { exact: true })).toBeVisible();
  await expect(
    orderDialog.getByText('идентификатор заказа', { exact: true })
  ).toBeVisible();
  await expect(
    orderDialog.getByText('Ваш заказ начали готовить', { exact: true })
  ).toBeVisible();
  await expect(constructor.getByText('Выберите булку', { exact: true })).toHaveCount(2);
  await expect(
    constructor.getByText('Перетащите ингредиенты', { exact: true })
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Закрыть модальное окно' })
    .click({ position: { x: 20, y: 20 } });

  await expect(orderDialog).toBeHidden();
  await expect(page).toHaveURL('/');

  const visitedPathnames = await page.evaluate(
    (historyKey: string): string[] =>
      (sessionStorage.getItem(historyKey) ?? '').split('|').filter(Boolean),
    navigationHistoryKey
  );

  expect(visitedPathnames).toEqual(
    expect.arrayContaining(['/', `/ingredients/${main._id}`])
  );
  authPathnames.forEach((authPathname): void => {
    expect(visitedPathnames).not.toContain(authPathname);
  });
});
