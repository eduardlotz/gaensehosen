import wordmarkSvg from "../../brand/wordmark.svg?raw";
import type { Quote } from "../../store/collectionStore";
import { resolveSharedPositions, resolveSourcePosition } from "./posterLayout";

export const posterFormats = {
  a2: { width: 3307, height: 4677 },
  a3: { width: 2339, height: 3307 },
  a4: { width: 1654, height: 2339 },
  ratio4x5: { width: 1080, height: 1350 },
  ratio1x1: { width: 1080, height: 1080 },
  ratio16x9: { width: 1920, height: 1080 },
  ratio9x16: { width: 1080, height: 1920 },
} as const;

export type PosterFormat = keyof typeof posterFormats;
export type PosterAlignment =
  | "topLeft" | "topCenter" | "topRight"
  | "middleLeft" | "middleCenter" | "middleRight"
  | "bottomLeft" | "bottomCenter" | "bottomRight";
export type PosterOptions = {
  format: PosterFormat;
  fontSize: number;
  dark: boolean;
  logo: boolean;
  textAlignment: PosterAlignment;
  sourceAlignment: PosterAlignment;
  sharedAlignment: boolean;
  margin: number;
  decoratedCorners: boolean;
};

export function posterDimensions(format: PosterFormat) {
  return posterFormats[format];
}

export function posterFilename(source: string) {
  const name = source.trim().normalize("NFKD")
    .replace(/ß/g, "ss")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/g, "") || "quote";
  return `${name}-gaensehosen.png`;
}

const logoImages = new Map<string, Promise<HTMLImageElement>>();

