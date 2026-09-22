# CRT TV Pyramid 3D Viewer (Persona 4)

An interactive WebGL / Three.js 3D viewer built with Vite, featuring a responsive 3-2-1 pyramid stack of retro CRT television sets inspired by the *Persona 4* "Midnight Channel" aesthetic.

## Features
- **Responsive Auto-Framing:** Dynamically recalculates camera distance across any screen resolution and aspect ratio (mobile, tablet, desktop, ultrawide).
- **Subtle 5° Parallax:** Smooth lerp rotation following mouse cursor on desktop and touch drag on mobile.
- **CRT Shader Scanlines:** Procedural raster scanlines injected directly into the screen fragment shader without affecting the outer plastic bezels.
- **Retro Plastic Shader:** Dual-tone matte gray chassis with studio key/rim lighting.

## Tech Stack
- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
