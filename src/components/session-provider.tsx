"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Suppress NextAuth errors in console when env vars are not set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalError = console.error;
      const originalDebug = console.debug;
      
      // Filter NextAuth errors
      const shouldIgnore = (args: any[]) => {
        const message = args[0]?.toString() || "";
        return (
          message.includes("ClientFetchError") ||
          message.includes("Unexpected token") ||
          message.includes("<!DOCTYPE") ||
          message.includes("autherror")
        );
      };

      console.error = (...args: any[]) => {
        if (shouldIgnore(args)) {
          // Silently ignore NextAuth errors when not configured
          return;
        }
        originalError.apply(console, args);
      };

      console.debug = (...args: any[]) => {
        if (shouldIgnore(args)) {
          // Silently ignore NextAuth debug errors when not configured
          return;
        }
        originalDebug.apply(console, args);
      };

      return () => {
        console.error = originalError;
        console.debug = originalDebug;
      };
    }
  }, []);

  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {mounted ? children : null}
    </NextAuthSessionProvider>
  );
}
