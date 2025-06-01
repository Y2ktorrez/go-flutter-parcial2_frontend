"use client";

import { useEffect, useRef, useState } from "react";
import AuthModal from "@/components/auth-modal";
import { Particle } from "@/lib/particle";

// Nuevo componente para el fondo de partículas (client component)
export function ParticleBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Recrear partículas con el nuevo tamaño
      particlesRef.current = [];
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push(new Particle(canvas));
      }
    };

    resizeCanvas();

    // Animación de partículas
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particlesRef.current) {
        particle.update();
        particle.draw(ctx);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Manejar redimensionamiento
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 h-full w-full bg-black -z-10"
      />
      <div className="relative z-10 bg-transparent min-h-screen">
        {children}
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

// Componente wrapper para el modal de autenticación
export function AuthModalWrapper() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
  );
}
