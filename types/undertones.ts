export interface UndertonesConfig {
  scale: number;
  speed: number;
  warpAmount: number;
  warpSpeed: number;
  octaves: number;
  lacunarity: number;
  gain: number;
  contrast: number;
  contrastCenter: number;
  palA: string;
  palB: string;
  palC: string;
  palD: string;
  paletteShift: number;
  paletteCycle: number;
  tint: string;
  tintStrength: number;
  brightness: number;
  saturation: number;
  gamma: number;
  vignetteAmount: number;
  vignetteRadius: number;
  vignetteSoftness: number;
  grain: number;
  mouseStrength: number;
  mouseFalloff: number;
  mouseEnabled: boolean;
  pixelRatio: number;
  paused: boolean;
}

export type UndertonesPreset = "undertones" | "finanzia";
