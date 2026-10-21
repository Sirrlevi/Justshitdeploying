import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const songsDir = path.join(projectRoot, 'public', 'songs');
const manifestPath = path.join(songsDir, 'songs.json');

function titleFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([0-9])/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

const preferredOrder = ['hoor.mp3', 'tu.mp3', 'safar.mp3'];
const files = (await readdir(songsDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.mp3$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => {
    const ai = preferredOrder.indexOf(a.toLowerCase());
    const bi = preferredOrder.indexOf(b.toLowerCase());
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

const manifest = {
  tracks: files.map((filename) => ({ filename, title: titleFromFilename(filename) || 'untitled' }))
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated song manifest with ${files.length} MP3 track(s).`);
