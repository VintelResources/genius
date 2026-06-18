'use client';
import { useRef } from 'react';
import { useGravity } from '@/hooks/useGravity';
import Matter from 'matter-js';

export default function PhysicsGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engine = useGravity(containerRef);

  const dropQuestion = () => {
    const box = Matter.Bodies.rectangle(Math.random() * 700, 0, 50, 50, {
      restitution: 0.8, // Make it bouncy!
    });
    Matter.World.add(engine.world, box);
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={dropQuestion}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Drop a New Question
      </button>
      <div ref={containerRef} className="border-2 border-gray-300 rounded" />
    </div>
  );
}

