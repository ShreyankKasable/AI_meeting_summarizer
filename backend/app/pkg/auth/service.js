/**
 * Auth service — host signup/login, password hashing (node:crypto scrypt, no
 * native dependency), and JWT issuance/verification.
 */
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { getDb } from '#app/connections/database.js';
import config from '#app/common/config.js';
import { BadRequest, UnauthorizedRequest } from '#app/common/error/index.js';

const SCRYPT_KEYLEN = 64;
const TOKEN_EXPIRY = '30d';

const nowIso = () => new Date().toISOString();

export class AuthService {
  hashPassword (password) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword (password, stored) {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  }

  signup ({ email, password }) {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) throw new BadRequest('An account with that email already exists');

    const passwordHash = this.hashPassword(password);
    const info = db.prepare(
      'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)'
    ).run(email, passwordHash, nowIso());
    return this.getUserById(Number(info.lastInsertRowid));
  }

  login ({ email, password }) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row || !this.verifyPassword(password, row.password_hash)) {
      throw new UnauthorizedRequest('Invalid email or password');
    }
    return { id: row.id, email: row.email, created_at: row.created_at };
  }

  issueToken (user) {
    return jwt.sign({ sub: user.id, email: user.email }, config.get('secret_key'), {
      expiresIn: TOKEN_EXPIRY,
    });
  }

  verifyToken (token) {
    return jwt.verify(token, config.get('secret_key'));
  }

  getUserById (id) {
    const row = getDb().prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(id);
    return row || null;
  }
}

export const authService = new AuthService();
