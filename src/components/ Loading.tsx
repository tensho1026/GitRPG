import React from "react";
import BackGround from "./BackGround";

const Loading = ({ backgroundImage }: { backgroundImage: string }) => {
  return (
    <div
      className="guild-shell min-h-screen w-full relative overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="読み込み中">
      <BackGround backgroundImage={backgroundImage} />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="guild-panel p-7 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin border-2 border-amber-300 border-r-transparent" />
          <div className="guild-title text-lg">冒険の記録を開いています...</div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
