"use client";

import { signIn } from "next-auth/react";
import { Navbar } from "@/components/navbar";

export default function SignInPage() {
  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-purple-500/30 bg-black/40 p-8 backdrop-blur-md shadow-lg">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Sign In</h1>
          <p className="mb-6 text-center text-gray-300">
            Sign in with your Google account to continue
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full mystical-glow bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors font-medium"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    </div>
  );
}

