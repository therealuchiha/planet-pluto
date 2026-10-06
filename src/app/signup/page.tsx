import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign Up · AniTrack",
  description: "Create a free AniTrack account to begin tracking anime episodes and ratings.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-md rounded-3xl" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
