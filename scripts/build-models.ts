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

// ================================================================ more families
const glassTube = (r: number, h: number, g = M.glass) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24, 1, true), g);
const sphere = (r: number, m: THREE.Material) => new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), m);
const dome = (r: number, m: THREE.Material) => new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), m);
const torus = (R: number, r: number, m: THREE.Material, arc = Math.PI * 2) => new THREE.Mesh(new THREE.TorusGeometry(R, r, 12, 40, arc), m);
const rodY = (r: number, h: number, m: THREE.Material) => cyl(r, h, m, 16);
const panelFront = (g: THREE.Group, x: number, y: number, z: number, w: number, h: number, screen: THREE.Material = M.screenBlue) => {
  g.add(at(rb(w, h, 0.008, M.black, 0.003), x, y, z));
  g.add(at(rb(w * 0.86, h * 0.72, 0.002, screen, 0.001), x, y, z + 0.0055));
};

function row(n: number, gap: number, build: () => THREE.Group) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) g.add(at(build(), (i - (n - 1) / 2) * gap, 0, 0));
  return g;
}

function ultrasonicBath(w = 0.3, h = 0.2, d = 0.17) {
  const g = new THREE.Group();
  feet(g, w, d, 0.02);
  g.add(at(rb(w, h, d, M.steel, 0.012), 0, 0.02 + h / 2, 0));
  g.add(at(rb(w - 0.03, 0.01, d - 0.03, M.interior, 0.004), 0, 0.02 + h + 0.002, 0));
  g.add(at(rb(w - 0.05, 0.006, d - 0.05, M.steelDark, 0.003), 0, 0.02 + h - 0.002, 0));
  g.add(at(rb(w * 0.9, h * 0.4, 0.01, M.white, 0.004), 0, 0.02 + h * 0.3, d / 2 + 0.003));
  knob(g, -w * 0.28, 0.02 + h * 0.3, d / 2, 0.016);
  knob(g, w * 0.02, 0.02 + h * 0.3, d / 2, 0.016);
  g.add(at(rb(0.06, 0.03, 0.004, M.screenRed, 0.002), w * 0.28, 0.02 + h * 0.3, d / 2 + 0.009));
  for (const s of [-1, 1]) g.add(at(rb(0.012, 0.012, 0.07, M.dark, 0.004), s * (w / 2 + 0.003), 0.02 + h * 0.85, 0));
  const lid = rb(w - 0.01, 0.006, d - 0.01, M.steel, 0.003);
  lid.rotation.x = -0.55;
  g.add(at(lid, 0, 0.02 + h + 0.05, -d / 2 + 0.06));
  return g;
}

