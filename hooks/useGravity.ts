import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export const useGravity = (containerRef: React.RefObject<HTMLDivElement>) => {
  const engine = useRef(Matter.Engine.create());

  useEffect(() => {
    if (!containerRef.current) return;
    
    const render = Matter.Render.create({
      element: containerRef.current!,
      engine: engine.current,
      options: { width: 800, height: 600, wireframes: false, background: 'transparent' }
    });

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine.current);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    };
  }, [containerRef]);

  return engine.current;
};

