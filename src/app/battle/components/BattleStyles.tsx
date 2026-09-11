"use client";

export default function BattleStyles() {
  return (
    <style jsx global>{`
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
        background:
          radial-gradient(circle at 15% 18%, rgba(155, 70, 35, .26), transparent 22rem),
          radial-gradient(circle at 86% 30%, rgba(45, 96, 71, .2), transparent 24rem),
          repeating-linear-gradient(90deg, rgba(255,255,255,.018) 0 1px, transparent 1px 42px),
          #101513;
      }
    `}</style>
  );
}