function uvTower() {
  const g = new THREE.Group();
  const w = 0.36, d = 0.3, h = 1.1;
  g.add(at(rb(w, h, d, M.white, 0.03), 0, 0.06 + h / 2, 0));
  g.add(at(rb(w * 1.01, 0.1, d * 1.01, M.red, 0.025), 0, 0.11, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(cyl(0.03, 0.04, M.rubber), sx * 0.13, 0.02, sz * 0.1));
  for (let i = 0; i < 14; i++) g.add(at(bx(w * 0.62, 0.008, 0.006, M.dark), 0, 0.62 + i * 0.026, d / 2 + 0.002));
  g.add(at(rb(0.05, 0.4, 0.01, mat("#7a5cff", 0.3, 0, { emissive: new THREE.Color("#8a6bff"), emissiveIntensity: 0.9 }), 0.004), 0, 0.42, d / 2 + 0.002));
  panelFront(g, 0, 1.0, d / 2 + 0.002, 0.2, 0.08, M.screenRed);
  g.add(at(rb(w * 0.8, 0.012, d * 0.8, M.steelDark, 0.005), 0, 0.06 + h + 0.004, 0));
  return g;
}

function handKiosk() {
  const g = new THREE.Group();
  const w = 0.4, d = 0.32;
  g.add(at(rb(0.46, 0.04, 0.4, M.dark, 0.012), 0, 0.02, 0));
  g.add(at(rb(0.3, 1.0, 0.22, M.white, 0.02), 0, 0.54, -0.02));
  const head = rb(w, 0.34, d, M.white, 0.03);
  head.rotation.x = -0.12;
  g.add(at(head, 0, 1.2, 0.0));
  g.add(at(rb(w * 0.8, 0.16, 0.02, M.black, 0.01), 0, 1.3, d / 2 - 0.01));
  g.add(at(rb(w * 0.7, 0.1, 0.004, M.screenBlue, 0.002), 0, 1.3, d / 2 + 0.003));
  g.add(at(rb(w * 0.8, 0.1, 0.1, mat("#d9ecf3", 0.1, 0, { transparent: true, opacity: 0.35, depthWrite: false }), 0.02), 0, 1.13, d / 2 - 0.03));
  g.add(at(rb(0.2, 0.012, 0.06, M.ledRed, 0.004), 0, 1.15, d / 2 - 0.03));
  g.add(at(rb(0.12, 0.05, 0.004, M.red, 0.002), -0.08, 0.78, 0.095));
  return g;
}

function turbidimeter() {
  const g = new THREE.Group();
  const body = rb(0.095, 0.2, 0.055, M.offwhite, 0.02);
  body.rotation.z = 0.0;
  g.add(at(body, -0.06, 0.1 + 0.002, 0));
  g.add(at(rb(0.075, 0.07, 0.006, M.black, 0.004), -0.06, 0.15, 0.028));
  g.add(at(rb(0.06, 0.04, 0.002, mat("#cfe0c8", 0.3, 0, { emissive: new THREE.Color("#a9c79a"), emissiveIntensity: 0.4 }), 0.001), -0.06, 0.15, 0.032));
  for (let i = 0; i < 4; i++) g.add(at(cyl(0.011, 0.006, i === 3 ? M.red : M.dark, 18), -0.085 + (i % 2) * 0.05, 0.085 - Math.floor(i / 2) * 0.035, 0.03));
  const cap = rb(0.095, 0.03, 0.055, M.dark, 0.012);
  g.add(at(cap, -0.06, 0.205, 0));
  for (let i = 0; i < 3; i++) {
    const x = 0.05 + i * 0.045, z = (i % 2) * 0.02;
    g.add(at(cyl(0.017, 0.07, mat("#e9f3f0", 0.05, 0, { transparent: true, opacity: 0.4, depthWrite: false })), x, 0.035, z));
    g.add(at(cyl(0.018, 0.016, M.white), x, 0.078, z));
  }
  return g;
}

function digitalBurette() {
  const g = new THREE.Group();
  g.add(at(cyl(0.07, 0.2, mat("#d9ecf3", 0.05, 0, { transparent: true, opacity: 0.4, depthWrite: false }), 36), 0, 0.1, 0));
  g.add(at(cyl(0.025, 0.05, M.glass), 0, 0.225, 0));
  g.add(at(rb(0.06, 0.1, 0.06, M.offwhite, 0.012), 0, 0.3, 0));
  g.add(at(rb(0.05, 0.035, 0.004, M.screenBlue, 0.002), 0, 0.325, 0.031));
  g.add(at(cyl(0.017, 0.012, M.dark, 20), 0.04, 0.29, 0));
  const r = cyl(0.008, 0.06, M.steel); r.rotation.z = Math.PI / 2;
  g.add(at(r, 0.05, 0.29, 0));
  g.add(at(cyl(0.005, 0.2, M.glass), -0.035, 0.12, 0.0));
  g.add(at(cyl(0.012, 0.03, M.white), 0, 0.37, 0));
  return g;
}

function kjeldahl() {
  const g = new THREE.Group();
  g.add(at(rb(0.62, 0.12, 0.34, M.white, 0.012), 0, 0.06, 0));
  g.add(at(rb(0.64, 0.025, 0.36, M.red, 0.008), 0, 0.013, 0));
  panelFront(g, -0.16, 0.06, 0.171, 0.16, 0.06, M.screenRed);
  knob(g, 0.2, 0.06, 0.168, 0.016);
  g.add(at(rb(0.46, 0.05, 0.26, M.steelDark, 0.01), -0.06, 0.145, 0));
  for (let i = 0; i < 6; i++) {
    const x = -0.26 + i * 0.08;
    g.add(at(glassTube(0.026, 0.3), x, 0.32, 0));
    g.add(at(cyl(0.024, 0.01, M.white), x, 0.47, 0));
  }
  for (const sx of [-1, 1]) g.add(at(rodY(0.008, 0.42, M.steel), sx * 0.3, 0.33, -0.12));
  g.add(at(bx(0.62, 0.012, 0.012, M.steel), 0, 0.5, -0.12));
  g.add(at(glassTube(0.035, 0.38), 0.4, 0.2, 0.0));
  g.add(at(sphere(0.06, M.glass), 0.4, 0.06, 0));
  return g;
}

function soxhlet() {
  const g = new THREE.Group();
  g.add(at(rb(0.78, 0.09, 0.26, M.white, 0.012), 0, 0.045, 0));
  g.add(at(rb(0.8, 0.02, 0.27, M.darkred, 0.006), 0, 0.01, 0));
  for (let i = 0; i < 4; i++) {
    const x = -0.28 + i * 0.187;
    knob(g, x, 0.045, 0.13, 0.014);
    g.add(at(cyl(0.065, 0.025, M.steelDark, 28), x, 0.1, 0));
    g.add(at(sphere(0.06, M.glass), x, 0.19, 0));
    g.add(at(glassTube(0.03, 0.22), x, 0.34, 0));
    g.add(at(glassTube(0.02, 0.26), x, 0.57, 0));
    g.add(at(cyl(0.022, 0.014, M.white), x, 0.71, 0));
    const t = torus(0.03, 0.004, M.steel); t.rotation.x = Math.PI / 2; g.add(at(t, x, 0.5, 0));
  }
  for (const sx of [-1, 1]) g.add(at(rodY(0.009, 0.7, M.steel), sx * 0.36, 0.4, -0.1));
  g.add(at(bx(0.74, 0.014, 0.014, M.steel), 0, 0.74, -0.1));
  g.add(at(bx(0.74, 0.014, 0.014, M.steel), 0, 0.42, -0.1));
  return g;
}

function glutenWasher() {
  const g = new THREE.Group();
  g.add(at(rb(0.46, 0.34, 0.32, M.offwhite, 0.04), 0, 0.17, 0));
  g.add(at(rb(0.47, 0.06, 0.33, M.red, 0.03), 0, 0.03, 0));
  for (const x of [-0.11, 0.11]) {
    g.add(at(cyl(0.075, 0.1, M.steel, 36), x, 0.39, -0.02));
    g.add(at(cyl(0.062, 0.02, M.interior, 36), x, 0.445, -0.02));
  }
  for (let i = 0; i < 4; i++) g.add(at(cyl(0.015, 0.01, [M.ledGreen, M.dark, M.ledRed, M.dark][i], 20), -0.13 + i * 0.087, 0.2, 0.162));
  g.add(at(rb(0.12, 0.08, 0.004, M.screenRed, 0.002), 0, 0.28, 0.162));
  return g;
}

function thermoreactor() {
  const g = new THREE.Group();
  feet(g, 0.36, 0.28, 0.02);
  g.add(at(rb(0.38, 0.13, 0.3, M.white, 0.02), 0, 0.085, 0));
  g.add(at(rb(0.385, 0.03, 0.305, M.red, 0.012), 0, 0.04, 0));
  g.add(at(rb(0.3, 0.02, 0.2, M.steel, 0.008), 0, 0.159, -0.03));
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) g.add(at(cyl(0.013, 0.012, M.black, 16), -0.112 + i * 0.056, 0.168, -0.1 + j * 0.043));
  panelFront(g, -0.08, 0.085, 0.151, 0.14, 0.06, M.screenRed);
  knob(g, 0.11, 0.085, 0.148, 0.014);
  return g;
}

