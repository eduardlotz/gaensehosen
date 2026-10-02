type Block = { x: number; y: number; width: number; height: number };

/** Shared alignment anchors the complete quote/source stack. */
export function resolveSharedPositions(
  text: { height: number; bottom: number },
  source: { height: number; bottom: number },
  top: number,
  center: number,
  gap: number,
  alignment: string,
) {
  const bottom = Math.min(text.bottom, source.bottom);
  const height = text.height + gap + source.height;
  if (height > bottom - top) throw new Error("quote-too-long");
  const textY = alignment.startsWith("top") ? top
    : alignment.startsWith("bottom") ? bottom - height
      : Math.max(top, Math.min(center - height / 2, bottom - height));
  return { textY, sourceY: textY + text.height + gap };
}

/** Preserve both anchors unless their measured blocks overlap. Text has priority. */
export function resolveSourcePosition(
  text: Block,
  source: Block & { bottom: number },
  top: number,
  gap: number,
) {
  const horizontallySeparate = source.x >= text.x + text.width
    || source.x + source.width <= text.x;
  const verticallySeparate = source.y >= text.y + text.height + gap
    || source.y + source.height + gap <= text.y;
  if (horizontallySeparate || verticallySeparate) return source.y;

  const below = text.y + text.height + gap;
  if (below + source.height <= source.bottom) return below;
  const above = text.y - gap - source.height;
  if (above >= top) return above;
  throw new Error("quote-too-long");
}
