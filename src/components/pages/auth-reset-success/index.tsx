"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetSuccessPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-1">Reset Password Success</h1>
      <p className="text-muted-foreground mb-6">
        Please signing in using your new password
      </p>

      <Button
        type="button"
        className="w-full"
        onClick={() => router.push("/auth/login")}
      >
        Continue
      </Button>
    </div>
  );
}