function sedimentation() {
  const g = new THREE.Group();
  g.add(at(rb(0.6, 0.04, 0.24, M.offwhite, 0.01), 0, 0.02, 0));
  g.add(at(rb(0.61, 0.014, 0.245, M.red, 0.005), 0, 0.007, 0));
  for (const x of [-0.17, 0.17]) {
    g.add(at(cyl(0.05, 0.02, M.steel), x, 0.05, 0));
    g.add(at(glassTube(0.034, 0.42), x, 0.26, 0));
    g.add(at(cyl(0.033, 0.03, M.rubber), x, 0.485, 0));
    for (let i = 0; i < 6; i++) g.add(at(bx(0.002, 0.002, 0.03, M.black), x + 0.036, 0.1 + i * 0.065, 0));
  }
  g.add(at(rb(0.14, 0.09, 0.07, M.white, 0.012), 0, 0.085, 0.06));
  panelFront(g, 0, 0.095, 0.098, 0.1, 0.045, M.screenRed);
  return g;
}

function photometer(w = 0.32, h = 0.12, d = 0.28, big = false) {
  const g = new THREE.Group();
  feet(g, w, d, 0.015);
  g.add(at(rb(w, h, d, M.white, 0.025), 0, 0.015 + h / 2, 0));
  g.add(at(rb(w * 1.005, 0.018, d * 1.005, M.red, 0.01), 0, 0.024, 0));
  const lid = rb(w * 0.34, 0.03, d * 0.46, M.offwhite, 0.012);
  g.add(at(lid, w * 0.24, 0.015 + h + 0.012, -d * 0.1 - (big ? 0.0 : 0.0)));
  const tilt = rb(w * 0.62, 0.012, d * 0.34, M.offwhite, 0.005);
  tilt.rotation.x = -0.3;
  g.add(at(tilt, -w * 0.16, 0.015 + h * 0.9, d * 0.28));
  g.add(at(rb(w * 0.3, 0.06, 0.006, M.black, 0.004), -w * 0.2, 0.015 + h * 0.98, d * 0.24));
  g.add(at(rb(w * 0.26, 0.044, 0.002, M.screenBlue, 0.001), -w * 0.2, 0.015 + h * 0.98, d * 0.2445));
  for (let i = 0; i < 8; i++) g.add(at(cyl(0.007, 0.004, M.dark, 14), -w * 0.34 + (i % 4) * 0.03, 0.015 + h * 0.85 - Math.floor(i / 4) * 0.016, d * 0.33));
  return g;
}

