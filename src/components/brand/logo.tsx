import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logo.png";
import { cn } from "@/lib/utils";

/** Static import → intrinsic size is read at build time, so any logo aspect ratio works. */
export function Logo({ className, priority, href = "/" }: { className?: string; priority?: boolean; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex shrink-0 items-center", className)} aria-label="LYCHEE home">
      <Image src={logo} alt="LYCHEE" priority={priority} className="h-full w-auto" sizes="200px" />
    </Link>
  );
}
