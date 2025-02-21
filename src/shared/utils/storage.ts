import localforage from "localforage";
import { TAny } from "../types/common";

interface InMemoryStorage {
  data: Map<string, TAny>;
  getItem(key: string): Promise<TAny>;
  setItem(key: string, value: TAny): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

const inMemoryStorage: InMemoryStorage = {
  data: new Map(),
  async getItem(key: string): Promise<TAny> {
    return this.data.get(key);
  },
  async setItem(key: string, value: TAny): Promise<void> {
    this.data.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  },
  async clear(): Promise<void> {
    this.data.clear();
  },
};

let storage: typeof localforage | InMemoryStorage = localforage;

if (
  !localforage.supports(localforage.INDEXEDDB) &&
  !localforage.supports(localforage.WEBSQL) &&
  !localforage.supports(localforage.LOCALSTORAGE)
) {
  storage = inMemoryStorage;
}

declare global {
  interface Window {
    storage: typeof storage;
  }
}
window.storage = storage;

export { storage };
