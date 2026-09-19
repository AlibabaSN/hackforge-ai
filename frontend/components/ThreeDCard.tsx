'use client';
import { useState, useRef, ReactNode } from 'react';

interface ThreeDCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function ThreeDCard({ children, className = '', style = {}, onClick }: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 10; // Max tilt 10deg
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`card 3d-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
        transition: rotateX === 0 && rotateY === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* 3D Dynamic Specular Light Glare */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.25) 0%, transparent 60%)`,
          opacity: glarePosition.opacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
}
