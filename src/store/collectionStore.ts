import { create } from 'zustand'
import type { StateStorage } from 'zustand/middleware'
import { createJSONStorage, persist } from 'zustand/middleware'
import { indexedDbStorage } from './idbStorage'
import type { ImportedQuote } from '../utils/quoteCsv'

export type Locale = 'de' | 'en'
export type ThemeName = 'light' | 'dark'
export type GridMode = 'masonry' | 'grid' | 'list' | 'focus'
export type FontSize = 16 | 24 | 32 | 40

export type Quote = {
  id: string
  text: string
  source: string
  createdAt: string
}

type NewQuote = {
  text: string
  source: string
}

type CollectionState = {
  quotes: Quote[]
  locale: Locale
  theme: ThemeName
  fontSize: FontSize
  gridMode: GridMode
  addQuote: (quote: NewQuote) => void
  importQuotes: (quotes: ImportedQuote[]) => void
  updateQuote: (id: string, quote: NewQuote) => void
  removeQuote: (id: string) => void
  resetApp: () => void
  setLocale: (locale: Locale) => void
  setTheme: (theme: ThemeName) => void
  setFontSize: (fontSize: FontSize) => void
  setGridMode: (gridMode: GridMode) => void
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeQuoteText(text: string) {
  return text.replace(/\r\n?/g, '\n').trim()
}

const collectionStorage: StateStorage = {
  getItem: async (name) => {
    const value = await indexedDbStorage.getItem(name)

    if (value) {
      return value
    }

    return indexedDbStorage.getItem('gaensehosen-archive')
  },
  setItem: indexedDbStorage.setItem,
  removeItem: indexedDbStorage.removeItem,
}

const defaultCollectionState = {
  quotes: [],
  locale: 'de',
  theme: 'light',
  fontSize: 16,
  gridMode: 'masonry',
} satisfies Pick<
  CollectionState,
  'quotes' | 'locale' | 'theme' | 'fontSize' | 'gridMode'
>

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      ...defaultCollectionState,
      addQuote: (quote) => {
        set((state) => ({
          quotes: [
            {
              id: createId(),
              text: normalizeQuoteText(quote.text),
              source: quote.source.trim(),
              createdAt: new Date().toISOString(),
            },
            ...state.quotes,
          ],
        }))
      },
      importQuotes: (quotes) => {
        set((state) => ({
          quotes: [
            ...quotes.map((quote) => ({
              id: createId(),
              text: normalizeQuoteText(quote.text),
              source: quote.source.trim(),
              createdAt: quote.createdAt ?? new Date().toISOString(),
            })),
            ...state.quotes,
          ],
        }))
      },
      updateQuote: (id, quote) => {
        set((state) => ({
          quotes: state.quotes.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  text: normalizeQuoteText(quote.text),
                  source: quote.source.trim(),
                }
              : entry,
          ),
        }))
      },
      removeQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.filter((quote) => quote.id !== id),
        }))
      },
      resetApp: () => set(defaultCollectionState),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setGridMode: (gridMode) => set({ gridMode }),
    }),
    {
      name: 'gaensehosen-collection',
      storage: createJSONStorage(() => collectionStorage),
      version: 1,
    },
  ),
)
