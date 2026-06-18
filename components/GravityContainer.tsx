// components/GravityContainer.tsx
import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export const GravityContainer = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          World = Matter.World,
          Bodies = Matter.Bodies;

    const engine = Engine.create();
    const render = Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: { width: 800, height: 600 }
    });

    // Create objects
    const box = Bodies.rectangle(400, 200, 80, 80);
    const ground = Bodies.rectangle(400, 580, 810, 60, { isStatic: true });

    World.add(engine.world, [box, ground]);

    Engine.run(engine);
    Render.run(render);
  }, []);

  return <div ref={sceneRef} />;
};
