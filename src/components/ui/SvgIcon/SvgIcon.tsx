import type { HTMLAttributes } from "react";

type SvgIconProps = HTMLAttributes<HTMLSpanElement> & {
  svg: string;
};

export function SvgIcon({ svg, ...props }: SvgIconProps) {
  return (
    <span
      aria-hidden="true"
      data-svg-icon=""
      dangerouslySetInnerHTML={{
        __html: svg.replaceAll('stroke="#0321ED"', 'stroke="currentColor"'),
      }}
      {...props}
    />
  );
}
