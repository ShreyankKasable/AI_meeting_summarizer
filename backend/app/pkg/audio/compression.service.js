import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

const execFileAsync = promisify(execFile);

export class AudioCompressionService {
  async compressForStorage (inputFile) {
    if (!this.shouldCompress(inputFile)) {
      return { filePath: inputFile, compressed: false };
    }

    const outputFile = storageOutputPath(inputFile);
    try {
      await this.runFfmpeg(inputFile, outputFile);
      const [inputStats, outputStats] = await Promise.all([fs.stat(inputFile), fs.stat(outputFile)]);
      if (outputStats.size < 1) throw new Error('FFmpeg created an empty audio file');

      const savedPct = Math.max(0, Math.round((1 - outputStats.size / inputStats.size) * 100));
      logger.info(
        `Compressed recording for storage: ${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)} (${savedPct}% smaller)`
      );
      return { filePath: outputFile, compressed: true };
    } catch (error) {
      await removeIfExists(outputFile);
      logger.warn(`Could not compress recording ${inputFile}; storing original audio:`, error.message);
      return { filePath: inputFile, compressed: false };
    }
  }

  async removeIfReplaced (originalFile, storageFile) {
    if (!originalFile || !storageFile || path.resolve(originalFile) === path.resolve(storageFile)) return;
    await removeIfExists(originalFile);
  }

  shouldCompress (inputFile) {
    if (!inputFile) return false;
    if (!config.get('audio_storage.compress_recordings')) return false;
    if (config.get('audio_storage.storage_format') !== 'mp3') return false;
    return path.extname(inputFile).toLowerCase() !== '.mp3';
  }

  async runFfmpeg (inputFile, outputFile) {
    const bitrate = Math.max(16, Number(config.get('audio_storage.bitrate_kbps')) || 48);
    await execFileAsync(ffmpegInstaller.path, [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      inputFile,
      '-vn',
      '-ac',
      '1',
      '-ar',
      '16000',
      '-codec:a',
      'libmp3lame',
      '-b:a',
      `${bitrate}k`,
      outputFile,
    ], {
      timeout: Number(config.get('audio_storage.compression_timeout_ms')) || 600000,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
  }
}

function storageOutputPath (inputFile) {
  const parsed = path.parse(inputFile);
  return path.join(parsed.dir, `${parsed.name}_storage.mp3`);
}

async function removeIfExists (filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') logger.warn(`Could not delete temporary audio file ${filePath}:`, error.message);
  }
}

function formatBytes (bytes) {
  if (!Number.isFinite(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const audioCompressionService = new AudioCompressionService();
