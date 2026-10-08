"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";

useGLTF.setDecoderPath("/draco/");

function Shot({ name, onDone }: { name: string; onDone: () => void }) {
  const { scene } = useGLTF(`/models/${name}.glb`);
  const { camera, gl, invalidate } = useThree();
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    scene.position.set(-c.x, -box.min.y, -c.z);
    const target = new THREE.Vector3(0, size.y / 2, 0);
    const cam = camera as THREE.PerspectiveCamera;
    const dist = (Math.max(size.x, size.y, size.z) * 0.5 * 1.45) / Math.sin((cam.fov * Math.PI) / 360);
    cam.position.copy(target.clone().add(new THREE.Vector3(0.55, 0.28, 1).normalize().multiplyScalar(dist)));
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    invalidate();
    const t = setTimeout(() => {
      gl.domElement.toBlob(async (blob) => {
        if (!blob) return;
        await fetch(`/api/dev/render?name=${name}`, { method: "POST", body: blob });
        onDone();
      }, "image/png");
    }, 900);
    return () => clearTimeout(t);
  }, [scene, camera, gl, invalidate, name, onDone]);
  return <primitive object={scene} />;
}

export default function RenderShot({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ width: 1200, height: 1200, background: "#fff" }}>
      <Canvas
        dpr={1}
        camera={{ fov: 30 }}
        gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.4} position={[-5, 1.5, 1]} scale={[4, 6, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.0} position={[5, 1.5, 2]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="rect" intensity={0.8} position={[0, 1, -5]} scale={[10, 5, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Shot name={name} onDone={() => setDone(true)} />
          <ContactShadows position={[0, 0.001, 0]} opacity={0.3} scale={6} blur={2.6} far={1.6} resolution={512} frames={1} color="#2a0a10" />
        </Suspense>
      </Canvas>
      <p id="status" style={{ position: "fixed", top: 4, left: 4, font: "12px monospace" }}>{done ? "saved" : "rendering"}</p>
    </div>
  );
}
