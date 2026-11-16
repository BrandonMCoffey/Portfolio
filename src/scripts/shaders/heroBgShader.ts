/* Interactive Halftone Dot Grid WebGL Background Shader */
function parseCssColor(raw: string, fallback: [number, number, number]): [number, number, number] {
  const clean = raw.trim();
  if (clean.startsWith("#")) {
    const hex = clean.slice(1);
    if (hex.length === 3) {
      return [parseInt(hex[0] + hex[0], 16) / 255, parseInt(hex[1] + hex[1], 16) / 255, parseInt(hex[2] + hex[2], 16) / 255];
    }
    if (hex.length >= 6) {
      return [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
    }
  }
  const rgbMatch = clean.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgbMatch) {
    return [Number(rgbMatch[1]) / 255, Number(rgbMatch[2]) / 255, Number(rgbMatch[3]) / 255];
  }
  return fallback;
}

const VERTEX_SHADER = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_hover;
  uniform vec3 u_primary;
  uniform vec3 u_secondary;
  uniform float u_isDark;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = vec2((v_uv.x - 0.5) * aspect, v_uv.y - 0.5);
    vec2 m = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5);

    float radius = 0.34;
    vec2 diff = p - m;
    float dist = length(diff);
    float influence = exp(-(dist * dist) / (radius * radius * 0.55)) * u_hover;
    float wideInfluence = exp(-(dist * dist) / (radius * radius * 1.7)) * u_hover;

    float edgeFade = smoothstep(0.0, 0.14, v_uv.y) * smoothstep(1.0, 0.86, v_uv.y);
    edgeFade *= smoothstep(0.0, 0.08, v_uv.x) * smoothstep(1.0, 0.92, v_uv.x);

    float cells = 28.0;
    vec2 gp = p * cells;
    vec2 cellUv = fract(gp) - 0.5;
    float wave = snoise(floor(gp) * 0.12 + vec2(u_time * 0.08, -u_time * 0.06)) * 0.5 + 0.5;

    // Visible idle dot matrix baseline + cursor bloom
    float idleEnergy = 0.35 + 0.1 * wave;
    float cursorEnergy = influence * 0.5 + wideInfluence * 0.15;
    float energy = clamp(idleEnergy + cursorEnergy, 0.0, 0.94);

    float dotRadius = energy * 0.42 * edgeFade;
    float d = length(cellUv);
    float dotAlpha = 1.0 - smoothstep(dotRadius - 0.055, dotRadius + 0.055, d);

    vec3 col = mix(u_secondary, u_primary, smoothstep(0.12, 0.85, influence + wave * 0.16));
    vec3 outColor = u_isDark > 0.5 ? col : col * 0.82;

    float darkAlpha = mix(0.3, 0.45, clamp(wideInfluence * 1.15, 0.0, 1.0));
    float lightAlpha = mix(0.15, 0.25, clamp(wideInfluence * 1.15, 0.0, 1.0));
    float alphaScale = u_isDark > 0.5 ? darkAlpha : lightAlpha;

    gl_FragColor = vec4(outColor, dotAlpha * alphaScale);
  }
`;

export function mountHeroBgShader(canvas: HTMLCanvasElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return () => {};

  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return () => {};

  const program = gl.createProgram();
  if (!program) return () => {};
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const locs = {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    mouse: gl.getUniformLocation(program, "u_mouse"),
    time: gl.getUniformLocation(program, "u_time"),
    hover: gl.getUniformLocation(program, "u_hover"),
    primary: gl.getUniformLocation(program, "u_primary"),
    secondary: gl.getUniformLocation(program, "u_secondary"),
    isDark: gl.getUniformLocation(program, "u_isDark"),
  };

  let primaryRgb: [number, number, number] = [1.0, 0.42, 0.21];
  let secondaryRgb: [number, number, number] = [0.65, 0.71, 0.74];
  let isDark = true;

  const syncThemeTokens = () => {
    isDark = document.documentElement.classList.contains("dark");
    const cs = getComputedStyle(document.documentElement);
    primaryRgb = parseCssColor(cs.getPropertyValue("--accent-primary"), isDark ? [1, 0.42, 0.21] : [0.85, 0.29, 0.09]);
    secondaryRgb = parseCssColor(cs.getPropertyValue("--accent-secondary"), isDark ? [0.65, 0.71, 0.74] : [0.29, 0.35, 0.38]);
  };
  syncThemeTokens();

  const themeObserver = new MutationObserver(syncThemeTokens);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  const heroEl = canvas.parentElement;
  const resize = () => {
    if (!heroEl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(heroEl.clientWidth * dpr));
    const h = Math.max(1, Math.floor(heroEl.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const ro = new ResizeObserver(resize);
  if (heroEl) ro.observe(heroEl);
  resize();

  let isVisible = true;
  const io = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.01 },
  );
  io.observe(canvas);

  let targetMouse = { x: 0.5, y: 0.5 };
  let smoothMouse = { x: 0.5, y: 0.5 };
  let targetHover = 0.0;
  let smoothHover = 0.0;
  let hasMoved = false;
  let rafId = 0;
  const startTime = performance.now();

  const onPointerMove = (e: PointerEvent) => {
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = 1.0 - (e.clientY - rect.top) / rect.height;
    if (!hasMoved) {
      smoothMouse.x = nx;
      smoothMouse.y = ny;
      hasMoved = true;
    }
    targetMouse.x = nx;
    targetMouse.y = ny;
    targetHover = 1.0;
  };

  const onPointerLeaveDoc = () => {
    targetHover = 0.0;
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("mouseleave", onPointerLeaveDoc, { passive: true });

  const render = () => {
    rafId = requestAnimationFrame(render);
    if (!isVisible) return;

    smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.14;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.14;
    smoothHover += (targetHover - smoothHover) * 0.07;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const now = (performance.now() - startTime) * 0.001;
    gl.uniform2f(locs.resolution, canvas.width, canvas.height);
    gl.uniform2f(locs.mouse, smoothMouse.x, smoothMouse.y);
    gl.uniform1f(locs.time, now);
    gl.uniform1f(locs.hover, smoothHover);
    gl.uniform3f(locs.primary, primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    gl.uniform3f(locs.secondary, secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
    gl.uniform1f(locs.isDark, isDark ? 1.0 : 0.0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  rafId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    io.disconnect();
    themeObserver.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("mouseleave", onPointerLeaveDoc);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  };
}
