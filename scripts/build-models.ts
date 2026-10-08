/**
 * Parametric 3D model builder.
 *
 * Generates one GLB per product (public/models/<slug>.glb) from a handful of
 * device-family generators, then compresses each file with Draco + weld/prune.
 * Real CAD/GLB files from the factory can simply replace these files — the
 * storefront only cares about the path stored in `product.model3d`.
 *
 *   npm run models
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, draco, prune, weld } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// ---- Node polyfill for GLTFExporter (it reads Blobs through FileReader) ----
class NodeFileReader {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((b) => {
      this.result = b;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((b) => {
      this.result = `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(b).toString("base64")}`;
      this.onloadend?.();
    });
  }
}
(globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReader;

// ---------------------------------------------------------------- materials
const mat = (color: string, rough = 0.5, metal = 0.0, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

const M = {
  white: mat("#f1f2f3", 0.42, 0.05),
  offwhite: mat("#e6e8ea", 0.5, 0.05),
  red: mat("#c8102e", 0.38, 0.1),
  darkred: mat("#8f0b22", 0.4, 0.1),
  steel: mat("#c9ced3", 0.28, 1.0),
  steelDark: mat("#8e959c", 0.38, 1.0),
  dark: mat("#26292d", 0.5, 0.2),
  black: mat("#111214", 0.6, 0.1),
  rubber: mat("#18191b", 0.9, 0.0),
  interior: mat("#5d6368", 0.55, 0.35),
  worktop: mat("#2b2e32", 0.25, 0.1),
  glass: mat("#e4eef3", 0.04, 0.0, { transparent: true, opacity: 0.16, depthWrite: false }),
  glassStrong: mat("#bcd6e2", 0.04, 0.0, { transparent: true, opacity: 0.32, depthWrite: false }),
  screenRed: mat("#1a0508", 0.3, 0.0, { emissive: new THREE.Color("#ff2a45"), emissiveIntensity: 0.55 }),
  screenBlue: mat("#06141c", 0.3, 0.0, { emissive: new THREE.Color("#4fd0ff"), emissiveIntensity: 0.45 }),
  ledRed: mat("#ff2a45", 0.4, 0.0, { emissive: new THREE.Color("#ff2a45"), emissiveIntensity: 1.2 }),
  ledGreen: mat("#2ee56f", 0.4, 0.0, { emissive: new THREE.Color("#2ee56f"), emissiveIntensity: 1.0 }),
};

// ------------------------------------------------------------------ helpers
const rb = (w: number, h: number, d: number, m: THREE.Material, r = 0.006) => {
  const rad = Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005);
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.max(rad, 0.0008)), m);
};
const bx = (w: number, h: number, d: number, m: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (r: number, h: number, m: THREE.Material, seg = 28) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => {
  o.position.set(x, y, z);
  return o;
};

function feet(g: THREE.Group, w: number, d: number, h = 0.035) {
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      g.add(at(cyl(0.022, h, M.rubber), sx * (w / 2 - 0.05), h / 2, sz * (d / 2 - 0.05)));
    }
}

function knob(g: THREE.Group, x: number, y: number, z: number, r = 0.014) {
  const k = cyl(r, 0.014, M.dark);
  k.rotation.x = Math.PI / 2;
  g.add(at(k, x, y, z + 0.007));
  const cap = cyl(r * 0.65, 0.004, M.steel);
  cap.rotation.x = Math.PI / 2;
  g.add(at(cap, x, y, z + 0.016));
}

// ------------------------------------------------- family: cabinet (oven etc)
interface CabinetOpts {
  w: number;
  h: number;
  d: number;
  window?: boolean;
  cooler?: boolean; // grille base instead of red band (cooled incubators, climate chambers)
  tallDoor?: boolean;
  accent?: THREE.Material;
  shelves?: number;
  doubleDoor?: boolean;
  gauge?: boolean; // vacuum oven pressure gauge
}
function cabinet(o: CabinetOpts) {
  const g = new THREE.Group();
  const { w, h, d } = o;
  const f = 0.035;
  const accent = o.accent ?? M.red;
  feet(g, w, d, f);

  g.add(at(rb(w, h, d, M.white, 0.012), 0, f + h / 2, 0));

  // base band / cooling grille
  const bandH = o.cooler ? h * 0.12 : h * 0.075;
  if (o.cooler) {
    g.add(at(rb(w * 0.96, bandH, 0.012, M.dark, 0.003), 0, f + bandH / 2 + 0.01, d / 2 + 0.002));
    const slats = Math.max(6, Math.round(bandH / 0.012));
    for (let i = 0; i < slats; i++)
      g.add(at(bx(w * 0.9, 0.003, 0.004, M.steelDark), 0, f + 0.016 + (i * (bandH - 0.012)) / slats, d / 2 + 0.009));
  } else {
    g.add(at(rb(w + 0.003, bandH, d + 0.003, accent, 0.008), 0, f + bandH / 2, 0));
  }

  // control strip
  const ch = Math.min(0.13, h * 0.15);
  const cy = f + h - ch / 2 - 0.012;
  g.add(at(rb(w * 0.95, ch, 0.012, M.offwhite, 0.004), 0, cy, d / 2 + 0.004));
  g.add(at(rb(w * 0.3, ch * 0.62, 0.006, M.black, 0.003), -w * 0.2, cy, d / 2 + 0.011));
  g.add(at(rb(w * 0.26, ch * 0.4, 0.002, M.screenRed, 0.001), -w * 0.2, cy, d / 2 + 0.0145));
  knob(g, w * 0.14, cy, d / 2 + 0.01, 0.017);
  knob(g, w * 0.26, cy, d / 2 + 0.01, 0.013);
  g.add(at(cyl(0.005, 0.004, M.ledGreen, 12), w * 0.36, cy + ch * 0.2, d / 2 + 0.012));
  g.add(at(cyl(0.005, 0.004, M.ledRed, 12), w * 0.36, cy - ch * 0.15, d / 2 + 0.012));
  // brand tab
  g.add(at(rb(w * 0.17, 0.028, 0.004, accent, 0.002), -w / 2 + w * 0.12, f + h - 0.008, d / 2 + 0.012));

  // door
  const doorBottom = f + bandH + 0.012;
  const doorTop = cy - ch / 2 - 0.012;
  const doorH = doorTop - doorBottom;
  const doorW = w * 0.94;
  const doorY = doorBottom + doorH / 2;
  const doorZ = d / 2 + 0.012;
  if (o.doubleDoor) {
    for (const s of [-1, 1]) g.add(at(rb(doorW / 2 - 0.003, doorH, 0.022, M.white, 0.006), (s * doorW) / 4, doorY, doorZ));
    for (const s of [-1, 1]) g.add(at(cyl(0.007, doorH * 0.45, M.steel), s * 0.018, doorY, doorZ + 0.03));
  } else {
    g.add(at(rb(doorW, doorH, 0.022, M.white, 0.007), 0, doorY, doorZ));
  }
  if (o.window) {
    const ww = doorW * (o.doubleDoor ? 0.34 : 0.62);
    const wh = doorH * 0.58;
    const wy = doorY + doorH * 0.04;
    for (const s of o.doubleDoor ? [-1, 1] : [0]) {
      const wx = o.doubleDoor ? (s * doorW) / 4 - s * 0.01 : -doorW * 0.045;
      g.add(at(rb(ww + 0.02, wh + 0.02, 0.01, M.dark, 0.004), wx, wy, doorZ + 0.014));
      g.add(at(bx(ww, wh, 0.004, M.interior), wx, wy, doorZ + 0.0205));
      const n = o.shelves ?? 3;
      for (let i = 1; i <= n; i++) {
        g.add(at(bx(ww * 0.96, 0.005, 0.018, M.steel), wx, wy - wh / 2 + (i * wh) / (n + 1), doorZ + 0.03));
      }
      g.add(at(rb(ww, wh, 0.003, M.glass, 0.002), wx, wy, doorZ + 0.0395));
    }
  }
  // handle (right side)
  const hx = o.doubleDoor ? 0 : doorW / 2 - 0.03;
  const hLen = doorH * (o.tallDoor ? 0.5 : 0.42);
  if (!o.doubleDoor) {
    g.add(at(cyl(0.0085, hLen, M.steel), hx, doorY, doorZ + 0.04));
    for (const s of [-1, 1]) {
      const st = cyl(0.0055, 0.03, M.steelDark);
      st.rotation.x = Math.PI / 2;
      g.add(at(st, hx, doorY + (s * hLen) / 2.2, doorZ + 0.025));
    }
  }
  // hinges
  for (const s of [-1, 1]) g.add(at(bx(0.012, 0.045, 0.014, M.dark), -doorW / 2 - 0.002, doorY + s * doorH * 0.36, doorZ - 0.004));

  // side vent slats
  for (const sx of [-1, 1])
    for (let i = 0; i < 9; i++)
      g.add(at(bx(0.002, 0.006, d * 0.42, M.offwhite), sx * (w / 2 + 0.0008), f + h * 0.62 + i * 0.013, -d * 0.12));
  // top exhaust port
  g.add(at(cyl(0.022, 0.02, M.steelDark), w * 0.28, f + h + 0.01, -d * 0.25));

  if (o.gauge) {
    g.add(at(cyl(0.032, 0.018, M.steel, 32), w * 0.28, f + h * 0.7, d / 2 + 0.02));
    const face = cyl(0.026, 0.004, M.white, 32);
    face.rotation.x = Math.PI / 2;
    g.add(at(face, w * 0.28, f + h * 0.7, d / 2 + 0.03));
    g.rotation.y = 0;
  }
  return g;
}

// ---------------------------------------------------------- family: fume hood
function fumeHood(w = 1.2, bench = false) {
  const g = new THREE.Group();
  const d = bench ? 0.62 : 0.8;
  const baseH = bench ? 0.0 : 0.82;
  const hoodH = bench ? 0.86 : 1.35;
  const t = 0.025;

  if (!bench) {
    g.add(at(rb(w, baseH, d, M.white, 0.01), 0, baseH / 2, 0));
    for (const s of [-1, 1]) {
      g.add(at(rb(w / 2 - 0.03, baseH - 0.08, 0.018, M.offwhite, 0.006), (s * w) / 4, baseH / 2 + 0.005, d / 2 + 0.008));
      g.add(at(cyl(0.007, 0.16, M.steel), s * 0.026, baseH * 0.68, d / 2 + 0.034));
    }
    g.add(at(bx(w, 0.035, d + 0.01, M.dark), 0, 0.017, 0.0));
    // worktop
    g.add(at(rb(w + 0.04, 0.04, d + 0.04, M.worktop, 0.008), 0, baseH + 0.02, 0.01));
  }
  const top = baseH + (bench ? 0 : 0.04);
  if (bench) g.add(at(rb(w, 0.04, d, M.worktop, 0.008), 0, 0.02, 0));
  const y0 = top + (bench ? 0.04 : 0);

  // back / sides / ceiling of hood
  g.add(at(bx(w - 0.08, hoodH, t, M.interior), 0, y0 + hoodH / 2, -d / 2 + 0.05));
  for (const s of [-1, 1]) g.add(at(rb(0.06, hoodH, d - 0.04, M.white, 0.01), s * (w / 2 - 0.03), y0 + hoodH / 2, -0.02));
  g.add(at(rb(w, 0.07, d - 0.02, M.white, 0.01), 0, y0 + hoodH - 0.035, -0.01));
  // sash frame + glass (half open)
  const sashH = hoodH * 0.62;
  const sashY = y0 + hoodH - 0.07 - sashH / 2 - 0.12;
  g.add(at(rb(w - 0.1, 0.045, 0.03, M.steel, 0.006), 0, sashY + sashH / 2, d / 2 - 0.1));
  g.add(at(rb(w - 0.1, 0.045, 0.03, M.steel, 0.006), 0, sashY - sashH / 2, d / 2 - 0.1));
  for (const s of [-1, 1]) g.add(at(rb(0.025, sashH, 0.03, M.steel, 0.005), (s * (w - 0.12)) / 2, sashY, d / 2 - 0.1));
  g.add(at(rb(w - 0.13, sashH - 0.04, 0.008, M.glassStrong, 0.003), 0, sashY, d / 2 - 0.1));
  // header with brand tab + light
  g.add(at(rb(w - 0.1, 0.1, 0.03, M.white, 0.008), 0, y0 + hoodH - 0.12, d / 2 - 0.1));
  g.add(at(rb(w * 0.2, 0.05, 0.006, M.red, 0.003), -w * 0.3, y0 + hoodH - 0.12, d / 2 - 0.082));
  // sink + tap
  g.add(at(rb(0.16, 0.012, 0.2, M.steel, 0.004), w * 0.3, y0 + 0.008, 0.05));
  const tap = cyl(0.008, 0.2, M.steel);
  g.add(at(tap, w * 0.4, y0 + 0.1, -d / 2 + 0.12));
  // control panel (right pillar)
  g.add(at(rb(0.075, 0.2, 0.02, M.offwhite, 0.005), w / 2 - 0.045, y0 + hoodH * 0.5, d / 2 - 0.095));
  g.add(at(cyl(0.012, 0.01, M.ledGreen), w / 2 - 0.045, y0 + hoodH * 0.5 + 0.06, d / 2 - 0.082));
  const sw = (y: number, m: THREE.Material) => {
    const c = cyl(0.014, 0.012, m);
    c.rotation.x = Math.PI / 2;
    g.add(at(c, w / 2 - 0.045, y, d / 2 - 0.083));
  };
  sw(y0 + hoodH * 0.5 + 0.015, M.dark);
  sw(y0 + hoodH * 0.5 - 0.03, M.dark);
  sw(y0 + hoodH * 0.5 - 0.072, M.ledRed);
  // exhaust duct
  g.add(at(cyl(0.11, 0.3, M.steelDark, 36), 0, y0 + hoodH + 0.15, -d * 0.18));
  g.add(at(cyl(0.135, 0.03, M.steel, 36), 0, y0 + hoodH + 0.015, -d * 0.18));
  return g;
}

// ------------------------------------------- family: biosafety / laminar BSC
function safetyCabinet(w = 1.2, laminar = false) {
  const g = new THREE.Group();
  const d = 0.75;
  const standH = 0.62;
  // stand
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      g.add(at(bx(0.04, standH, 0.04, M.white), sx * (w / 2 - 0.05), standH / 2, sz * (d / 2 - 0.05)));
    }
  for (const sz of [-1, 1]) g.add(at(bx(w - 0.1, 0.03, 0.03, M.white), 0, 0.2, sz * (d / 2 - 0.05)));
  for (const sx of [-1, 1]) g.add(at(bx(0.03, 0.03, d - 0.1, M.white), sx * (w / 2 - 0.05), 0.2, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(at(cyl(0.025, 0.04, M.rubber), sx * (w / 2 - 0.05), 0.02, sz * (d / 2 - 0.05)));
  }
  // lower shelf
  g.add(at(rb(w - 0.1, 0.02, d - 0.1, M.offwhite, 0.004), 0, 0.2, 0));

  const bodyY = standH;
  const bodyH = 1.05;
  g.add(at(rb(w, bodyH, d, M.white, 0.012), 0, bodyY + bodyH / 2, 0));
  // work chamber opening (dark interior) and work tray
  const openW = w - 0.14;
  const openH = bodyH * 0.5;
  const openY = bodyY + bodyH * 0.3;
  g.add(at(rb(openW, openH, 0.02, M.interior, 0.004), 0, openY, d / 2 + 0.002));
  g.add(at(rb(openW + 0.02, 0.05, 0.28, M.steel, 0.01), 0, openY - openH / 2 - 0.005, d / 2 - 0.02));
  g.add(at(rb(openW - 0.04, 0.012, d * 0.55, M.steel, 0.004), 0, openY - openH / 2 + 0.03, d / 2 - 0.2));
  // sash glass (angled)
  const gl = rb(openW + 0.02, bodyH * 0.55, 0.01, M.glassStrong, 0.003);
  gl.rotation.x = -0.12;
  g.add(at(gl, 0, openY + 0.04, d / 2 + 0.075));
  // sash frame
  g.add(at(rb(openW + 0.04, 0.045, 0.04, M.steel, 0.008), 0, openY + bodyH * 0.27 + 0.04, d / 2 + 0.06));
  for (const s of [-1, 1]) g.add(at(rb(0.025, bodyH * 0.55, 0.035, M.steel, 0.006), (s * (openW + 0.02)) / 2, openY + 0.04, d / 2 + 0.068));
  // header with display & label
  const hy = bodyY + bodyH - 0.12;
  g.add(at(rb(w - 0.06, 0.16, 0.012, M.offwhite, 0.006), 0, hy, d / 2 + 0.004));
  g.add(at(rb(w * 0.22, 0.045, 0.004, laminar ? M.dark : M.red, 0.002), -w * 0.3, hy + 0.025, d / 2 + 0.012));
  g.add(at(rb(0.2, 0.06, 0.006, M.black, 0.003), w * 0.2, hy, d / 2 + 0.011));
  g.add(at(rb(0.17, 0.035, 0.002, M.screenBlue, 0.001), w * 0.2, hy, d / 2 + 0.0145));
  for (let i = 0; i < 4; i++) g.add(at(cyl(0.011, 0.006, i === 3 ? M.ledRed : M.dark), w * 0.2 - 0.12 + i * 0.07 + 0.2, hy - 0.05, d / 2 + 0.013));
  // top exhaust hood
  g.add(at(rb(w * 0.6, 0.12, d * 0.7, M.white, 0.02), 0, bodyY + bodyH + 0.06, -d * 0.05));
  if (!laminar) g.add(at(cyl(0.09, 0.2, M.steelDark, 32), w * 0.15, bodyY + bodyH + 0.2, -d * 0.1));
  return g;
}

// ------------------------------------------------------- family: water bath
function waterBath(w = 0.52, h = 0.24, d = 0.36, circ = false, tall = false) {
  const g = new THREE.Group();
  const bodyH = tall ? h * 2.4 : h;
  feet(g, w, d, 0.03);
  g.add(at(rb(w, bodyH, d, M.white, 0.016), 0, 0.03 + bodyH / 2, 0));
  g.add(at(rb(w * 1.003, bodyH * 0.2, d * 1.003, M.red, 0.014), 0, 0.03 + bodyH * 0.1, 0));
  // tank recess
  g.add(at(rb(w - 0.06, 0.012, d - 0.06, M.steel, 0.006), 0, 0.03 + bodyH + 0.002, 0));
  g.add(at(rb(w - 0.09, 0.006, d - 0.09, M.interior, 0.004), 0, 0.03 + bodyH + 0.011, 0));
  // control panel front
  g.add(at(rb(w * 0.9, bodyH * 0.38, 0.012, M.offwhite, 0.004), 0, 0.03 + bodyH * 0.58, d / 2 + 0.004));
  g.add(at(rb(w * 0.26, bodyH * 0.2, 0.006, M.black, 0.003), -w * 0.22, 0.03 + bodyH * 0.58, d / 2 + 0.011));
  g.add(at(rb(w * 0.22, bodyH * 0.1, 0.002, M.screenRed, 0.001), -w * 0.22, 0.03 + bodyH * 0.58, d / 2 + 0.0145));
  knob(g, w * 0.12, 0.03 + bodyH * 0.58, d / 2 + 0.008, 0.019);
  g.add(at(cyl(0.007, 0.004, M.ledGreen, 12), w * 0.3, 0.03 + bodyH * 0.58, d / 2 + 0.012));
  // lid (hinged, slightly open) with handle
  const lid = new THREE.Group();
  lid.add(at(rb(w - 0.04, 0.012, d - 0.04, M.steel, 0.006), 0, 0, (d - 0.04) / 2));
  lid.add(at(rb(0.12, 0.016, 0.018, M.steelDark, 0.006), 0, 0.016, d - 0.07));
  lid.position.set(0, 0.03 + bodyH + 0.016, -d / 2 + 0.02);
  lid.rotation.x = -0.34;
  g.add(lid);
  // side handles
  for (const s of [-1, 1]) g.add(at(rb(0.012, 0.03, 0.12, M.steelDark, 0.005), s * (w / 2 + 0.005), 0.03 + bodyH * 0.66, 0));
  if (circ) {
    g.add(at(cyl(0.045, 0.1, M.steelDark, 28), -w / 2 + 0.1, 0.03 + bodyH + 0.055, -d / 2 + 0.07));
  }
  return g;
}

// ---------------------------------------------------------- family: centrifuge
function centrifuge(w = 0.56, h = 0.34, d = 0.62) {
  const g = new THREE.Group();
  feet(g, w, d, 0.03);
  g.add(at(rb(w, h, d, M.white, 0.04), 0, 0.03 + h / 2, 0));
  g.add(at(rb(w * 1.003, h * 0.14, d * 1.003, M.red, 0.03), 0, 0.03 + h * 0.07, 0));
  // lid
  const lidR = Math.min(w, d) * 0.5 - 0.02;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(lidR, lidR, 0.09, 48, 1, false, 0, Math.PI * 2), M.offwhite);
  g.add(at(lid, 0, 0.03 + h + 0.03, -d * 0.1));
  const lidTop = new THREE.Mesh(new THREE.CylinderGeometry(lidR - 0.03, lidR - 0.01, 0.025, 48), M.steel);
  g.add(at(lidTop, 0, 0.03 + h + 0.085, -d * 0.1));
  const win = new THREE.Mesh(new THREE.CylinderGeometry(lidR * 0.4, lidR * 0.4, 0.004, 40), M.glassStrong);
  g.add(at(win, 0, 0.03 + h + 0.0985, -d * 0.1));
  // slanted control panel at front
  const panel = rb(w * 0.9, h * 0.5, 0.02, M.offwhite, 0.008);
  panel.rotation.x = -0.12;
  g.add(at(panel, 0, 0.03 + h * 0.55, d / 2 + 0.004));
  g.add(at(rb(w * 0.34, h * 0.28, 0.006, M.black, 0.003), -w * 0.16, 0.03 + h * 0.58, d / 2 + 0.016));
  g.add(at(rb(w * 0.28, h * 0.17, 0.002, M.screenBlue, 0.001), -w * 0.16, 0.03 + h * 0.58, d / 2 + 0.0195));
  knob(g, w * 0.22, 0.03 + h * 0.58, d / 2 + 0.012, 0.022);
  g.add(at(cyl(0.012, 0.01, M.ledRed, 18), w * 0.34, 0.03 + h * 0.46, d / 2 + 0.014));
  return g;
}

// ------------------------------------------------------ family: muffle furnace
function furnace(w = 0.42, h = 0.46, d = 0.5) {
  const g = new THREE.Group();
  feet(g, w, d, 0.03);
  const baseH = h * 0.4;
  g.add(at(rb(w, baseH, d, M.red, 0.012), 0, 0.03 + baseH / 2, 0));
  const topH = h - baseH;
  g.add(at(rb(w * 0.96, topH, d * 0.96, M.white, 0.016), 0, 0.03 + baseH + topH / 2, 0));
  // door + handle
  g.add(at(rb(w * 0.82, topH * 0.74, 0.02, M.offwhite, 0.01), 0, 0.03 + baseH + topH * 0.45, d * 0.48 + 0.006));
  g.add(at(rb(0.026, topH * 0.46, 0.03, M.black, 0.01), w * 0.31, 0.03 + baseH + topH * 0.45, d * 0.48 + 0.03));
  // display
  g.add(at(rb(w * 0.52, baseH * 0.42, 0.01, M.black, 0.004), -w * 0.12, 0.03 + baseH * 0.55, d / 2 + 0.003));
  g.add(at(rb(w * 0.44, baseH * 0.26, 0.002, M.screenRed, 0.001), -w * 0.12, 0.03 + baseH * 0.55, d / 2 + 0.0085));
  g.add(at(cyl(0.013, 0.006, M.dark), w * 0.3, 0.03 + baseH * 0.55, d / 2 + 0.006));
  // exhaust
  g.add(at(cyl(0.025, 0.03, M.steelDark, 20), 0, 0.03 + h + 0.015, -d * 0.2));
  // brand tab
  g.add(at(rb(w * 0.22, 0.03, 0.004, M.red, 0.002), -w * 0.25, 0.03 + h - 0.02, d * 0.48 + 0.018));
  return g;
}

// ------------------------------------------------------------------- catalogue
export interface ModelSpec {
  slug: string;
  build: () => THREE.Group;
}

export const MODELS: ModelSpec[] = [
  { slug: "nin-110", build: () => cabinet({ w: 0.56, h: 0.78, d: 0.52, window: true, shelves: 2 }) },
  { slug: "nsi-250", build: () => cabinet({ w: 0.64, h: 1.1, d: 0.62, window: true, cooler: true, shelves: 3 }) },
  { slug: "nci-100", build: () => cabinet({ w: 0.62, h: 0.82, d: 0.6, window: true, shelves: 2, accent: M.darkred }) },
  { slug: "nst-120", build: () => cabinet({ w: 0.66, h: 0.72, d: 0.62, window: true, shelves: 2 }) },
  { slug: "nst-400", build: () => cabinet({ w: 0.9, h: 1.55, d: 0.78, window: false, tallDoor: true }) },
  { slug: "nve-50", build: () => cabinet({ w: 0.54, h: 0.6, d: 0.56, window: true, shelves: 2, gauge: true }) },
  { slug: "nit-250", build: () => cabinet({ w: 0.72, h: 1.7, d: 0.76, window: true, cooler: true, shelves: 4, tallDoor: true }) },
  { slug: "nbk-300", build: () => cabinet({ w: 0.7, h: 1.75, d: 0.72, window: true, cooler: true, shelves: 5, tallDoor: true, accent: M.darkred }) },
  { slug: "nkf-12", build: () => furnace() },
  { slug: "nco-t", build: () => fumeHood(0.9, true) },
  { slug: "nco-s", build: () => fumeHood(1.2) },
  { slug: "nco-p", build: () => fumeHood(1.5) },
  { slug: "ngk-120", build: () => safetyCabinet(1.2, false) },
  { slug: "nlf-90", build: () => safetyCabinet(0.9, true) },
  { slug: "nks-2", build: () => cabinet({ w: 0.9, h: 1.8, d: 0.45, window: false, doubleDoor: true, tallDoor: true, shelves: 0 }) },
  { slug: "nbs-20", build: () => waterBath(0.58, 0.28, 0.42, true, true) },
  { slug: "nsb-12", build: () => waterBath(0.5, 0.2, 0.34) },
  { slug: "nss-20", build: () => waterBath(0.62, 0.24, 0.4, true) },
  { slug: "nsf-60", build: () => centrifuge() },
];

// -------------------------------------------------------------------- pipeline
async function exportGlb(group: THREE.Group): Promise<Uint8Array> {
  const scene = new THREE.Scene();
  scene.add(group);
  const exporter = new GLTFExporter();
  const result = await new Promise<ArrayBuffer | object>((res, rej) => exporter.parse(scene, res, rej, { binary: true }));
  return new Uint8Array(result as ArrayBuffer);
}

async function main() {
  const out = join(process.cwd(), "public", "models");
  mkdirSync(out, { recursive: true });
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "draco3d.encoder": await draco3d.createEncoderModule(),
      "draco3d.decoder": await draco3d.createDecoderModule(),
    });
  void KHRDracoMeshCompression;

  let rawTotal = 0;
  let compTotal = 0;
  for (const m of MODELS) {
    const glb = await exportGlb(m.build());
    const doc = await io.readBinary(glb);
    await doc.transform(dedup(), weld(), prune(), draco({ method: "edgebreaker", quantizePosition: 14, quantizeNormal: 10 }));
    const bin = await io.writeBinary(doc);
    writeFileSync(join(out, `${m.slug}.glb`), bin);
    rawTotal += glb.byteLength;
    compTotal += bin.byteLength;
    console.log(`${m.slug.padEnd(10)} ${(glb.byteLength / 1024).toFixed(0).padStart(5)} KB → ${(bin.byteLength / 1024).toFixed(0).padStart(4)} KB`);
  }
  console.log(`total ${(rawTotal / 1024).toFixed(0)} KB → ${(compTotal / 1024).toFixed(0)} KB (${MODELS.length} models)`);
  void readFileSync;
  void statSync;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
