import { cn } from "@/lib/utils";

/** Soft decorative leaves echoing the logo artwork. Purely decorative. */
export function LeafMotif({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden="true"
      className={cn("pointer-events-none select-none", flip && "-scale-x-100", className)}
    >
      <path
        d="M30 210C20 130 70 50 190 30c10 90-40 170-160 180z"
        fill="#5CC91A"
        opacity="0.9"
      />
      <path d="M30 210C80 150 130 95 190 30" stroke="#3E9A0E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      <path
        d="M40 230c-30-50-20-110 30-150 30 50 20 110-30 150z"
        fill="#7DDB42"
        opacity="0.75"
      />
    </svg>
  );
}
