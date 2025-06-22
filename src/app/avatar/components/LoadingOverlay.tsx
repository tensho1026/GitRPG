"use client";

interface LoadingOverlayProps {
  isProcessing: boolean;
}

export default function LoadingOverlay({ isProcessing }: LoadingOverlayProps) {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <p className="text-white text-3xl font-bold pixel-text animate-pulse">
        ... PROCESSING ...
      </p>
    </div>
  );
}
