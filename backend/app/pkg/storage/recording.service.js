import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

const AUDIO_ROUTE_PREFIX = '/data/audio/';
const DEFAULT_AUDIO_CONTENT_TYPE = 'audio/wav';
const TEMP_AUDIO_DIR = path.join(os.tmpdir(), 'meetai-audio');
const AUDIO_CONTENT_TYPES = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'audio/webm',
  '.m4a': 'audio/mp4',
  '.mp4': 'audio/mp4',
  '.ogg': 'audio/ogg',
};

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

  async createMultipartRecording ({ meetingId, extension = '.webm', contentType } = {}) {
    if (!this.isR2Enabled()) return null;

    const key = this.buildObjectKeyForExtension(extension, meetingId, { group: 'raw' });
    const r2 = this.r2Config();
    const result = await this.getClient(r2).send(new CreateMultipartUploadCommand({
      Bucket: r2.bucket,
      Key: key,
      ContentType: contentType || contentTypeForExtension(extension),
    }));

    logger.info(`Created R2 multipart recording upload: ${key}`);
    return { uploadId: result.UploadId, key };
  }

  async uploadMultipartRecordingPart ({ key, uploadId, partNumber, localFile }) {
    if (!this.isR2Enabled()) throw new Error('R2 multipart upload requires AUDIO_STORAGE_PROVIDER=r2');
    if (!key || !uploadId || !partNumber || !localFile) throw new Error('Missing multipart upload part data');

    const r2 = this.r2Config();
    const stats = await fsp.stat(localFile);
    const result = await this.getClient(r2).send(new UploadPartCommand({
      Bucket: r2.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: Number(partNumber),
      Body: fs.createReadStream(localFile),
      ContentLength: stats.size,
    }));

    return { PartNumber: Number(partNumber), ETag: result.ETag };
  }

  async completeMultipartRecording ({ key, uploadId, parts }) {
    if (!this.isR2Enabled()) throw new Error('R2 multipart upload requires AUDIO_STORAGE_PROVIDER=r2');
    if (!key || !uploadId || !Array.isArray(parts) || !parts.length) throw new Error('Missing multipart completion data');

    const r2 = this.r2Config();
    const normalizedParts = parts
      .map((part) => ({ PartNumber: Number(part.PartNumber), ETag: part.ETag }))
      .filter((part) => Number.isInteger(part.PartNumber) && part.PartNumber > 0 && part.ETag)
      .sort((a, b) => a.PartNumber - b.PartNumber);

    if (!normalizedParts.length) throw new Error('No valid multipart parts provided');

    await this.getClient(r2).send(new CompleteMultipartUploadCommand({
      Bucket: r2.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: normalizedParts },
    }));

    logger.info(`Completed R2 multipart recording upload: ${key}`);
    return { key, audioPath: this.publicAudioPath(key) };
  }

  async abortMultipartRecording ({ key, uploadId }) {
    if (!this.isR2Enabled() || !key || !uploadId) return;

    try {
      const r2 = this.r2Config();
      await this.getClient(r2).send(new AbortMultipartUploadCommand({
        Bucket: r2.bucket,
        Key: key,
        UploadId: uploadId,
      }));
      logger.info(`Aborted R2 multipart recording upload: ${key}`);
    } catch (error) {
      logger.warn(`Could not abort R2 multipart recording ${key}:`, error.message);
    }
  }

  async materializeRecordingToTemp (audioPathOrKey, { extension } = {}) {
    const key = this.keyFromAudioPath(audioPathOrKey);
    if (!key) return null;

    if (!this.isR2Enabled()) return resolveLocalAudioPath(audioPathOrKey);

    await fsp.mkdir(TEMP_AUDIO_DIR, { recursive: true });
    const ext = safeExtension(extension || path.extname(key) || '.audio');
    const localFile = path.join(TEMP_AUDIO_DIR, `recording_${Date.now()}_${crypto.randomUUID()}${ext}`);
    const r2 = this.r2Config();
    const object = await this.getClient(r2).send(new GetObjectCommand({ Bucket: r2.bucket, Key: key }));
    await pipelineObjectBody(object.Body, fs.createWriteStream(localFile));
    return localFile;
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
    return this.buildObjectKeyForExtension(ext, meetingId);
  }

  buildObjectKeyForExtension (extension, meetingId, { group } = {}) {
    const ext = safeExtension(extension || '.wav');
    const safeMeetingId = meetingId == null ? 'unknown' : String(meetingId).replace(/[^\w-]/g, '_');
    const fileName = `meeting_${safeMeetingId}_${Date.now()}_${crypto.randomUUID()}${ext}`;
    const prefix = String(config.get('r2.key_prefix') || '').replace(/^\/+|\/+$/g, '');
    return [prefix, group, fileName].filter(Boolean).join('/');
  }

  async uploadLocalFile (localFile, key) {
    const r2 = this.r2Config();
    await this.getClient(r2).send(new PutObjectCommand({
      Bucket: r2.bucket,
      Key: key,
      Body: fs.createReadStream(localFile),
      ContentType: contentTypeForPath(localFile),
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

async function pipelineObjectBody (body, writable) {
  if (!body) throw new Error('R2 object returned an empty response body');
  if (typeof body.pipe === 'function') {
    await pipeline(body, writable);
    return;
  }
  if (typeof body.transformToWebStream === 'function') {
    await pipeline(Readable.fromWeb(body.transformToWebStream()), writable);
    return;
  }
  await pipeline(Readable.from(body), writable);
}

function isMissingObjectError (error) {
  return ['NoSuchKey', 'NotFound', 'NotFoundError'].includes(error?.name)
    || error?.$metadata?.httpStatusCode === 404;
}

function contentTypeForPath (filePath) {
  return AUDIO_CONTENT_TYPES[path.extname(filePath).toLowerCase()] || DEFAULT_AUDIO_CONTENT_TYPE;
}

function contentTypeForExtension (extension) {
  return AUDIO_CONTENT_TYPES[String(extension || '').toLowerCase()] || DEFAULT_AUDIO_CONTENT_TYPE;
}

function safeExtension (extension) {
  const ext = String(extension || '').trim().toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/.test(ext)) return ext;
  return '.wav';
}

export const recordingStorageService = new RecordingStorageService();
