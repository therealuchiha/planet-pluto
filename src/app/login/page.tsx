import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Log In · AniTrack",
  description: "Sign in to your AniTrack account to access your personal anime tracking list.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-md rounded-3xl" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
