export const UNDERTONES_VERTEX_SHADER = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

export const UNDERTONES_FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;
  uniform float u_mouseAmp;

  uniform float u_scale;
  uniform float u_speed;
  uniform float u_warpAmount;
  uniform float u_warpSpeed;
  uniform int   u_octaves;
  uniform float u_lacunarity;
  uniform float u_gain;
  uniform float u_contrast;
  uniform float u_contrastCenter;

  uniform vec3  u_palA;
  uniform vec3  u_palB;
  uniform vec3  u_palC;
  uniform vec3  u_palD;
  uniform float u_paletteShift;
  uniform float u_paletteCycle;

  uniform vec3  u_tint;
  uniform float u_brightness;
  uniform float u_saturation;
  uniform float u_gamma;

  uniform float u_vignetteAmount;
  uniform float u_vignetteRadius;
  uniform float u_vignetteSoftness;
  uniform float u_grain;

  uniform float u_mouseStrength;
  uniform float u_mouseFalloff;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float gnoise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 8; i++) {
      if (i >= u_octaves) break;
      v += a * gnoise(p);
      p = rot * p * u_lacunarity;
      a *= u_gain;
    }
    return v;
  }

  float warpedFbm(vec2 p, float t) {
    float w = u_warpAmount;
    float ws = u_warpSpeed;
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + ws * t),
                  fbm(p + vec2(5.2, 1.3) - ws * t * 0.7));
    vec2 r = vec2(fbm(p + w * q + vec2(1.7, 9.2) + ws * t * 0.6),
                  fbm(p + w * q + vec2(8.3, 2.8) + ws * t * 0.55));
    return fbm(p + w * r);
  }

  vec3 palette(float t) {
    return u_palA + u_palB * cos(6.28318 * (u_palC * t + u_palD));
  }

  void main() {
    float s = min(u_res.x, u_res.y);
    vec2 uv      = (gl_FragCoord.xy    - 0.5 * u_res.xy) / s;
    vec2 mouseUV = (u_mouse * u_res.xy - 0.5 * u_res.xy) / s;

    float t = u_time * u_speed;

    vec2 toMouse = mouseUV - uv;
    float d = length(toMouse);

    vec2 push = normalize(toMouse + 1e-5)
              * exp(-d * u_mouseFalloff)
              * u_mouseStrength
              * u_mouseAmp;

    float n = warpedFbm((uv + push) * u_scale, t);

    float lo = u_contrastCenter - 0.5 / max(u_contrast, 0.001);
    float hi = u_contrastCenter + 0.5 / max(u_contrast, 0.001);
    float k = smoothstep(lo, hi, n);

    vec3 col = palette(k * u_paletteCycle + u_paletteShift);

    col *= u_tint;

    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);

    col *= u_brightness;

    float vd = length(uv);
    float vig = 1.0 - smoothstep(
      u_vignetteRadius,
      u_vignetteRadius + u_vignetteSoftness,
      vd
    );
    col *= mix(1.0, vig, u_vignetteAmount);

    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * u_grain;

    col = pow(clamp(col, 0.0, 1.0), vec3(u_gamma));

    gl_FragColor = vec4(col, 1.0);
  }
`;
