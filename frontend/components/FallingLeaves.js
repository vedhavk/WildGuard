"use client";

import { useEffect, useState } from "react";

const leafStyles = `
.leaves-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.leaf {
  position: absolute;
  top: -10%;
  width: 40px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.8;
  transform-style: preserve-3d;
  animation: fall linear infinite;
  filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.3));
}

@keyframes fall {
  0% {
    top: -10%;
    transform: translateX(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  50% {
    transform: translateX(100px) rotateX(180deg) rotateY(360deg) rotateZ(90deg);
  }
  100% {
    top: 110%;
    transform: translateX(0px) rotateX(360deg) rotateY(720deg) rotateZ(180deg);
  }
}
`;

export default function FallingLeaves() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    // Generate leaves on client side to avoid hydration mismatch
    const newLeaves = Array.from({ length: 20 }).map((_, i) => {
      const colors = ['%232ecc71', '%2327ae60', '%23f1c40f'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="${color}" d="M498.8 62.4c-8.9-20.9-25.1-38.3-46.4-49.8-21.2-11.5-44.4-15.6-67.4-12.2-46.5 6.9-90.8 30.6-125.1 66.2-34.3 35.6-59 80.9-68.5 128.8-1.5 7.6-1.5 15.4 0 23 .5 2.5 1.4 4.8 2.5 7.1-13.8 19.3-25.9 39.8-36 61.4-11.5 24.6-20.5 50-26.6 75.8-2.6 11.2-4.5 22.5-5.6 34-1 11.4-1.2 22.9-.6 34.3.8 15.2 3.6 30 8.1 44.1 4.5 14.1 10.7 27.6 18.2 40.1 8.8 14.7 20 28.1 33 39.4 13.1 11.3 27.8 20.3 43.6 26.6 15.8 6.3 32.5 9.7 49.3 10.2 16.9.5 33.7-1.7 50-6.4 16.3-4.7 31.9-12.1 46.1-21.7 14.3-9.6 27.1-21.5 38-35.1 11.8-14.8 21.6-31.5 29-49.5 7.4-18 12.3-37 14.5-56.5 1.4-12.5 1.5-25.1.4-37.7-1.1-12.5-3.3-24.9-6.3-37-3.4-13.7-8-26.9-13.7-39.6-6.1-13.4-13.2-26.1-21.3-38 1.6-1.5 3-3.1 4.3-4.9 6.2-8.3 9.4-18.7 9.4-29.3 0-14.7-6-29-16.7-39.3-23.7-22.9-57.5-38.3-94-44.5 31.6-17.6 68.6-26.6 106.3-25.9 37.7.7 74.4 11.2 105.8 30.1 14.6 8.8 27.9 19.6 39.5 32.1 11.6 12.5 21.2 26.8 28.5 42.4 3.7 7.8 8.8 14.9 15.1 20.6 6.3 5.7 13.8 9.9 22 12.1 8.2 2.2 16.9 2.5 25.3.7 8.3-1.8 16.1-5.6 22.8-11.1 9.4-7.7 16.3-18.2 19.9-29.9 3.6-11.7 4.1-24.2 1.5-36.2-2.7-12-8.6-23-17.1-32.1-8.5-9.1-19.4-15.8-31.4-19.5z"/></svg>`;

      return {
        id: i,
        left: Math.random() * 100 + "%",
        animationDuration: Math.random() * 7 + 8 + "s", // 8-15s for relaxed falling
        animationDelay: Math.random() * 10 + "s",
        backgroundImage: `url('${svg}')`,
        transform: `scale(${Math.random() * 0.6 + 0.4})`,
        opacity: Math.random() * 0.5 + 0.5,
      };
    });
    setLeaves(newLeaves);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: leafStyles }} />
      <div className="leaves-container">
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            className="leaf"
            style={{
              left: leaf.left,
              animationDuration: leaf.animationDuration,
              animationDelay: leaf.animationDelay,
              backgroundImage: leaf.backgroundImage,
              transform: leaf.transform,
              opacity: leaf.opacity,
            }}
          ></div>
        ))}
      </div>
    </>
  );
}