function getLogo(dark: boolean) {
  const key = dark ? "dark" : "light";
  let image = logoImages.get(key);
  if (!image) {
    const svg = wordmarkSvg
      .replaceAll("currentColor", dark ? "#4c6dff" : "#0321ed")
      .replaceAll("var(--color-text, #090909)", dark ? "#f7f6f2" : "#090909");
    image = new Promise<HTMLImageElement>((resolve, reject) => {
      const logo = new Image();
      logo.onload = () => resolve(logo);
      logo.onerror = () => reject(new Error("logo-load"));
      logo.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
    logoImages.set(key, image);
  }
  return image;
}

export function wrapPosterText(
  context: Pick<CanvasRenderingContext2D, "measureText">,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    let line = "";
    for (const word of paragraph.split(/[^\S\n]+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      for (const character of Array.from(word)) {
        if (line && context.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderQuotePoster(
  canvas: HTMLCanvasElement,
  quote: Pick<Quote, "text" | "source">,
  options: PosterOptions,
  outputWidth: number = posterDimensions(options.format).width,
) {
  const fontFamily = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim();
  const fontFaces = await document.fonts.load(
    `500 52px ${fontFamily}`,
    `${quote.text}${quote.source}„“`,
  );
  if (fontFaces.length === 0) throw new Error("font-unavailable");
  const logo = options.logo ? await getLogo(options.dark) : null;
  const dimensions = posterDimensions(options.format);
  const { width, height } = dimensions;
  const unit = Math.min(width, height) / 1080;
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth * dimensions.height / dimensions.width);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas-unavailable");
  context.scale(outputWidth / width, outputWidth / width);
  context.fillStyle = options.dark ? "#10100f" : "#ffffff";
  context.fillRect(0, 0, width, height);

  const accent = options.dark ? "#4c6dff" : "#0321ed";
  const edgeMargin = Math.min(width, height) * options.margin / 100;
  const cornerSize = 26 * unit;
  // The slider controls the outer inset and the gap inside the corner squares.
  const edgePadding = options.decoratedCorners ? edgeMargin * 2 + cornerSize : edgeMargin;
  const quoteSize = options.fontSize * 3.25 * unit;
  const sourceSize = quoteSize * 0.95;
  const quoteLeading = quoteSize * 1.12;
  const sourceLeading = sourceSize * 1.12;
  const sourceGap = quoteSize * 0.36;
  context.textBaseline = "top";
  context.font = `500 ${quoteSize}px ${fontFamily}`;
  const quoteMarkWidth = context.measureText("„").width;
  const closingMarkWidth = context.measureText("“").width;
  // Quote body and source share anchors; both quotation marks hang outside them.
  const padding = edgePadding + Math.max(quoteMarkWidth, closingMarkWidth);
  const contentWidth = width - 2 * padding;
  if (contentWidth <= 0) throw new Error("quote-too-long");
  const quoteLines = wrapPosterText(context, quote.text.trim(), contentWidth);
  context.font = `500 ${sourceSize}px ${fontFamily}`;
  const sourceLines = quote.source.trim()
    ? wrapPosterText(context, quote.source.trim(), contentWidth)
    : [];

  const logoHeight = 52 * unit;
  const logoWidth = logo ? logoHeight * logo.naturalWidth / logo.naturalHeight : 0;
  const logoBounds = logo ? {
    x: (width - logoWidth) / 2,
    y: height - 76 * unit - logoHeight,
    width: logoWidth,
    height: logoHeight,
  } : null;

  const makeBlock = (lines: string[], alignment: PosterAlignment, fontSize: number,
    leading: number, openingMark: number) => {
    context.font = `500 ${fontSize}px ${fontFamily}`;
    const metrics = lines.map((line) => context.measureText(line));
    const lineWidths = metrics.map((metric) => metric.width);
    const markMetrics = openingMark ? context.measureText("„") : null;
    const closingMetrics = openingMark ? context.measureText("“") : null;
    const topInset = Math.max(0, ...metrics.map((metric) => metric.actualBoundingBoxAscent),
      markMetrics?.actualBoundingBoxAscent ?? 0, closingMetrics?.actualBoundingBoxAscent ?? 0);
    const horizontal = alignment.endsWith("Left") ? "left"
      : alignment.endsWith("Right") ? "right" : "center";
    const linePositions = lineWidths.map((lineWidth) => horizontal === "left"
      ? padding
      : horizontal === "right" ? width - padding - lineWidth
        : (width - lineWidth) / 2);
    // Font bearings can extend beyond the advance width, even at a zero margin.
    linePositions.forEach((x, index) => {
      const leftBearing = Math.max(metrics[index].actualBoundingBoxLeft,
        index === 0 && markMetrics ? openingMark + markMetrics.actualBoundingBoxLeft : 0);
      const rightBearing = Math.max(metrics[index].actualBoundingBoxRight,
        index === lines.length - 1 && closingMetrics
          ? lineWidths[index] + closingMetrics.actualBoundingBoxRight : 0);
      linePositions[index] = Math.max(edgePadding + leftBearing,
        Math.min(x, width - edgePadding - rightBearing));
    });
    const left = Math.min(...linePositions.map((x, i) => x - (i === 0 ? openingMark : 0)));
    const right = Math.max(...linePositions.map((x, i) => x + lineWidths[i]
      + (i === lines.length - 1 && openingMark ? closingMarkWidth : 0)));
    const blockHeight = lines.length * leading + topInset;
    const bottom = logoBounds && left < logoBounds.x + logoBounds.width
      && right > logoBounds.x ? Math.min(height - edgePadding, logoBounds.y - sourceGap) : height - edgePadding;
    const availableHeight = bottom - edgePadding;
    if (blockHeight > availableHeight) {
      throw new Error("quote-too-long");
    }
    const y = alignment.startsWith("top") ? edgePadding
      : alignment.startsWith("bottom") ? bottom - blockHeight
        : Math.max(edgePadding, Math.min((height - blockHeight) / 2, bottom - blockHeight));
    return { x: left, y, width: right - left, height: blockHeight, bottom, linePositions, topInset };
  };
  const textBlock = makeBlock(quoteLines, options.textAlignment, quoteSize, quoteLeading, quoteMarkWidth);
  const sourceBlock = sourceLines.length
    ? makeBlock(sourceLines, options.sourceAlignment, sourceSize, sourceLeading, 0)
    : null;
  if (sourceBlock) {
    if (options.sharedAlignment) {
      const positions = resolveSharedPositions(
        textBlock, sourceBlock, edgePadding, height / 2, sourceGap, options.textAlignment,
      );
      textBlock.y = positions.textY;
      sourceBlock.y = positions.sourceY;
    } else {
      sourceBlock.y = resolveSourcePosition(textBlock, sourceBlock, edgePadding, sourceGap);
    }
  }

  context.font = `500 ${quoteSize}px ${fontFamily}`;
  quoteLines.forEach((line, index) => {
    const last = index === quoteLines.length - 1;
    const x = textBlock.linePositions[index];
    const y = textBlock.y + textBlock.topInset + index * quoteLeading;
    if (index === 0) {
      context.fillStyle = accent;
      context.fillText("„", x - quoteMarkWidth, y);
    }
    context.fillStyle = options.dark ? "#f7f6f2" : "#090909";
    context.fillText(line, x, y);
    if (last) {
      context.fillStyle = accent;
      context.fillText("“", x + context.measureText(line).width, y);
    }
  });
  if (sourceBlock) {
    context.font = `500 ${sourceSize}px ${fontFamily}`;
    context.fillStyle = options.dark ? "#9d9c98" : "#8d8d90";
    sourceLines.forEach((line, index) => {
      context.fillText(line, sourceBlock.linePositions[index], sourceBlock.y + sourceBlock.topInset + index * sourceLeading);
    });
  }
  if (logo && logoBounds) {
    context.drawImage(logo, logoBounds.x, logoBounds.y, logoBounds.width, logoBounds.height);
  }
  if (options.decoratedCorners) {
    context.fillStyle = accent;
    for (const x of [edgeMargin, width - edgeMargin - cornerSize]) {
      for (const y of [edgeMargin, height - edgeMargin - cornerSize]) {
        context.fillRect(x, y, cornerSize, cornerSize);
      }
    }
  }
}

export async function downloadPoster(canvas: HTMLCanvasElement, filename: string) {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("png-export")),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