function mill() {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = rodY(0.013, 0.5, M.steel);
    leg.rotation.z = sx * 0.12;
    g.add(at(leg, sx * 0.14, 0.25, sz * 0.1));
  }
  g.add(at(rb(0.34, 0.025, 0.26, M.steelDark, 0.008), 0, 0.5, 0));
  g.add(at(rb(0.22, 0.2, 0.2, M.white, 0.02), 0, 0.62, 0));
  g.add(at(cyl(0.1, 0.02, M.steel), 0, 0.73, 0));
  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.035, 0.18, 28, 1, true), M.steel);
  g.add(at(hopper, 0, 0.83, 0));
  g.add(at(cyl(0.012, 0.1, M.darkred), 0.12, 0.6, 0.05));
  g.add(at(cyl(0.05, 0.1, M.glass), 0, 0.34, 0));
  g.add(at(cyl(0.052, 0.012, M.steel), 0, 0.395, 0));
  g.add(at(rb(0.05, 0.02, 0.01, M.red, 0.004), -0.06, 0.62, 0.103));
  return g;
}

function waterPurifier() {
  const g = new THREE.Group();
  g.add(at(rb(0.34, 0.14, 0.36, M.offwhite, 0.02), 0, 0.07, 0.0));
  g.add(at(rb(0.3, 0.6, 0.26, M.white, 0.025), -0.02, 0.44, -0.04));
  g.add(at(rb(0.3, 0.05, 0.27, M.red, 0.012), -0.02, 0.16, -0.04));
  panelFront(g, -0.02, 0.62, 0.095, 0.2, 0.09, M.screenBlue);
  for (let i = 0; i < 3; i++) g.add(at(cyl(0.025, 0.2, i === 2 ? M.steelDark : M.glass), -0.1 + i * 0.08, 0.35, 0.1));
  const arm = rb(0.03, 0.03, 0.22, M.offwhite, 0.01);
  g.add(at(arm, -0.02, 0.76, 0.12));
  g.add(at(cyl(0.012, 0.1, M.steel), -0.02, 0.69, 0.22));
  g.add(at(cyl(0.05, 0.12, M.glass), -0.02, 0.2, 0.22));
  return g;
}

