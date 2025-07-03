"use client";

export default function BattleStyles() {
  return (
    <style jsx global>{`
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .pixel-border {
        border-style: solid;
        image-rendering: pixelated;
      }
      .pixel-text {
        font-family: "Courier New", monospace;
        font-weight: bold;
        text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
      }
      .battle-background {
        background: linear-gradient(
          45deg,
          #ea580c 0%,
          #f97316 25%,
          #fb923c 50%,
          #fdba74 75%,
          #fed7aa 100%
        );
        background-size: 400% 400%;
        animation: gradientShift 8s ease infinite;
      }
    `}</style>
  );
}
