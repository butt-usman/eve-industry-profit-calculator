import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');

export interface LocalCacheStore {
  timestamp: number;
  prices: Record<number, { buy: number; sell: number; average?: number }>;
  volumes: Record<string, number>;
}

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function loadPersistentCache(hubId: string): LocalCacheStore {
  ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `market_${hubId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Failed to load persistent cache for hub ${hubId}:`, err);
  }
  return { timestamp: 0, prices: {}, volumes: {} };
}

export function savePersistentCache(hubId: string, store: LocalCacheStore) {
  ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `market_${hubId}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Failed to save persistent cache for hub ${hubId}:`, err);
  }
}
