import type {
  CSSProperties,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { useId, useRef, useState } from "react";
import { classNames } from "../classNames";
import styles from "./ScribbleInput.module.css";

type ScribbleInputProps = InputHTMLAttributes<HTMLInputElement> & {
  clearLabel?: string;
  endContent?: ReactNode;
  inputClassName?: string;
  leadingIcon?: ReactNode;
  onClear?: () => void;
  wrapperClassName?: string;
};

export function ScribbleInput({
  className,
  clearLabel = "Clear input",
  endContent,
  inputClassName,
  leadingIcon,
  onBlur,
  onClear,
  onFocus,
  wrapperClassName,
  ...props
}: ScribbleInputProps) {
  const filterId = useId().replaceAll(":", "");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onBlur?.(event);
  }

  return (
    <label
      className={classNames(styles.wrapper, wrapperClassName)}
      data-focused={focused}
      style={{ "--scribble-filter": `url(#${filterId})` } as CSSProperties}
    >
      <svg aria-hidden="true" className={styles.filterSource}>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="objectBoundingBox"
          height="180%"
          id={filterId}
          width="180%"
          x="-40%"
          y="-40%"
        >
          <feTurbulence
            baseFrequency={focused ? "0.058 0.036" : "0.03 0.024"}
            numOctaves="1"
            result="noise"
            seed={focused ? "17" : "9"}
            type="fractalNoise"
          >
            {focused ? (
              <>
                <animate
                  attributeName="baseFrequency"
                  calcMode="discrete"
                  dur="720ms"
                  repeatCount="indefinite"
                  values="0.058 0.036;0.064 0.031;0.05 0.043;0.061 0.038;0.054 0.041"
                />
                <animate
                  attributeName="seed"
                  calcMode="discrete"
                  dur="720ms"
                  repeatCount="indefinite"
                  values="17;23;31;37;43"
                />
              </>
            ) : null}
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            result="warpedStroke"
            scale={focused ? "4.2" : "1.1"}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur
            in="warpedStroke"
            stdDeviation={focused ? "0.14" : "0.08"}
          />
        </filter>
      </svg>

      <span aria-hidden="true" className={styles.borderShadow}>
        <svg className={styles.borderSvg} focusable="false">
          <rect
            className={styles.borderRect}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>

      <span className={styles.content}>
        {leadingIcon ? (
          <span aria-hidden="true" className={styles.leadingIcon}>
            {leadingIcon}
          </span>
        ) : null}

        <input
          className={classNames(styles.input, inputClassName, className)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          ref={inputRef}
          {...props}
        />

        {endContent ? (
          <span className={styles.endContent}>{endContent}</span>
        ) : null}

        {onClear ? (
          <button
            aria-label={clearLabel}
            className={styles.clearButton}
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            X
          </button>
        ) : null}
      </span>
    </label>
  );
}
