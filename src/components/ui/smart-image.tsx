"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Image with graceful fallback — never shows a broken asset. */
export function SmartImage({
  src,
  alt,
  className,
  seed,
  rounded,
}: {
  src: string;
  alt: string;
  className?: string;
  seed?: string;
  rounded?: boolean;
}) {
  const [err, setErr] = useState(false);
  const hue = ((seed ?? alt).split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 90 + 70;
  if (err || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("flex items-center justify-center", rounded && "rounded-xl", className)}
        style={{ background: `linear-gradient(140deg, hsl(${hue} 28% 92%), hsl(${hue} 30% 84%))` }}
      >
        <span className="select-none text-sm font-bold text-black/35">{(alt || "·").slice(0, 1).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setErr(true)}
      className={cn("object-cover", rounded && "rounded-xl", className)}
    />
  );
}
