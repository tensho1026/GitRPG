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
      className="guild-shell min-h-screen w-full flex items-center justify-center p-6"
      role="alert"
      aria-live="assertive">
      <div className="guild-panel w-full max-w-lg p-6 text-center">
        <h1 className="guild-title mb-3 text-2xl">{title}</h1>
        <p className="mb-6 text-slate-200 pixel-text">{message}</p>
        <button
          type="button"
          aria-label={retryLabel}
          onClick={() => void onRetry()}
          className="guild-button min-h-12 px-8 py-3 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
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
      className="guild-panel mb-4 !border-red-700 p-3 text-red-100"
      role="alert"
      aria-live="assertive">
      <p className="pixel-text">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={() => void onRetry()}
          className="guild-button guild-button--danger mt-3 min-h-11 px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300">
          再試行
        </button>
      )}
    </div>
  );
}
