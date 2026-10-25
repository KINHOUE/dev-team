import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function register() {
  const email = `fin-${unique()}@example.com`;
  const password = 'password123';
  // L'inscription ne renvoie plus de jeton : on établit la session via login.
  await request(app).post('/auth/register').send({ email, password });
  const loginRes = await request(app)
    .post('/auth/login')
    .set('X-Client', 'mobile')
    .send({ email, password });
  return { token: loginRes.body.token as string, email };
}

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('Module Finances', () => {
  it('exige une authentification (401)', async () => {
    expect((await request(app).get('/expenses')).status).toBe(401);
    expect((await request(app).get('/categories')).status).toBe(401);
    expect((await request(app).get('/budgets')).status).toBe(401);
    expect((await request(app).get('/forecasts')).status).toBe(401);
    expect((await request(app).get('/stats/dashboard')).status).toBe(401);
  });

  it('crée les catégories par défaut au premier accès', async () => {
    const { token } = await register();
    const res = await request(app).get('/categories').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(res.body.map((c: { icon: string }) => c.icon)).toContain('food');
  });

  it('CRUD dépenses, budget, prévision et agrégats du dashboard', async () => {
    const { token } = await register();
    const auth = authHeader(token);
    const month = '2026-10';

    const cats = await request(app).get('/categories').set(auth);
    const food = cats.body.find((c: { name: string }) => c.name === 'Alimentation');

    const created = await request(app)
      .post('/expenses')
      .set(auth)
      .send({
        amountCents: 500000,
        date: `${month}-15`,
        categoryId: food.id,
        note: 'Courses',
        source: 'manual',
      });
    expect(created.status).toBe(201);
    expect(created.body.amountCents).toBe(500000);

    const voiceExpense = await request(app)
      .post('/expenses')
      .set(auth)
      .send({ amountCents: 150000, date: `${month}-16`, categoryId: food.id, source: 'voice' });
    expect(voiceExpense.body.source).toBe('voice');

    const budget = await request(app)
      .put('/budgets')
      .set(auth)
      .send({ month, amountCents: 1000000 });
    expect(budget.status).toBe(200);

    const catBudget = await request(app)
      .put('/budgets')
      .set(auth)
      .send({ month, categoryId: food.id, amountCents: 600000 });
    expect(catBudget.body.categoryId).toBe(food.id);

    const forecast = await request(app)
      .post('/forecasts')
      .set(auth)
      .send({ month, amountCents: 900000 });
    expect(forecast.status).toBe(201);

    const dash = await request(app).get(`/stats/dashboard?month=${month}`).set(auth);
    expect(dash.status).toBe(200);
    expect(dash.body.totalSpentCents).toBe(650000);
    expect(dash.body.budgetTotalCents).toBe(1000000);
    expect(dash.body.remainingCents).toBe(350000);
    expect(dash.body.forecastTotalCents).toBe(900000);
    expect(dash.body.expenseCount).toBe(2);

    const foodStat = dash.body.byCategory.find(
      (c: { name: string }) => c.name === 'Alimentation',
    );
    expect(foodStat.spentCents).toBe(650000);
    expect(foodStat.budgetCents).toBe(600000);

    // Répartition mensuelle par catégorie (vue « Détails » du graphique)
    expect(dash.body.monthsDetails).toHaveLength(6);
    const october = dash.body.monthsDetails.find(
      (m: { month: string }) => m.month === month,
    );
    expect(october.totalCents).toBe(650000);
    expect(
      october.categories.find((c: { name: string }) => c.name === 'Alimentation').spentCents,
    ).toBe(650000);

    // Filtre par mois : aucune dépense en septembre
    const september = await request(app).get('/expenses?month=2026-09').set(auth);
    expect(september.body).toHaveLength(0);
  });

  it('rejette les montants invalides (400)', async () => {
    const { token } = await register();
    const auth = authHeader(token);
    expect(
      (
        await request(app)
          .post('/expenses')
          .set(auth)
          .send({ amountCents: -100, date: '2026-10-25' })
      ).status,
    ).toBe(400);
    expect(
      (
        await request(app)
          .post('/expenses')
          .set(auth)
          .send({ amountCents: 100, date: 'pas-une-date' })
      ).status,
    ).toBe(400);
    expect(
      (await request(app).put('/budgets').set(auth).send({ month: '2026-13', amountCents: 10 }))
        .status,
    ).toBe(400);
  });

  it('isole les données entre comptes (404)', async () => {
    const a = await register();
    const b = await register();

    const created = await request(app)
      .post('/expenses')
      .set(authHeader(a.token))
      .send({ amountCents: 1000, date: '2026-10-01' });
    const id = created.body.id as string;

    expect(
      (await request(app).delete(`/expenses/${id}`).set(authHeader(b.token))).status,
    ).toBe(404);
    expect(
      (await request(app).put(`/expenses/${id}`).set(authHeader(b.token)).send({ note: 'x' }))
        .status,
    ).toBe(404);
  });

  it('change la devise du compte et refuse une devise inconnue', async () => {
    const { token } = await register();
    const auth = authHeader(token);

    const ok = await request(app).patch('/auth/me').set(auth).send({ currency: 'EUR' });
    expect(ok.status).toBe(200);
    expect(ok.body.user.currency).toBe('EUR');

    const bad = await request(app).patch('/auth/me').set(auth).send({ currency: 'XYZ' });
    expect(bad.status).toBe(400);
  });
});
