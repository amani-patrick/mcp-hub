import { MemoryStorage } from './memory.js';

/** Single shared storage instance for all monitor/analytics/dashboard paths. */
export const sharedStorage = new MemoryStorage();
