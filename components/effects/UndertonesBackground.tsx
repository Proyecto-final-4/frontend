"use client";

import { useEffect, useRef, useState } from "react";

import { createUndertonesRenderer } from "@/lib/webgl/undertones-engine";
import { resolveUndertonesConfig } from "@/lib/webgl/undertones-presets";
import { cn } from "@/lib/utils";
import type { UndertonesConfig, UndertonesPreset } from "@/types/undertones";

export interface UndertonesBackgroundProps {
  className?: string;
  canvasClassName?: string;
  preset?: UndertonesPreset;
  config?: Partial<UndertonesConfig>;
  mouseEnabled?: boolean;
  paused?: boolean;
  fallbackClassName?: string;
  children?: React.ReactNode;
}

export function UndertonesBackground({
  className,
  canvasClassName,
  preset = "finanzia",
  config: configOverrides,
  mouseEnabled = true,
  paused,
  fallbackClassName = "fluid-bg dot-texture",
  children,
}: UndertonesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createUndertonesRenderer>>(null);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initialConfig = resolveUndertonesConfig(preset, {
      ...configOverrides,
      mouseEnabled,
      paused: paused ?? prefersReducedMotion,
    });

    const renderer = createUndertonesRenderer(canvas, initialConfig);
    rendererRef.current = renderer;

    if (!renderer) {
      setWebglOk(false);
      return;
    }

    setWebglOk(true);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
    // Solo re-inicializar si cambia el preset o flags estables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, mouseEnabled, paused]);

  useEffect(() => {
    if (!rendererRef.current || !configOverrides) return;
    rendererRef.current.setConfig(configOverrides);
  }, [configOverrides]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", !webglOk && fallbackClassName, className)}
    >
      {webglOk && (
        <canvas
          ref={canvasRef}
          className={cn("pointer-events-none absolute inset-0 h-full w-full", canvasClassName)}
          aria-hidden
        />
      )}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
