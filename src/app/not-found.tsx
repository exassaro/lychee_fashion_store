import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LeafMotif } from "@/components/brand/leaf-motif";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <LeafMotif className="absolute -left-12 -top-10 w-48 opacity-60 sm:w-64" />
      <LeafMotif flip className="absolute -bottom-12 -right-10 w-44 rotate-180 opacity-50 sm:w-60" />

      <Logo className="mb-10 h-12" />
      <p className="font-slab text-[7rem] font-bold leading-none text-brand sm:text-[9rem]">404</p>
      <h1 className="mt-2 text-2xl sm:text-3xl">Oops! This page has gone out of stock</h1>
      <p className="mt-3 max-w-md text-ink/70">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to the good stuff.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft /> Back to home
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/shop">
            <Search /> Browse products
          </Link>
        </Button>
      </div>
    </main>
  );
}
