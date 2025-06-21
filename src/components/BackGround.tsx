import React from "react";

function BackGround({ backgroundImage }: { backgroundImage: string }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        zIndex: -1,
      }}
    />
  );
}

export default BackGround;
