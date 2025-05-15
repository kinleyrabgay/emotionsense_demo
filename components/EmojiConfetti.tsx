"use client";

import { useEffect, useRef } from "react";

interface EmojiConfettiProps {
  emoji: string;
  onComplete?: () => void;
  style?: React.CSSProperties;
}

interface ConfettiParticle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const EmojiConfetti: React.FC<EmojiConfettiProps> = ({ emoji, onComplete, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const createParticles = () => {
      const count = 10;
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          velocityX: (Math.random() - 0.5) * 8,
          velocityY: Math.random() * 4 + 2,
          size: Math.random() * 32 + 16,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }
    };

    createParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, 0, 0);
        ctx.restore();

        p.x += p.velocityX;
        p.y += p.velocityY;
        p.rotation += p.rotationSpeed;
      });
    };

    let animationFrameId: number;

    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      onComplete?.();
    }, 2000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [emoji, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={style}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
};

export default EmojiConfetti;
