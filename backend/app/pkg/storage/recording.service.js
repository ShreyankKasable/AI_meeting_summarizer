import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

const AUDIO_ROUTE_PREFIX = '/data/audio/';
const DEFAULT_AUDIO_CONTENT_TYPE = 'audio/wav';

export class RecordingStorageService {
  constructor () {
    this.client = null;
    this.clientSignature = null;
  }

  isR2Enabled () {
    return config.get('audio_storage.provider') === 'r2';
  }

  async persistRecording (localFile, { meetingId } = {}) {
    if (!localFile) return null;
    if (!this.isR2Enabled()) return this.publicAudioPath(path.basename(localFile));

    const key = this.buildObjectKey(localFile, meetingId);
    await this.uploadLocalFile(localFile, key);
    await this.removeLocalFile(localFile);
    return this.publicAudioPath(key);
  }

  async streamRecording (audioPathOrKey, req, res) {
    if (!this.isR2Enabled()) return false;

    const key = this.keyFromAudioPath(audioPathOrKey);
    if (!key) return false;

    const r2 = this.r2Config();
    const client = this.getClient(r2);

    try {
      const head = await client.send(new HeadObjectCommand({ Bucket: r2.bucket, Key: key }));
      const size = Number(head.ContentLength || 0);
      const contentType = head.ContentType || DEFAULT_AUDIO_CONTENT_TYPE;
      const range = parseRangeHeader(req.headers.range, size);

      if (req.headers.range && !range) {
        res.status(416).set('Content-Range', `bytes */${size}`).end();
        return true;
      }

      const params = { Bucket: r2.bucket, Key: key };
      if (range) params.Range = `bytes=${range.start}-${range.end}`;

      const object = await client.send(new GetObjectCommand(params));
      const contentLength = range ? range.end - range.start + 1 : size;

      res.status(range ? 206 : 200);
      res.set({
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600',
        'Content-Length': String(contentLength),
        'Content-Type': contentType,
      });
      if (range) res.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);

      pipeObjectBody(object.Body, res);
      return true;
    } catch (error) {
      if (isMissingObjectError(error)) return false;
      throw error;
    }
  }

  async deleteRecording (audioFilePath) {
    await Promise.all([
      this.deleteR2Object(audioFilePath),
      this.deleteLocalRecording(audioFilePath),
    ]);
  }

  publicAudioPath (key) {
    return `${AUDIO_ROUTE_PREFIX}${encodeURIComponent(key)}`;
  }

  keyFromAudioPath (audioPathOrKey) {
    if (!audioPathOrKey || typeof audioPathOrKey !== 'string') return null;
    if (audioPathOrKey.startsWith(AUDIO_ROUTE_PREFIX)) {
      return decodeURIComponent(audioPathOrKey.slice(AUDIO_ROUTE_PREFIX.length));
    }
    return audioPathOrKey;
  }

  buildObjectKey (localFile, meetingId) {
    const ext = path.extname(localFile) || '.wav';
    const safeMeetingId = meetingId == null ? 'unknown' : String(meetingId).replace(/[^\w-]/g, '_');
    const fileName = `meeting_${safeMeetingId}_${Date.now()}_${crypto.randomUUID()}${ext}`;
    const prefix = String(config.get('r2.key_prefix') || '').replace(/^\/+|\/+$/g, '');
    return prefix ? `${prefix}/${fileName}` : fileName;
  }

  async uploadLocalFile (localFile, key) {
    const r2 = this.r2Config();
    await this.getClient(r2).send(new PutObjectCommand({
      Bucket: r2.bucket,
      Key: key,
      Body: fs.createReadStream(localFile),
      ContentType: DEFAULT_AUDIO_CONTENT_TYPE,
    }));
    logger.info(`Uploaded recording to R2: ${key}`);
  }

  async deleteR2Object (audioFilePath) {
    if (!this.isR2Enabled()) return;

    const key = this.keyFromAudioPath(audioFilePath);
    if (!key || path.isAbsolute(key)) return;

    try {
      const r2 = this.r2Config();
      await this.getClient(r2).send(new DeleteObjectCommand({ Bucket: r2.bucket, Key: key }));
      logger.info(`Deleted R2 recording: ${key}`);
    } catch (error) {
      logger.warn(`Could not delete R2 recording ${key}:`, error.message);
    }
  }

  async deleteLocalRecording (audioFilePath) {
    const resolved = resolveLocalAudioPath(audioFilePath);
    if (!resolved) return;
    await this.removeLocalFile(resolved);
  }

  async removeLocalFile (filePath) {
    try {
      await fsp.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') logger.warn(`Could not delete audio file ${filePath}:`, error.message);
    }
  }

  getClient (r2 = this.r2Config()) {
    const signature = `${r2.endpoint}|${r2.accessKeyId}|${r2.secretAccessKey}|${r2.region}`;
    if (!this.client || this.clientSignature !== signature) {
      this.client = new S3Client({
        endpoint: r2.endpoint,
        region: r2.region,
        credentials: {
          accessKeyId: r2.accessKeyId,
          secretAccessKey: r2.secretAccessKey,
        },
        forcePathStyle: true,
      });
      this.clientSignature = signature;
    }
    return this.client;
  }

  r2Config () {
    const accountId = String(config.get('r2.account_id') || '').trim();
    const endpoint = String(config.get('r2.endpoint') || '').trim()
      || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
    const bucket = String(config.get('r2.bucket') || '').trim();
    const accessKeyId = String(config.get('r2.access_key_id') || '').trim();
    const secretAccessKey = String(config.get('r2.secret_access_key') || '').trim();
    const region = String(config.get('r2.region') || 'auto').trim();

    const missing = [];
    if (!endpoint) missing.push('R2_ENDPOINT or R2_ACCOUNT_ID');
    if (!bucket) missing.push('R2_BUCKET');
    if (!accessKeyId) missing.push('R2_ACCESS_KEY_ID');
    if (!secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
    if (missing.length) {
      throw new Error(`R2 storage is enabled but missing: ${missing.join(', ')}`);
    }

    return { endpoint, bucket, accessKeyId, secretAccessKey, region };
  }
}

function resolveLocalAudioPath (audioFilePath) {
  if (!audioFilePath || typeof audioFilePath !== 'string') return null;

  const audioDir = path.resolve(config.paths.AUDIO_DIR);
  let candidate = null;

  if (audioFilePath.startsWith(AUDIO_ROUTE_PREFIX) || audioFilePath.startsWith('\\data\\audio\\')) {
    candidate = path.resolve(audioDir, path.basename(audioFilePath));
  } else if (path.isAbsolute(audioFilePath)) {
    candidate = path.resolve(audioFilePath);
  }

  if (!candidate) return null;
  const relative = path.relative(audioDir, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return candidate;
}

function parseRangeHeader (header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || !Number.isFinite(size) || size < 1) return null;

  let start;
  let end;

  if (match[1] === '' && match[2] === '') return null;
  if (match[1] === '') {
    const suffixLength = Number(match[2]);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Number(match[2]);
  }

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

function pipeObjectBody (body, res) {
  if (!body) throw new Error('R2 object returned an empty response body');
  if (typeof body.pipe === 'function') {
    body.pipe(res);
    return;
  }
  if (typeof body.transformToWebStream === 'function') {
    Readable.fromWeb(body.transformToWebStream()).pipe(res);
    return;
  }
  Readable.from(body).pipe(res);
}

function isMissingObjectError (error) {
  return ['NoSuchKey', 'NotFound', 'NotFoundError'].includes(error?.name)
    || error?.$metadata?.httpStatusCode === 404;
}

export const recordingStorageService = new RecordingStorageService();
