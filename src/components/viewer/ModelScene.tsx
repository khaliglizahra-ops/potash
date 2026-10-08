/* eslint-disable react-hooks/immutability -- three.js objects (camera, controls, scene) are mutable by design */
"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { withBase } from "@/lib/demo";

useGLTF.setDecoderPath(withBase("/draco/"));

export interface SceneHandle {
  reset: () => void;
  zoom: (factor: number) => void;
}

interface Props {
  url: string;
  autoRotate: boolean;
  onReady: () => void;
  onInteract: () => void;
}

interface Fit {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  dist: number;
}

// Minimal structural type for the bits of OrbitControls we touch.
interface Orbit {
  target: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  update: () => boolean;
}

/** Loads the GLB, stands it on y=0, and frames it. Also exposes reset/zoom. */
function Stage({ url, onReady, handle, controls }: { url: string; onReady: () => void; handle: React.Ref<SceneHandle>; controls: React.RefObject<Orbit | null> }) {
  const { scene } = useGLTF(withBase(url));
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const fit = useRef<Fit | null>(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    scene.position.set(-center.x, -box.min.y, -center.z);

    const target = new THREE.Vector3(0, size.y / 2, 0);
    const radius = Math.max(size.x, size.y, size.z) * 0.5 * 1.4;
    const dist = radius / Math.sin((camera.fov * Math.PI) / 360);
    const pos = target.clone().add(new THREE.Vector3(0.62, 0.3, 1).normalize().multiplyScalar(dist));
    camera.position.copy(pos);
    camera.near = dist / 50;
    camera.far = dist * 20;
    camera.updateProjectionMatrix();
    fit.current = { pos, target, dist };

    const c = controls.current;
    if (c) {
      c.target.copy(target);
      c.minDistance = dist * 0.35;
      c.maxDistance = dist * 2.2;
      c.update();
    }
    invalidate();
    onReady();
  }, [scene, camera, controls, invalidate, onReady]);

  useImperativeHandle(
    handle,
    () => ({
      reset: () => {
        const f = fit.current;
        const c = controls.current;
        if (!f || !c) return;
        camera.position.copy(f.pos);
        c.target.copy(f.target);
        c.update();
        invalidate();
      },
      zoom: (factor: number) => {
        const c = controls.current;
        if (!c) return;
        const dir = camera.position.clone().sub(c.target);
        const len = THREE.MathUtils.clamp(dir.length() * factor, c.minDistance, c.maxDistance);
        camera.position.copy(c.target.clone().add(dir.setLength(len)));
        c.update();
        invalidate();
      },
    }),
    [camera, controls, invalidate],
  );

  return <primitive object={scene} />;
}

export const ModelScene = forwardRef<SceneHandle, Props>(function ModelScene({ url, autoRotate, onReady, onInteract }, ref) {
  const controls = useRef<Orbit | null>(null);

  return (
    <Canvas
      frameloop={autoRotate ? "always" : "demand"}
      dpr={[1, 1.75]}
      camera={{ fov: 32, position: [2, 1, 3] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} position={[-5, 1.5, 1]} scale={[4, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.0} position={[5, 1.5, 2]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.8} position={[0, 1, -5]} scale={[10, 5, 1]} />
        <Lightformer form="circle" color="#ff3b57" intensity={0.5} position={[0, -1, 4]} scale={3} />
      </Environment>
      <Suspense fallback={null}>
        <Stage url={url} onReady={onReady} handle={ref} controls={controls} />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.38} scale={6} blur={2.6} far={1.6} resolution={512} frames={1} color="#2a0a10" />
      </Suspense>
      <OrbitControls
        ref={controls as never}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.85}
        zoomSpeed={0.8}
        autoRotate={autoRotate}
        autoRotateSpeed={2.2}
        maxPolarAngle={Math.PI * 0.52}
        onStart={onInteract}
      />
    </Canvas>
  );
});
