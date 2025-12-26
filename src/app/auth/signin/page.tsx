"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function SignInPage() {
  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-purple-500/20 bg-black/30 p-8 backdrop-blur">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Sign In</h1>
          <p className="mb-6 text-center text-gray-400">
            Sign in with your Google account to continue
          </p>
          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full mystical-glow bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            Sign in with Google
          </Button>
        </div>
      </main>
    </div>
  );
}

