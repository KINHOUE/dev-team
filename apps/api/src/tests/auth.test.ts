import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('POST /auth/register', () => {
  it('crée un compte (201) sans renvoyer de jeton ni d’utilisateur', async () => {
    const email = `user-${unique()}@example.com`;
    const res = await request(app).post('/auth/register').send({ email, password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user).toBeUndefined();
    expect(res.body.message).toBeTruthy();
  });

  it('refuse un email invalide (400)', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'pas-un-email', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBeTruthy();
  });

  it('refuse un mot de passe trop court (400)', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: `short-${unique()}@example.com`, password: 'court' });
    expect(res.status).toBe(400);
  });

  it('ne révèle pas si un email existe déjà (201, réponse identique)', async () => {
    const email = `dup-${unique()}@example.com`;
    const first = await request(app).post('/auth/register').send({ email, password: 'password123' });
    const second = await request(app).post('/auth/register').send({ email, password: 'password123' });

    // Pas de 409 : la réponse est identique, que l'email existe ou non.
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body).toEqual(first.body);
  });
});

describe('POST /auth/login', () => {
  it('renvoie un jeton au client mobile (en-tête X-Client: mobile)', async () => {
    const email = `login-${unique()}@example.com`;
    await request(app).post('/auth/register').send({ email, password: 'password123' });
    const res = await request(app)
      .post('/auth/login')
      .set('X-Client', 'mobile')
      .send({ email, password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(email);
  });

  it("ne renvoie pas le jeton dans le corps sans l'en-tête X-Client (web)", async () => {
    const email = `web-${unique()}@example.com`;
    await request(app).post('/auth/register').send({ email, password: 'password123' });
    const res = await request(app).post('/auth/login').send({ email, password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user.email).toBe(email);
    // Le jeton reste délivré via le cookie httpOnly.
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('refuse un mauvais mot de passe (401)', async () => {
    const email = `bad-${unique()}@example.com`;
    await request(app).post('/auth/register').send({ email, password: 'password123' });
    const res = await request(app).post('/auth/login').send({ email, password: 'mauvais-mdp' });
    expect(res.status).toBe(401);
  });

  it('refuse un email inconnu (401)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: `inconnu-${unique()}@example.com`, password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/logout (CSRF)', () => {
  it('déconnecte sans en-tête Origin (client non navigateur)', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(204);
  });

  it('déconnecte avec une origine autorisée', async () => {
    const res = await request(app).post('/auth/logout').set('Origin', 'http://localhost:5173');
    expect(res.status).toBe(204);
  });

  it('refuse une origine non autorisée (403)', async () => {
    const res = await request(app).post('/auth/logout').set('Origin', 'https://evil.example.com');
    expect(res.status).toBe(403);
  });
});
