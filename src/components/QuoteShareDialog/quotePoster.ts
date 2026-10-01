import wordmarkSvg from "../../brand/wordmark.svg?raw";
import type { Quote } from "../../store/collectionStore";

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
export type PosterMargin = "small" | "medium" | "large";
export type PosterOptions = {
  format: PosterFormat;
  fontSize: number;
  dark: boolean;
  logo: boolean;
  alignment: PosterAlignment;
  margin: PosterMargin;
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

  const quoteSize = options.fontSize * 3.25 * unit;
  context.font = `500 ${quoteSize}px ${fontFamily}`;
  const quoteMarkWidth = context.measureText("„").width;
  const selectedPadding = { small: 52, medium: 76, large: 108 }[options.margin] * unit;
  const padding = Math.max(selectedPadding, quoteMarkWidth + 24 * unit);
  const contentWidth = width - 2 * padding;
  const sourceSize = quoteSize * 0.95;
  const quoteLeading = quoteSize * 1.12;
  const sourceLeading = sourceSize * 1.12;
  const sourceGap = quote.source.trim() ? quoteSize * 0.36 : 0;
  const quoteText = quote.text.trim();

  const quoteLines = wrapPosterText(context, `${quoteText}“`, contentWidth);
  context.font = `500 ${sourceSize}px ${fontFamily}`;
  const sourceLines = quote.source.trim()
    ? wrapPosterText(context, quote.source.trim(), contentWidth)
    : [];
  const textHeight = quoteLines.length * quoteLeading
    + (sourceLines.length ? sourceGap + sourceLines.length * sourceLeading : 0);
  const vertical = options.alignment.startsWith("top") ? "top"
    : options.alignment.startsWith("middle") ? "middle" : "bottom";
  const bottomLogoSpace = logo && vertical === "bottom" ? 110 * unit : 0;
  const availableHeight = height - 2 * padding - bottomLogoSpace;
  if (textHeight > availableHeight) {
    throw new Error("quote-too-long");
  }

  const horizontal = options.alignment.endsWith("Left") ? "left"
    : options.alignment.endsWith("Right") ? "right" : "center";
  let y = padding + (vertical === "top" ? 0
    : vertical === "middle" ? (availableHeight - textHeight) / 2
      : availableHeight - textHeight);
  const lineX = (line: string) => horizontal === "left" ? padding
    : horizontal === "right" ? width - padding - context.measureText(line).width
      : (width - context.measureText(line).width) / 2;
  context.textBaseline = "top";
  context.font = `500 ${quoteSize}px ${fontFamily}`;
  const accent = options.dark ? "#4c6dff" : "#0321ed";
  quoteLines.forEach((line, index) => {
    const last = index === quoteLines.length - 1;
    const body = last ? line.slice(0, -1) : line;
    const x = lineX(line);
    if (index === 0) {
      context.fillStyle = accent;
      context.fillText("„", x - quoteMarkWidth, y);
    }
    context.fillStyle = options.dark ? "#f7f6f2" : "#090909";
    context.fillText(body, x, y);
    if (last) {
      context.fillStyle = accent;
      context.fillText("“", x + context.measureText(body).width, y);
    }
    y += quoteLeading;
  });
  if (sourceLines.length) {
    y += sourceGap;
    context.font = `500 ${sourceSize}px ${fontFamily}`;
    context.fillStyle = options.dark ? "#9d9c98" : "#8d8d90";
    for (const line of sourceLines) {
      context.fillText(line, lineX(line), y);
      y += sourceLeading;
    }
  }

  if (logo) {
    const logoHeight = 52 * unit;
    const logoWidth = logoHeight * logo.naturalWidth / logo.naturalHeight;
    const logoX = (width - logoWidth) / 2;
    context.drawImage(logo, logoX, height - padding - logoHeight, logoWidth, logoHeight);
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