function sieveShaker() {
  const g = new THREE.Group();
  feet(g, 0.3, 0.3, 0.02);
  g.add(at(rb(0.34, 0.1, 0.32, M.white, 0.02), 0, 0.07, 0));
  g.add(at(rb(0.345, 0.02, 0.325, M.red, 0.01), 0, 0.03, 0));
  panelFront(g, 0, 0.075, 0.161, 0.16, 0.05, M.screenRed);
  for (let i = 0; i < 5; i++) {
    const y = 0.15 + i * 0.065;
    g.add(at(cyl(0.1, 0.05, M.steel, 40), 0, y, 0));
    g.add(at(cyl(0.092, 0.052, M.interior, 40), 0, y, 0));
    g.add(at(cyl(0.101, 0.012, M.steelDark, 40), 0, y + 0.03, 0));
  }
  g.add(at(cyl(0.1, 0.03, M.steelDark, 40), 0, 0.51, 0));
  for (const sx of [-1, 1]) g.add(at(rodY(0.006, 0.4, M.steel), sx * 0.11, 0.32, 0));
  g.add(at(bx(0.24, 0.012, 0.03, M.dark), 0, 0.53, 0));
  return g;
}

function hotPlate() {
  const g = new THREE.Group();
  feet(g, 0.46, 0.26, 0.015);
  g.add(at(rb(0.5, 0.08, 0.3, M.white, 0.015), 0, 0.055, 0));
  g.add(at(rb(0.505, 0.02, 0.305, M.red, 0.008), 0, 0.025, 0));
  g.add(at(rb(0.52, 0.025, 0.32, mat("#d8dadc", 0.3, 0.1), 0.01), 0, 0.108, 0));
  g.add(at(rb(0.46, 0.006, 0.26, mat("#2b2e32", 0.2, 0.1), 0.004), 0, 0.124, 0));
  knob(g, -0.14, 0.055, 0.15, 0.02);
  knob(g, 0.14, 0.055, 0.15, 0.02);
  g.add(at(cyl(0.008, 0.004, M.ledRed, 12), 0, 0.075, 0.153));
  return g;
}

function stirrerStand() {
  const g = new THREE.Group();
  g.add(at(rb(0.22, 0.05, 0.2, M.white, 0.012), 0, 0.025, 0));
  g.add(at(rb(0.225, 0.014, 0.205, M.red, 0.006), 0, 0.009, 0));
  knob(g, 0.0, 0.025, 0.1, 0.016);
  g.add(at(rodY(0.007, 0.55, M.steel), -0.09, 0.325, -0.07));
  g.add(at(rb(0.11, 0.1, 0.09, M.offwhite, 0.015), -0.04, 0.5, -0.04));
  g.add(at(rodY(0.005, 0.28, M.steelDark), -0.04, 0.31, -0.04));
  const blade = rb(0.1, 0.004, 0.02, M.steel, 0.002);
  g.add(at(blade, -0.04, 0.17, -0.04));
  g.add(at(rb(0.012, 0.012, 0.09, M.dark, 0.004), -0.065, 0.46, -0.055));
  g.add(at(cyl(0.05, 0.13, M.glass), -0.04, 0.115, -0.04));
  return g;
}

