import React from "react";

function BackGround({ backgroundImage }: { backgroundImage: string }) {
  return (
    <div
      aria-hidden="true"
      className="guild-backdrop fixed inset-0 -z-10 bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage.startsWith("/") ? backgroundImage : `/${backgroundImage}`})`,
      }}
    />
  );
}

export default BackGround;
