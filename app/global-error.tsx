"use client";

import NextError from "next/error";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="inline-flex rounded-full border border-red-300/20 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-red-100">
              System Error
            </div>

            <h1 className="mt-4 text-3xl font-black text-white">
              Something went wrong
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/75">
              The application hit an unexpected error. You can try again now or reload the page.
            </p>

            {error?.message ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                {error.message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white"
              >
                Reload App
              </button>
            </div>

            <div className="mt-6">
              <NextError statusCode={0} />
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

