// src/data/techLinks.ts
/**
 * Official documentation and website links for technologies, engines, and tools
 * featured in project case studies.
 */
export const TECH_LINKS: Record<string, string> = {
  "Unreal Engine 5": "https://www.unrealengine.com/",
  "Unreal Engine": "https://www.unrealengine.com/",
  UE5: "https://www.unrealengine.com/",
  Unity: "https://unity.com/",
  "Unity 3D": "https://unity.com/",
  "C++": "https://isocpp.org/",
  "C#": "https://learn.microsoft.com/dotnet/csharp/",
  Python: "https://www.python.org/",
  HLSL: "https://learn.microsoft.com/windows/win32/direct3dhlsl/dx-graphics-hlsl",
  GLSL: "https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language",
  WebXR: "https://immersiveweb.dev/",
  "Three.js": "https://threejs.org/",
  Maya: "https://www.autodesk.com/products/maya/",
  Houdini: "https://www.sidefx.com/",
  Qt: "https://www.qt.io/",
  PyQt: "https://www.qt.io/",
  PySide: "https://wiki.qt.io/Qt_for_Python",
  RealityCapture: "https://www.capturingreality.com/",
  Photogrammetry: "https://www.capturingreality.com/",
  Ultraleap: "https://www.ultraleap.com/",
  "Substance 3D Designer": "https://www.adobe.com/products/substance3d-designer.html",
  "Substance Designer": "https://www.adobe.com/products/substance3d-designer.html",
  "Substance 3D Painter": "https://www.adobe.com/products/substance3d-painter.html",
  "Substance Painter": "https://www.adobe.com/products/substance3d-painter.html",
  "Substance 3D": "https://www.adobe.com/products/substance3d.html",
  Niagara: "https://dev.epicgames.com/documentation/unreal-engine/overview-of-niagara-effects-for-unreal-engine",
  OptiTrack: "https://optitrack.com/",
  Evercoast: "https://www.evercoast.com/",
  "Volumetric Capture": "https://www.evercoast.com/",
  "Meta Quest": "https://www.meta.com/quest/",
  "PC VR": "https://store.steampowered.com/vr/",
  VR: "https://store.steampowered.com/vr/",
  AR: "https://www.apple.com/augmented-reality/",
  XR: "https://www.khronos.org/openxr/",
  Astro: "https://astro.build/",
  "Tailwind CSS": "https://tailwindcss.com/",
  React: "https://react.dev/",
  MRTK3: "https://learn.microsoft.com/windows/mixed-reality/mrtk-unity/",
  MRTK: "https://learn.microsoft.com/windows/mixed-reality/mrtk-unity/",
  "HoloLens 2": "https://www.microsoft.com/hololens",
  HoloLens: "https://www.microsoft.com/hololens",
  OpenXR: "https://www.khronos.org/openxr/",
  "Eye Tracking": "https://learn.microsoft.com/windows/mixed-reality/design/eye-tracking",
  ZBrush: "https://www.maxon.net/zbrush",
  Blender: "https://www.blender.org/",
  Git: "https://git-scm.com/",
  VFX: "https://dev.epicgames.com/documentation/unreal-engine/visual-effects-vfx-in-unreal-engine",
  Shaders: "https://learn.microsoft.com/windows/win32/direct3dhlsl/dx-graphics-hlsl",
  "Fluid Simulation": "https://dev.epicgames.com/documentation/unreal-engine/fluid-simulation-in-unreal-engine",
};

/**
 * Normalizes a tech string (case-insensitive lookup with fallback aliases)
 */
export function getTechLink(techName: string): string | undefined {
  if (!techName) return undefined;
  const trimmed = techName.trim();
  if (TECH_LINKS[trimmed]) return TECH_LINKS[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, url] of Object.entries(TECH_LINKS)) {
    if (key.toLowerCase() === lower) return url;
  }
  return undefined;
}
