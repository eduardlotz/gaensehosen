import type { StateStorage } from 'zustand/middleware'

const databaseName = 'gaensehosen-storage'
const storeName = 'key-value'
const version = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, version)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName)
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null)
  }

  return openDatabase().then(
    (database) =>
      new Promise<T | null>((resolve, reject) => {
        const transaction = database.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const request = callback(store)
        let value: T | null = null

        if (request) {
          request.onsuccess = () => {
            value = request.result ?? null
          }
          request.onerror = () => reject(request.error)
        }

        transaction.oncomplete = () => {
          database.close()
          resolve(value)
        }
        transaction.onerror = () => {
          database.close()
          reject(transaction.error)
        }
      }),
  )
}

export const indexedDbStorage: StateStorage = {
  getItem: async (name) => {
    return withStore<string>('readonly', (store) => store.get(name))
  },
  setItem: async (name, value) => {
    await withStore('readwrite', (store) => store.put(value, name))
  },
  removeItem: async (name) => {
    await withStore('readwrite', (store) => store.delete(name))
  },
}
