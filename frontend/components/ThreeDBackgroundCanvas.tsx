'use client';
import { useEffect, useRef } from 'react';

export default function ThreeDBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.05;
      mouseY = (e.clientY - height / 2) * 0.05;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Generate 3D Spatial Nodes
    const numNodes = 60;
    const nodes: Array<{
      x: number;
      y: number;
      z: number;
      radius: number;
      vx: number;
      vy: number;
      vz: number;
      color: string;
    }> = [];

    const colors = ['#6366f1', '#a855f7', '#3b82f6', '#10b981', '#ec4899'];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        radius: Math.random() * 2.5 + 1.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Render 3D Animation Frame
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background Gradient Glow
      const bgGlow = ctx.createRadialGradient(
        width / 2 + mouseX * 2,
        height / 2 + mouseY * 2,
        100,
        width / 2,
        height / 2,
        width
      );
      bgGlow.addColorStop(0, 'rgba(15, 17, 26, 0.95)');
      bgGlow.addColorStop(0.5, 'rgba(10, 11, 18, 0.98)');
      bgGlow.addColorStop(1, '#07080c');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Sort nodes by Z depth for 3D rendering
      nodes.sort((a, b) => b.z - a.z);

      const fov = 400; // Field of view perspective

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move 3D nodes
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Wrap boundaries in 3D
        if (node.x < -width) node.x = width;
        if (node.x > width) node.x = -width;
        if (node.y < -height) node.y = height;
        if (node.y > height) node.y = -height;
        if (node.z < 50) node.z = 900;
        if (node.z > 900) node.z = 50;

        // 3D Perspective Projection
        const scale = fov / (fov + node.z);
        const projX = (node.x + mouseX * scale) * scale + width / 2;
        const projY = (node.y + mouseY * scale) * scale + height / 2;
        const projRadius = node.radius * scale;

        if (projX < -50 || projX > width + 50 || projY < -50 || projY > height + 50) continue;

        // Draw 3D Connecting Links
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const otherScale = fov / (fov + other.z);
          const otherProjX = (other.x + mouseX * otherScale) * otherScale + width / 2;
          const otherProjY = (other.y + mouseY * otherScale) * otherScale + height / 2;

          const dx = projX - otherProjX;
          const dy = projY - otherProjY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * scale * 0.35;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo(otherProjX, otherProjY);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
          }
        }

        // Draw 3D Glowing Node Particle
        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(1, projRadius * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12 * scale;
        ctx.globalAlpha = Math.min(1, scale * 1.2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
}
