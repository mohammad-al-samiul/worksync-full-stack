"use client";

import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

type WorkSyncLogoProps = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
};

const iconSizes = { sm: 32, md: 36, lg: 44 };
const textSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

function LogoMark({ size, gradId }: { size: number; gradId: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="4"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9d4edd" />
          <stop offset="1" stopColor="#00f2fe" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      <path
        fill="#fff"
        d="M16 8.5 22.5 12v3.5L16 19l-6.5-3.5V12L16 8.5zm0 9 6.5 3.5V24L16 27.5 9.5 24v-3.5L16 17.5z"
      />
    </svg>
  );
}

export function WorkSyncLogo({
  showText = true,
  size = "md",
  href,
  className,
}: WorkSyncLogoProps) {
  const gradId = `ws-logo-${useId().replace(/:/g, "")}`;
  const px = iconSizes[size];

  const content = (
    <>
      <div
        className={cn(
          "shrink-0 rounded-lg shadow-[0_0_12px_rgba(157,78,221,0.35)]",
          size === "lg" && "shadow-[0_0_18px_rgba(157,78,221,0.45)]"
        )}
      >
        <LogoMark size={px} gradId={gradId} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-cyan-accent to-purple-accent bg-clip-text text-transparent whitespace-nowrap",
            textSizes[size]
          )}
        >
          WorkSync
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <div className={cn("flex items-center gap-3 overflow-hidden", className)}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 overflow-hidden transition-opacity hover:opacity-90",
        className
      )}
      aria-label="WorkSync home"
    >
      {content}
    </Link>
  );
}
