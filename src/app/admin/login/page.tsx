import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="h-12" />
          <h1 className="mt-5 text-2xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink/60">Manage products, stock and store settings.</p>
        </div>
        <LoginForm next={next} initialError={error === "not_admin" ? "This account doesn't have admin access." : undefined} />
      </div>
    </main>
  );
}
