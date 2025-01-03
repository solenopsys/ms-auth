import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { jwt } from '@elysiajs/jwt';
import { DB } from '../src/db';
import { GoogleAuthHandler } from '../src/handlers/google-auth.handlers';
import { RestApp } from '../src/app';
import {  type GoogleAuth } from '../src/services/google-auth.service';

export class MockGoogleAuthService implements GoogleAuth {
  async verifyToken(token: string) {
    if (token === 'valid_test_token') {
      return {
        email: 'test@example.com',
        sub: '12345',
        email_verified: true
      };
    }
    throw new Error('Invalid Google token');
  }
}

describe('Google Auth Integration', () => {
  let app: RestApp;

  beforeAll(() => {
    const db = new DB("auth.db");
    const googleAuth = new MockGoogleAuthService();

    const gh= new GoogleAuthHandler(googleAuth, db, jwt);

    app = new RestApp(3001);
    app.addHandler(gh);
    app.start();
  });

  afterAll(() => {
    app.stop();
  });

  it('should handle successful authentication', async () => {
    const response = await fetch('http://localhost:3001/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_token: 'valid_test_token'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data).toHaveProperty('access_token');
    expect(data).toHaveProperty('token_type', 'Bearer');
    expect(data).toHaveProperty('expires_in');
  });

  it('should handle invalid authentication', async () => {
    const response = await fetch('http://localhost:3001/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_token: 'invalid_token'
      })
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle missing id_token', async () => {
    const response = await fetch('http://localhost:3001/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});