import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const __filename = (url) => fileURLToPath(url);
export const __dirname = (url) => path.dirname(fileURLToPath(url));

export const getDirectories = (source) =>
  readdirSync(__dirname(source), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

export const getRouteFiles = (source) =>
  readdirSync(__dirname(source), { withFileTypes: true })
    .filter((dirent) => !dirent.isDirectory() && dirent.name.includes('route') && !dirent.name.includes('.test.'))
    .map((dirent) => dirent.name);

export const getDirectoryFiles = (source) =>
  readdirSync(__dirname(source), { withFileTypes: true })
    .filter((dirent) => !dirent.isDirectory())
    .map((dirent) => dirent.name);
