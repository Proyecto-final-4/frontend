import {
  UNDERTONES_FRAGMENT_SHADER,
  UNDERTONES_VERTEX_SHADER,
} from "@/lib/webgl/undertones-shaders";
import type { UndertonesConfig } from "@/types/undertones";

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return [0, 0, 0];
  return [parseInt(m[0], 16) / 255, parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255];
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown error";
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${log}`);
  }
  return shader;
}

export interface UndertonesRenderer {
  setConfig: (partial: Partial<UndertonesConfig>) => void;
  getConfig: () => UndertonesConfig;
  destroy: () => void;
}

export function createUndertonesRenderer(
  canvas: HTMLCanvasElement,
  initialConfig: UndertonesConfig,
): UndertonesRenderer | null {
  const glContext = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!glContext) return null;
  const gl: WebGLRenderingContext = glContext;

  const vs = compileShader(gl, gl.VERTEX_SHADER, UNDERTONES_VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, UNDERTONES_FRAGMENT_SHADER);

  const prog = gl.createProgram();
  if (!prog) return null;

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return null;
  }

  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uniformNames = [
    "u_res",
    "u_time",
    "u_mouse",
    "u_mouseAmp",
    "u_scale",
    "u_speed",
    "u_warpAmount",
    "u_warpSpeed",
    "u_octaves",
    "u_lacunarity",
    "u_gain",
    "u_contrast",
    "u_contrastCenter",
    "u_palA",
    "u_palB",
    "u_palC",
    "u_palD",
    "u_paletteShift",
    "u_paletteCycle",
    "u_tint",
    "u_brightness",
    "u_saturation",
    "u_gamma",
    "u_vignetteAmount",
    "u_vignetteRadius",
    "u_vignetteSoftness",
    "u_grain",
    "u_mouseStrength",
    "u_mouseFalloff",
  ] as const;

  const U = {} as Record<(typeof uniformNames)[number], WebGLUniformLocation | null>;
  for (const name of uniformNames) {
    U[name] = gl.getUniformLocation(prog, name);
  }

  let config: UndertonesConfig = { ...initialConfig };
  let simTime = 0;
  let lastT = performance.now();
  let rafId = 0;
  let destroyed = false;

  const mouseT = { x: 0.5, y: 0.5 };
  const mouse = { x: 0.5, y: 0.5 };
  let mouseAmp = 0;
  let mouseAmpT = 0;

  const container = canvas.parentElement;

  function resize() {
    const dpr = config.pixelRatio;
    const rect = container?.getBoundingClientRect();
    const cssW = rect?.width ?? window.innerWidth;
    const cssH = rect?.height ?? window.innerHeight;
    const w = Math.max(1, Math.floor(cssW * dpr));
    const h = Math.max(1, Math.floor(cssH * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function pushUniforms() {
    gl.uniform2f(U.u_res, canvas.width, canvas.height);
    gl.uniform1f(U.u_time, simTime);
    gl.uniform2f(U.u_mouse, mouse.x, mouse.y);
    gl.uniform1f(U.u_mouseAmp, mouseAmp);

    gl.uniform1f(U.u_scale, config.scale);
    gl.uniform1f(U.u_speed, config.speed);
    gl.uniform1f(U.u_warpAmount, config.warpAmount);
    gl.uniform1f(U.u_warpSpeed, config.warpSpeed);
    gl.uniform1i(U.u_octaves, config.octaves | 0);
    gl.uniform1f(U.u_lacunarity, config.lacunarity);
    gl.uniform1f(U.u_gain, config.gain);
    gl.uniform1f(U.u_contrast, config.contrast);
    gl.uniform1f(U.u_contrastCenter, config.contrastCenter);

    const A = hexToRgb(config.palA);
    const B = hexToRgb(config.palB);
    const C = hexToRgb(config.palC);
    const D = hexToRgb(config.palD);
    gl.uniform3f(U.u_palA, A[0], A[1], A[2]);
    gl.uniform3f(U.u_palB, B[0], B[1], B[2]);
    gl.uniform3f(U.u_palC, C[0], C[1], C[2]);
    gl.uniform3f(U.u_palD, D[0], D[1], D[2]);
    gl.uniform1f(U.u_paletteShift, config.paletteShift);
    gl.uniform1f(U.u_paletteCycle, config.paletteCycle);

    const T = hexToRgb(config.tint);
    const ts = config.tintStrength;
    gl.uniform3f(U.u_tint, 1 + (T[0] - 1) * ts, 1 + (T[1] - 1) * ts, 1 + (T[2] - 1) * ts);
    gl.uniform1f(U.u_brightness, config.brightness);
    gl.uniform1f(U.u_saturation, config.saturation);
    gl.uniform1f(U.u_gamma, config.gamma);

    gl.uniform1f(U.u_vignetteAmount, config.vignetteAmount);
    gl.uniform1f(U.u_vignetteRadius, config.vignetteRadius);
    gl.uniform1f(U.u_vignetteSoftness, config.vignetteSoftness);
    gl.uniform1f(U.u_grain, config.grain);

    gl.uniform1f(U.u_mouseStrength, config.mouseStrength);
    gl.uniform1f(U.u_mouseFalloff, config.mouseFalloff);
  }

  function frame(now: number) {
    if (destroyed) return;

    const dt = (now - lastT) / 1000;
    lastT = now;

    if (!config.paused) simTime += dt;

    mouse.x += (mouseT.x - mouse.x) * 0.06;
    mouse.y += (mouseT.y - mouse.y) * 0.06;
    if (!config.mouseEnabled) mouseAmpT = 0;
    mouseAmp += (mouseAmpT - mouseAmp) * 0.04;

    resize();
    pushUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    rafId = requestAnimationFrame(frame);
  }

  function onPointerMove(e: PointerEvent) {
    if (!config.mouseEnabled) return;
    const rect = container?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return;
    mouseT.x = (e.clientX - rect.left) / rect.width;
    mouseT.y = 1 - (e.clientY - rect.top) / rect.height;
    mouseAmpT = 1;
  }

  function onPointerLeave() {
    mouseAmpT = 0;
  }

  const resizeObserver =
    typeof ResizeObserver !== "undefined" && container ? new ResizeObserver(() => resize()) : null;

  if (container) resizeObserver?.observe(container);
  window.addEventListener("resize", resize);
  container?.addEventListener("pointermove", onPointerMove, { passive: true });
  container?.addEventListener("pointerleave", onPointerLeave);

  resize();
  rafId = requestAnimationFrame(frame);

  return {
    setConfig(partial) {
      config = { ...config, ...partial };
    },
    getConfig() {
      return { ...config };
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      container?.removeEventListener("pointermove", onPointerMove);
      container?.removeEventListener("pointerleave", onPointerLeave);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    },
  };
}
