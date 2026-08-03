/**
 * Auth service: host signup/login, password hashing, and typed JWT issuance.
 */
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { query } from '#app/connections/database.js';
import config from '#app/common/config.js';
import { BadRequest, UnauthorizedRequest } from '#app/common/error/index.js';

const SCRYPT_KEYLEN = 64;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';
const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
};

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

  async signup ({ email, password }) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) throw new BadRequest('An account with that email already exists');

    const passwordHash = this.hashPassword(password);
    const result = await query(
      `INSERT INTO users (email, password_hash, created_at)
       VALUES ($1, $2, $3)
       RETURNING id, email, created_at`,
      [email, passwordHash, nowIso()]
    );
    return result.rows[0];
  }

  async login ({ email, password }) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const row = result.rows[0];
    if (!row || !this.verifyPassword(password, row.password_hash)) {
      throw new UnauthorizedRequest('Invalid email or password');
    }
    return { id: row.id, email: row.email, created_at: row.created_at };
  }

  issueAccessToken (user) {
    return this.issueTypedToken(user, TOKEN_TYPE.ACCESS, ACCESS_TOKEN_EXPIRY);
  }

  issueRefreshToken (user) {
    return this.issueTypedToken(user, TOKEN_TYPE.REFRESH, REFRESH_TOKEN_EXPIRY);
  }

  issueTypedToken (user, type, expiresIn) {
    return jwt.sign({ sub: user.id, email: user.email, type }, config.get('secret_key'), { expiresIn });
  }

  verifyAccessToken (token) {
    return this.verifyTypedToken(token, TOKEN_TYPE.ACCESS);
  }

  verifyRefreshToken (token) {
    return this.verifyTypedToken(token, TOKEN_TYPE.REFRESH);
  }

  verifyTypedToken (token, expectedType) {
    const payload = jwt.verify(token, config.get('secret_key'));
    if (payload.type !== expectedType) {
      throw new UnauthorizedRequest('Invalid token type');
    }
    return payload;
  }

  async getUserById (id) {
    const result = await query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
}

export const authService = new AuthService();