function heatingMantle() {
  const g = new THREE.Group();
  g.add(at(cyl(0.1, 0.07, M.white, 40), 0, 0.035, 0));
  g.add(at(cyl(0.101, 0.014, M.steelDark, 40), 0, 0.01, 0));
  g.add(at(dome(0.092, mat("#e7e1d2", 0.9, 0)), 0, 0.07, 0));
  const inner = dome(0.078, mat("#bdb6a6", 0.95, 0));
  inner.scale.set(1, -1, 1);
  g.add(at(inner, 0, 0.15, 0));
  g.add(at(rb(0.05, 0.05, 0.05, M.dark, 0.012), 0, 0.04, 0.115));
  knob(g, 0, 0.04, 0.138, 0.016);
  g.add(at(cyl(0.004, 0.2, M.rubber), 0.07, 0.03, -0.17).rotateX(Math.PI / 2));
  return g;
}

function peristaltic() {
  const g = new THREE.Group();
  feet(g, 0.22, 0.2, 0.012);
  g.add(at(rb(0.26, 0.17, 0.22, M.white, 0.02), 0, 0.097, 0));
  g.add(at(rb(0.265, 0.025, 0.225, M.red, 0.01), 0, 0.03, 0));
  panelFront(g, -0.04, 0.12, 0.111, 0.13, 0.07, M.screenBlue);
  knob(g, 0.075, 0.12, 0.108, 0.018);
  const head = cyl(0.07, 0.07, mat("#e8f2f6", 0.1, 0, { transparent: true, opacity: 0.55, depthWrite: false }), 40);
  head.rotation.x = Math.PI / 2;
  g.add(at(head, 0.0, 0.185, 0.0));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const r = cyl(0.014, 0.075, M.steel, 16);
    r.rotation.x = Math.PI / 2;
    g.add(at(r, Math.cos(a) * 0.04, 0.185 + Math.sin(a) * 0.04, 0));
  }
  const tube = torus(0.055, 0.007, mat("#f3f1ea", 0.5, 0), Math.PI * 1.3);
  tube.rotation.z = Math.PI * 0.85;
  g.add(at(tube, 0, 0.185, 0.0));
  return g;
}

function vacuumPump() {
  const g = new THREE.Group();
  g.add(at(rb(0.34, 0.03, 0.17, M.steel, 0.008), 0, 0.015, 0));
  for (const x of [-0.09, 0.09]) {
    const motor = cyl(0.046, 0.15, M.steelDark, 32);
    motor.rotation.z = Math.PI / 2;
    g.add(at(motor, x, 0.085, 0));
    for (let i = 0; i < 5; i++) {
      const fin = cyl(0.054, 0.006, M.steel, 32);
      fin.rotation.z = Math.PI / 2;
      g.add(at(fin, x - 0.06 + i * 0.03, 0.085, 0));
    }
    g.add(at(rb(0.07, 0.09, 0.09, M.white, 0.01), x, 0.17, 0));
    g.add(at(rb(0.072, 0.02, 0.092, M.red, 0.006), x, 0.13, 0));
  }
  const handle = torus(0.07, 0.007, M.steel, Math.PI);
  g.add(at(handle, 0, 0.17, 0));
  g.add(at(cyl(0.03, 0.02, M.white, 28), 0, 0.2, 0.09));
  g.add(at(cyl(0.008, 0.06, M.steel, 12), -0.01, 0.2, 0.1));
  return g;
}

function sieveSet() {
  const g = new THREE.Group();
  const sv = (x: number, z: number, r: number, h: number, col: THREE.Material) => {
    g.add(at(cyl(r, h, M.steel, 40), x, h / 2, z));
    g.add(at(cyl(r - 0.003, 0.006, col, 40), x, h * 0.55, z));
    g.add(at(cyl(r + 0.004, 0.008, M.steelDark, 40), x, h, z));
  };
  sv(-0.15, 0, 0.1, 0.05, mat("#c9a24a", 0.4, 0.8));
  sv(0.1, 0.05, 0.1, 0.05, mat("#a9afb4", 0.4, 0.9));
  sv(0.0, -0.12, 0.1, 0.05, mat("#d7b86a", 0.4, 0.8));
  return g;
}

