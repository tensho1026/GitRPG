"use client";

interface DataStateProps {
  title: string;
  message: string;
  onRetry: () => void | Promise<void>;
  retryLabel?: string;
}

export function DataState({
  title,
  message,
  onRetry,
  retryLabel = "再試行",
}: DataStateProps) {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-6"
      role="alert"
      aria-live="assertive">
      <div className="w-full max-w-lg border-4 border-amber-400 bg-slate-800 p-6 text-center text-white shadow-xl">
        <h1 className="mb-3 text-2xl font-bold pixel-text">{title}</h1>
        <p className="mb-6 text-slate-200 pixel-text">{message}</p>
        <button
          type="button"
          onClick={() => void onRetry()}
          className="min-h-12 border-4 border-emerald-400 bg-emerald-700 px-8 py-3 font-bold text-white hover:bg-emerald-600 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          autoFocus>
          {retryLabel}
        </button>
      </div>
    </main>
  );
}

interface InlineErrorProps {
  message: string;
  onRetry?: () => void | Promise<void>;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div
      className="mb-4 border-2 border-red-300 bg-red-950/80 p-3 text-red-100"
      role="alert"
      aria-live="assertive">
      <p className="pixel-text">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-3 min-h-11 border-2 border-red-200 px-4 py-2 font-bold underline hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300">
          再試行
        </button>
      )}
    </div>
  );
}
