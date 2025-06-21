"use client";

import React from "react";

const PixelStyles = () => (
  <style jsx global>{`
    .pixel-border {
      border-style: solid;
      image-rendering: pixelated;
    }
    .pixel-text {
      font-weight: bold;
      text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
    }
  `}</style>
);

export default PixelStyles;