function labBench() {
  const g = new THREE.Group();
  const W = 1.8, D = 0.75, H = 0.86;
  g.add(at(rb(W + 0.04, 0.04, D + 0.04, M.worktop, 0.008), 0, H, 0));
  for (let i = 0; i < 3; i++) {
    const x = -W / 3 + i * (W / 3);
    g.add(at(rb(W / 3 - 0.02, H - 0.1, D - 0.04, M.white, 0.01), x, (H - 0.1) / 2 + 0.06, 0));
    g.add(at(rb(W / 3 - 0.06, H - 0.18, 0.016, M.offwhite, 0.006), x, (H - 0.1) / 2 + 0.06, D / 2 - 0.02));
    g.add(at(rodY(0.007, 0.16, M.steel), x + 0.1, (H - 0.1) / 2 + 0.14, D / 2 + 0.01));
  }
  g.add(at(bx(W, 0.06, D - 0.04, M.dark), 0, 0.03, 0));
  // reagent shelf frame
  for (const x of [-W / 2 + 0.04, 0, W / 2 - 0.04]) g.add(at(rodY(0.016, 0.8, M.steel), x, H + 0.42, -D / 2 + 0.06));
  for (const y of [H + 0.52, H + 0.8]) g.add(at(rb(W - 0.04, 0.025, 0.2, M.white, 0.006), 0, y, -D / 2 + 0.1));
  for (let i = 0; i < 9; i++) g.add(at(cyl(0.025, 0.12, i % 3 === 0 ? M.glass : i % 3 === 1 ? mat("#c97a2e", 0.2, 0, { transparent: true, opacity: 0.6, depthWrite: false }) : M.glass), -0.75 + i * 0.19, H + 0.595, -D / 2 + 0.1));
  // sink + tap
  g.add(at(rb(0.4, 0.016, 0.3, M.steel, 0.006), 0.45, H + 0.028, 0.0));
  const spout = torus(0.07, 0.008, M.steel, Math.PI);
  g.add(at(spout, 0.45, H + 0.15, -0.2));
  g.add(at(rodY(0.01, 0.14, M.steel), 0.45, H + 0.1, -0.27));
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
  { slug: "jsr-iklimlendirme", build: () => row(4, 0.62, () => cabinet({ w: 0.56, h: 1.6, d: 0.6, window: true, cooler: true, shelves: 3, tallDoor: true })) },
  { slug: "nlh-120", build: () => safetyCabinet(1.2, true) },
  { slug: "nub-6", build: () => ultrasonicBath() },
  { slug: "nuv-c", build: () => uvTower() },
  { slug: "nuv-h", build: () => handKiosk() },
  { slug: "ntb-1", build: () => turbidimeter() },
  { slug: "ndb-1", build: () => digitalBurette() },
  { slug: "nap-6", build: () => kjeldahl() },
  { slug: "nyc-100", build: () => soxhlet() },
  { slug: "ngy-10", build: () => glutenWasher() },
  { slug: "ntc-01", build: () => thermoreactor() },
  { slug: "nsd-4", build: () => sedimentation() },
  { slug: "rayto-rt-9200", build: () => photometer(0.32, 0.12, 0.28) },
  { slug: "uv-vis-u5100", build: () => photometer(0.52, 0.22, 0.46, true) },
  { slug: "nbo-1", build: () => mill() },
  { slug: "nsu-1", build: () => waterPurifier() },
  { slug: "retsch-as200", build: () => sieveShaker() },
  { slug: "nhp-1", build: () => hotPlate() },
  { slug: "nmk-1", build: () => stirrerStand() },
  { slug: "nbi-1", build: () => heatingMantle() },
  { slug: "npp-1", build: () => peristaltic() },
  { slug: "as-30", build: () => vacuumPump() },
  { slug: "elek-seti", build: () => sieveSet() },
  { slug: "tezgah-sistemleri", build: () => labBench() },
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
