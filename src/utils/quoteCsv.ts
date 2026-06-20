import type { Quote } from "../store/collectionStore";

export type ImportedQuote = {
  text: string;
  source: string;
  createdAt?: string;
};

const csvHeaders = ["text", "source"] as const;
const delimiterCandidates = [",", ";", "\t"] as const;
const textHeaders = ["text", "quote", "quotetext", "zitat"] as const;
const sourceHeaders = ["source", "quelle", "author", "person"] as const;
const createdAtHeaders = ["createdat", "created", "date"] as const;

export function serializeQuotesCsv(quotes: Quote[]) {
  const rows = [
    csvHeaders,
    ...quotes.map((quote) => [quote.text, quote.source]),
  ];

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function parseQuotesCsv(content: string): ImportedQuote[] {
  const delimiter = detectDelimiter(content);
  const rows = parseCsvRows(content, delimiter).filter((row) =>
    row.some((value) => value.trim().length > 0),
  );

  if (rows.length === 0) {
    return [];
  }

  const firstRow = rows[0].map((value) => normalizeHeader(value));
  const headerTextIndex = findHeaderIndex(firstRow, textHeaders);
  const hasHeader = headerTextIndex >= 0;
  const textIndex = hasHeader ? headerTextIndex : 0;
  const sourceIndex = hasHeader ? findHeaderIndex(firstRow, sourceHeaders) : 1;
  const createdAtIndex = hasHeader
    ? findHeaderIndex(firstRow, createdAtHeaders)
    : 2;
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows
    .map((row) => {
      const text = row[textIndex]?.trim() ?? "";
      const source = row[sourceIndex]?.trim() ?? "";
      const createdAt = row[createdAtIndex]?.trim();

      if (!text) {
        return null;
      }

      return {
        text,
        source,
        ...(createdAt && isValidDate(createdAt) ? { createdAt } : {}),
      };
    })
    .filter((quote): quote is ImportedQuote => quote !== null);
}

function parseCsvRows(content: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === delimiter && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";

      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      continue;
    }

    value += character;
  }

  row.push(value);
  rows.push(row);

  return rows;
}

function detectDelimiter(content: string) {
  let inQuotes = false;
  const counts = new Map<string, number>(
    delimiterCandidates.map((delimiter) => [delimiter, 0]),
  );

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      break;
    }

    if (!inQuotes && counts.has(character)) {
      counts.set(character, (counts.get(character) ?? 0) + 1);
    }
  }

  return delimiterCandidates.reduce((bestDelimiter, delimiter) => {
    const bestCount = counts.get(bestDelimiter) ?? 0;
    const delimiterCount = counts.get(delimiter) ?? 0;

    return delimiterCount > bestCount ? delimiter : bestDelimiter;
  }, ",");
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replaceAll(/[\s_-]/g, "");
}

function findHeaderIndex(
  headers: string[],
  acceptedHeaders: readonly string[],
) {
  return headers.findIndex((header) => acceptedHeaders.includes(header));
}

function isValidDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}
