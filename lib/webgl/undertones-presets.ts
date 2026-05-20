import type { UndertonesConfig, UndertonesPreset } from "@/types/undertones";

export const UNDERTONES_DEFAULTS: UndertonesConfig = {
  scale: 1.3,
  speed: 0.08,
  warpAmount: 4.0,
  warpSpeed: 0.15,
  octaves: 5,
  lacunarity: 2.0,
  gain: 0.5,
  contrast: 1.6,
  contrastCenter: 0.1,
  palA: "#9e6b73",
  palB: "#735949",
  palC: "#ffffd9",
  palD: "#0d2e53",
  paletteShift: 0.0,
  paletteCycle: 1.0,
  tint: "#ffead9",
  tintStrength: 1.0,
  brightness: 1.0,
  saturation: 1.0,
  gamma: 0.95,
  vignetteAmount: 0.22,
  vignetteRadius: 0.55,
  vignetteSoftness: 0.75,
  grain: 0.02,
  mouseStrength: 0.25,
  mouseFalloff: 4.0,
  mouseEnabled: true,
  pixelRatio: 1,
  paused: false,
};

/** Default preset for login / AuthVisual (tuned values). */
export const FINANZIA_UNDERTONES: UndertonesConfig = {
  scale: 0.85,
  speed: 0.109,
  warpAmount: 4.69,
  warpSpeed: 0.082,
  octaves: 3,
  lacunarity: 1.74,
  gain: 0.52,
  contrast: 1.36,
  contrastCenter: 0.31,
  palA: "#000000",
  palB: "#73b093",
  palC: "#794e4e",
  palD: "#5bc8c5",
  paletteShift: 0.036,
  paletteCycle: 1.2234435466245004,
  tint: "#00fa8e",
  tintStrength: 1.6,
  brightness: 0.9,
  saturation: 1.25,
  gamma: 1.68,
  vignetteAmount: 0.44,
  vignetteRadius: 0.34,
  vignetteSoftness: 0.63,
  grain: 0.105,
  mouseStrength: 0.1,
  mouseFalloff: 8,
  mouseEnabled: true,
  pixelRatio: 1.5,
  paused: false,
};

const PRESETS: Record<UndertonesPreset, UndertonesConfig> = {
  undertones: UNDERTONES_DEFAULTS,
  finanzia: FINANZIA_UNDERTONES,
};

export function resolveUndertonesConfig(
  preset: UndertonesPreset = "finanzia",
  overrides?: Partial<UndertonesConfig>,
): UndertonesConfig {
  const base = PRESETS[preset];
  const pixelRatio =
    overrides?.pixelRatio ??
    base.pixelRatio ??
    (typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1);

  return {
    ...base,
    ...overrides,
    pixelRatio,
  };
}
