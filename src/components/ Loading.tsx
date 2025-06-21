import React from "react";
import BackGround from "./BackGround";

const Loading = ({ backgroundImage }: { backgroundImage: string }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <BackGround backgroundImage={backgroundImage} />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
