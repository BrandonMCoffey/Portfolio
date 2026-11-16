/* Foreground Chromatic Lens WebGL Shader */
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

  uniform sampler2D u_mask;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_vel;
  uniform float u_hover;
  uniform vec3 u_primary;
  uniform vec3 u_secondary;

  float sampleMask(vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    return texture2D(u_mask, uv).a;
  }

  void main() {
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = vec2((v_uv.x - 0.5) * aspect, v_uv.y - 0.5);
    vec2 m = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5);

    vec2 diff = p - m;
    float dist = length(diff);

    float rad = 0.7 * 0.72;
    float influence = exp(-(dist * dist) / (rad * rad * 0.55)) * u_hover;
    float speed = clamp(length(u_vel) * 14.0, 0.0, 1.6);
    float intensity = 0.85;

    vec2 shiftDir = normalize(diff + vec2(0.0001)) * (0.007 + 0.011 * speed) * influence * intensity;
    vec2 velShift = u_vel * 0.18 * intensity * influence;
    vec2 offset = shiftDir + velShift;

    vec2 lensUv = v_uv - (diff * vec2(1.0 / aspect, 1.0)) * 0.038 * influence * intensity;

    float maskC = sampleMask(lensUv);
    float maskP = sampleMask(lensUv + offset);
    float maskS = sampleMask(lensUv - offset);

    vec3 col = u_primary * maskC;
    col += u_primary * max(0.0, maskP - maskC) * 0.92;
    col += u_secondary * max(0.0, maskS - maskC) * 0.92;

    float alpha = max(maskC, max(maskP, maskS) * 0.85);
    vec3 outCol = alpha > 0.001 ? col / alpha : u_primary;

    gl_FragColor = vec4(outCol, clamp(alpha, 0.0, 1.0));
  }
`;

export function mountHeroTitleShader(titleEl: HTMLElement, canvas: HTMLCanvasElement) {
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

  const maskTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, maskTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const locs = {
    mask: gl.getUniformLocation(program, "u_mask"),
    resolution: gl.getUniformLocation(program, "u_resolution"),
    mouse: gl.getUniformLocation(program, "u_mouse"),
    vel: gl.getUniformLocation(program, "u_vel"),
    hover: gl.getUniformLocation(program, "u_hover"),
    primary: gl.getUniformLocation(program, "u_primary"),
    secondary: gl.getUniformLocation(program, "u_secondary"),
  };

  let primaryRgb: [number, number, number] = [1.0, 0.42, 0.21];
  let secondaryRgb: [number, number, number] = [0.65, 0.71, 0.74];

  const syncThemeTokens = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const cs = getComputedStyle(document.documentElement);
    primaryRgb = parseCssColor(cs.getPropertyValue("--accent-primary"), isDark ? [1, 0.42, 0.21] : [0.85, 0.29, 0.09]);
    secondaryRgb = parseCssColor(cs.getPropertyValue("--accent-secondary"), isDark ? [0.65, 0.71, 0.74] : [0.29, 0.35, 0.38]);
  };
  syncThemeTokens();

  const themeObserver = new MutationObserver(syncThemeTokens);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d");
  const PAD = 20;

  const rebuildMask = () => {
    if (!maskCtx) return;
    const rect = titleEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Supersample at >= 2.5x (up to 4x) to eliminate glyph aliasing on 1x displays
    const dpr = Math.max(2.5, Math.min((window.devicePixelRatio || 1) * 2, 4));
    const cssW = rect.width + PAD * 2;
    const cssH = rect.height + PAD * 2;
    const pxW = Math.max(1, Math.round(cssW * dpr));
    const pxH = Math.max(1, Math.round(cssH * dpr));

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.style.left = `-${PAD}px`;
    canvas.style.top = `-${PAD}px`;

    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
      gl.viewport(0, 0, pxW, pxH);
    }

    maskCanvas.width = pxW;
    maskCanvas.height = pxH;

    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCtx.clearRect(0, 0, cssW, cssH);
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.imageSmoothingQuality = "high";

    const hlWords = titleEl.querySelectorAll<HTMLElement>('.hero-fg-word[data-hl="1"]');
    const titleCs = getComputedStyle(titleEl);
    const isUppercase = titleCs.textTransform === "uppercase";

    hlWords.forEach((wordEl) => {
      const wRect = wordEl.getBoundingClientRect();
      const cs = getComputedStyle(wordEl);
      const rawText = (wordEl.textContent || "").trim();
      if (!rawText) return;
      const text = isUppercase ? rawText.toUpperCase() : rawText;

      maskCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const letterSpacing = cs.letterSpacing && cs.letterSpacing !== "normal" ? cs.letterSpacing : "0px";
      if ("letterSpacing" in maskCtx) {
        (maskCtx as unknown as { letterSpacing: string }).letterSpacing = letterSpacing;
      }

      const metrics = maskCtx.measureText(text);
      const fontSizePx = parseFloat(cs.fontSize) || 48;
      const fAscent = metrics.fontBoundingBoxAscent || fontSizePx * 0.82;
      const fDescent = metrics.fontBoundingBoxDescent || fontSizePx * 0.18;
      const leading = Math.max(0, wRect.height - (fAscent + fDescent));

      const x = wRect.left - rect.left + PAD;
      const y = wRect.top - rect.top + PAD + leading * 0.5 + fAscent;

      maskCtx.fillStyle = "#ffffff";
      maskCtx.textBaseline = "alphabetic";
      maskCtx.fillText(text, x, y);
    });

    gl.bindTexture(gl.TEXTURE_2D, maskTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
    titleEl.classList.add("hero-fg-active");
  };

  rebuildMask();
  document.fonts?.ready?.then(() => {
    requestAnimationFrame(() => requestAnimationFrame(rebuildMask));
  });

  const ro = new ResizeObserver(() => {
    requestAnimationFrame(() => requestAnimationFrame(rebuildMask));
  });
  ro.observe(titleEl);

  let isVisible = true;
  const io = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.01 },
  );
  io.observe(titleEl);

  let targetMouse = { x: 0.5, y: 0.5 };
  let smoothMouse = { x: 0.5, y: 0.5 };
  let prevMouse = { x: 0.5, y: 0.5 };
  let smoothVel = { x: 0, y: 0 };
  let targetHover = 0.0;
  let smoothHover = 0.0;
  let hasMoved = false;
  let rafId = 0;

  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = 1.0 - (e.clientY - rect.top) / rect.height;
    if (!hasMoved) {
      smoothMouse.x = nx;
      smoothMouse.y = ny;
      prevMouse.x = nx;
      prevMouse.y = ny;
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

    smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.16;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.16;
    smoothHover += (targetHover - smoothHover) * 0.07;

    const vx = smoothMouse.x - prevMouse.x;
    const vy = smoothMouse.y - prevMouse.y;
    prevMouse.x = smoothMouse.x;
    prevMouse.y = smoothMouse.y;
    smoothVel.x += (vx - smoothVel.x) * 0.25;
    smoothVel.y += (vy - smoothVel.y) * 0.25;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, maskTexture);
    gl.uniform1i(locs.mask, 0);

    gl.uniform2f(locs.resolution, canvas.width, canvas.height);
    gl.uniform2f(locs.mouse, smoothMouse.x, smoothMouse.y);
    gl.uniform2f(locs.vel, smoothVel.x, smoothVel.y);
    gl.uniform1f(locs.hover, smoothHover);
    gl.uniform3f(locs.primary, primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    gl.uniform3f(locs.secondary, secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);

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
    titleEl.classList.remove("hero-fg-active");
    gl.deleteTexture(maskTexture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  };
}
