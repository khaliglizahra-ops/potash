"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

useGLTF.setDecoderPath("/draco/");

function Item({ name, x, y }: { name: string; x: number; y: number }) {
  const { scene } = useGLTF(`/models/${name}.glb`);
  const obj = useMemo(() => {
    const o = scene.clone(true);
    const box = new THREE.Box3().setFromObject(o);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const k = 1.5 / Math.max(size.x, size.y, size.z);
    const g = new THREE.Group();
    o.position.set(-c.x, -box.min.y, -c.z);
    g.add(o);
    g.scale.setScalar(k);
    g.rotation.y = -0.55;
    g.position.set(x, y - 0.7, 0);
    return g;
  }, [scene, x, y]);
  return <primitive object={obj} />;
}

export default function Gallery({ names }: { names: string[] }) {
  const cols = 5;
  const rows = Math.ceil(names.length / cols);
  return (
    <div style={{ width: cols * 200, height: Math.ceil(rows * 200) + 40, background: "#fff" }}>
      <Canvas orthographic camera={{ zoom: 100, position: [0, 0, 20], near: 0.1, far: 100 }} dpr={1} gl={{ antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 6]} intensity={1.2} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.2} position={[-5, 1.5, 1]} scale={[4, 6, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.0} position={[0, 1, 5]} scale={[10, 5, 1]} />
        </Environment>
        <Suspense fallback={null}>
          {names.map((n, i) => (
            <Item key={n} name={n} x={((i % cols) - (cols - 1) / 2) * 2} y={-(Math.floor(i / cols) - (rows - 1) / 2) * 2} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
