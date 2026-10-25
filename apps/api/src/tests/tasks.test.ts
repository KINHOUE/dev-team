import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function register() {
  const email = `tasks-${unique()}@example.com`;
  const password = 'password123';
  // L'inscription ne renvoie plus de jeton : on établit la session via login.
  await request(app).post('/auth/register').send({ email, password });
  const loginRes = await request(app)
    .post('/auth/login')
    .set('X-Client', 'mobile')
    .send({ email, password });
  return { token: loginRes.body.token as string, email };
}

describe('Endpoints /tasks', () => {
  it('exige une authentification (401)', async () => {
    expect((await request(app).get('/tasks')).status).toBe(401);
    expect((await request(app).post('/tasks').send({ title: 'x' })).status).toBe(401);
  });

  it('CRUD complet + bascule « faite »', async () => {
    const { token } = await register();
    const auth = { Authorization: `Bearer ${token}` };

    // Création
    const createRes = await request(app).post('/tasks').set(auth).send({ title: 'Ma tâche' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.done).toBe(false);
    const id = createRes.body.id as string;

    // Liste
    const listRes = await request(app).get('/tasks').set(auth);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].id).toBe(id);

    // Modification
    const updateRes = await request(app).put(`/tasks/${id}`).set(auth).send({ title: 'Titre modifié' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Titre modifié');

    // Bascule → faite
    const completeRes = await request(app).patch(`/tasks/${id}/complete`).set(auth);
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.done).toBe(true);

    // Bascule → à faire
    const uncompleteRes = await request(app).patch(`/tasks/${id}/complete`).set(auth);
    expect(uncompleteRes.body.done).toBe(false);

    // Suppression
    expect((await request(app).delete(`/tasks/${id}`).set(auth)).status).toBe(204);

    // Liste vide après suppression
    const emptyRes = await request(app).get('/tasks').set(auth);
    expect(emptyRes.body).toHaveLength(0);
  });

  it('refuse un titre vide ou blanc (400)', async () => {
    const { token } = await register();
    const auth = { Authorization: `Bearer ${token}` };
    const res = await request(app).post('/tasks').set(auth).send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  it('empêche d\'accéder aux tâches d\'un autre utilisateur (404)', async () => {
    const a = await register();
    const b = await register();

    const createRes = await request(app)
      .post('/tasks')
      .set({ Authorization: `Bearer ${a.token}` })
      .send({ title: 'Privée' });
    const id = createRes.body.id as string;

    const updateRes = await request(app)
      .put(`/tasks/${id}`)
      .set({ Authorization: `Bearer ${b.token}` })
      .send({ title: 'Intrusion' });
    expect(updateRes.status).toBe(404);

    const deleteRes = await request(app)
      .delete(`/tasks/${id}`)
      .set({ Authorization: `Bearer ${b.token}` });
    expect(deleteRes.status).toBe(404);
  });
});
