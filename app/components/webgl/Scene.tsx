"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Sparkles,
  MeshDistortMaterial,
  Line,
} from "@react-three/drei";
import * as THREE from "three";
import { useSection, type SectionId } from "../../lib/stores";

const GREEN = "#b8e629";
const BRIGHT = "#d4ff4d";
const DUST = "#c8f542";

function useScrollProgress() {
  const ref = useRef(0);
  useFrame(() => {
    const max =
      document.documentElement.scrollHeight - window.innerHeight || 1;
    ref.current = Math.min(1, Math.max(0, window.scrollY / max));
  });
  return ref;
}

/* ---- Camera rig ---- */
const CAM: Record<SectionId, { z: number; y: number; intensity: number }> = {
  home: { z: 5, y: 0, intensity: 0.55 },
  work: { z: 4.4, y: -0.25, intensity: 0.9 },
  about: { z: 5.4, y: 0.15, intensity: 0.5 },
  skills: { z: 5.8, y: 0.28, intensity: 0.46 },
  contact: { z: 6.2, y: 0.4, intensity: 0.38 },
};

function CameraRig({ scroll }: { scroll: React.RefObject<number> }) {
  const { camera } = useThree();
  const section = useSection((s) => s.section);
  useFrame(() => {
    const t = CAM[section];
    const p = scroll.current;
    camera.position.z += (t.z + 0.7 * p - camera.position.z) * 0.04;
    camera.position.y += (t.y - 0.7 * p - camera.position.y) * 0.04;
    camera.lookAt(0.8, 0, 0);
  });
  return null;
}

/* ---- Lights ---- */
function Lights() {
  const section = useSection((s) => s.section);
  const intensity = CAM[section].intensity;
  return (
    <>
      <ambientLight intensity={intensity * 0.55} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.85}
        color="#f5ffe0"
      />
      <pointLight
        position={[-6, 3, -3]}
        intensity={section === "work" ? 1.35 : section === "contact" ? 0.45 : 0.75}
        color="#b8e629"
        distance={22}
        decay={2}
      />
      <pointLight
        position={[8, -2, 1]}
        intensity={0.4}
        color="#7a9918"
        distance={18}
        decay={2}
      />
    </>
  );
}

/* ---- 1. Dust cloud ---- */
function DustCloud({ scroll }: { scroll: React.RefObject<number> }) {
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    []
  );
  const count = isMobile ? 180 : 420;
  const points = useRef<THREE.Points>(null);
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + 18 * Math.random();
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 12;
      velocities[i * 3] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    return { positions, velocities };
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const a = 0.15 * clock.elapsedTime;
    const pos = points.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] += velocities[idx] + 4e-4 * Math.sin(a + i);
      pos[idx + 1] += velocities[idx + 1];
      pos[idx + 2] += velocities[idx + 2];
      if (Math.abs(pos[idx]) > 28) velocities[idx] *= -1;
      if (Math.abs(pos[idx + 1]) > 14) velocities[idx + 1] *= -1;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = 0.08 * a;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={DUST}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ---- 2. Wireframe rings ---- */
function WireframeRings({ scroll }: { scroll: React.RefObject<number> }) {
  const section = useSection((s) => s.section);
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ellipse = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 3.8, 3.8, 0, Math.PI * 2, false, 0);
    return curve.getPoints(128).map((p) => new THREE.Vector3(p.x, p.y, 0));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = scroll.current;
    const sm = section === "work" ? 1 : section === "contact" ? 0.5 : 0.75;
    if (outer.current) {
      outer.current.rotation.x = 0.35 * Math.PI + 0.4 * p;
      outer.current.rotation.y = 0.04 * t * sm + p * Math.PI;
      outer.current.rotation.z = 0.08 * Math.sin(0.3 * t);
    }
    if (inner.current) {
      inner.current.rotation.x = -(0.2 * Math.PI) + 0.25 * p;
      inner.current.rotation.y = -(0.06 * t) * sm;
    }
  });

  const outerOpacity =
    section === "home" ? 0.1 : section === "contact" ? 0.06 : 0.14;
  const innerOpacity = section === "home" ? 0.07 : 0.1;

  return (
    <group position={[0.5, 0, -2]}>
      <mesh ref={outer}>
        <icosahedronGeometry args={[3.6, 2]} />
        <meshBasicMaterial
          color={GREEN}
          wireframe
          transparent
          opacity={outerOpacity}
        />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[2.2, 0]} />
        <meshBasicMaterial
          color={GREEN}
          wireframe
          transparent
          opacity={innerOpacity}
        />
      </mesh>
      <Line
        points={ellipse}
        color={GREEN}
        transparent
        opacity={0.08}
        lineWidth={1}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

/* ---- 3. Helix instanced spheres ---- */
function Helix({
  scroll,
  mouse,
}: {
  scroll: React.RefObject<number>;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const section = useSection((s) => s.section);
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    []
  );
  const count = isMobile ? 70 : 160;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    const p = scroll.current;
    const m = mouse.current;
    const rot = section === "work" ? 0.65 : 0.4;
    const centerX = section === "work" ? 2.6 : 2.2;
    for (let i = 0; i < count; i++) {
      const strand = i % 2;
      const tn = i / count;
      const angle =
        tn * Math.PI * 10 + t * rot + strand * Math.PI + p * Math.PI * 2;
      const yPos = (tn - 0.5) * 7 + (0.1 * m.y - 0.4 * p);
      const radius =
        centerX + 0.35 * strand + 0.15 * Math.sin(tn * Math.PI * 4 + t);
      const xPos = Math.cos(angle) * radius + (2.6 + 0.15 * m.x) - 0.5;
      const zPos = Math.sin(angle) * radius - 0.3 * p;
      const scale =
        0.025 + (strand === 0 ? 0.015 : 0.008) + 0.004 * Math.sin(3 * t + 0.2 * i);
      dummy.position.set(xPos, yPos, zPos);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#8fb824"
        emissive={GREEN}
        emissiveIntensity={section === "work" ? 0.65 : 0.35}
        metalness={0.6}
        roughness={0.35}
      />
    </instancedMesh>
  );
}

/* ---- 4. Main glowing sphere ---- */
function GlowSphere({
  scroll,
  mouse,
}: {
  scroll: React.RefObject<number>;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const section = useSection((s) => s.section);
  const group = useRef<THREE.Group>(null);
  const sphere = useRef<THREE.Mesh>(null);
  const innerSphere = useRef<THREE.Mesh>(null);
  const torus = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = scroll.current;
    const m = mouse.current;
    if (group.current) {
      group.current.rotation.y = 0.06 * t + 0.12 * m.x + p * Math.PI * 0.5;
      group.current.rotation.x = 0.08 * m.y + 0.2 * p;
      group.current.position.x = 2.6 + 0.25 * m.x;
      group.current.position.y = 0.15 + 0.15 * m.y - 0.6 * p;
    }
    const pulse =
      1 +
      0.05 *
        Math.sin(1.4 * t) *
        (section === "work" ? 1.4 : section === "contact" ? 0.7 : 1);
    if (sphere.current) sphere.current.scale.setScalar(1.35 * pulse);
    if (innerSphere.current)
      innerSphere.current.scale.setScalar((1 + 0.1 * Math.sin(2.2 * t)) * 0.42);
    if (torus.current) {
      torus.current.rotation.z = 0.35 * t;
      torus.current.rotation.x = 0.45 * Math.PI + 0.1 * Math.sin(0.5 * t);
    }
  });

  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.35}>
      <group ref={group} position={[2.6, 0.15, -0.5]}>
        <mesh ref={sphere}>
          <icosahedronGeometry args={[1, 5]} />
          <MeshDistortMaterial
            color={GREEN}
            metalness={0.92}
            roughness={0.12}
            emissive={GREEN}
            emissiveIntensity={
              section === "work" ? 0.4 : section === "contact" ? 0.12 : 0.22
            }
            distort={section === "work" ? 0.5 : section === "about" ? 0.22 : 0.32}
            speed={section === "work" ? 2.8 : 1.8}
          />
        </mesh>
        <mesh ref={innerSphere}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color={BRIGHT}
            emissive={BRIGHT}
            emissiveIntensity={0.85}
            metalness={0.4}
            roughness={0.15}
          />
        </mesh>
        <mesh ref={torus}>
          <torusGeometry args={[1.65, 0.018, 8, 128]} />
          <meshBasicMaterial color={BRIGHT} transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.85, 0.012, 8, 128]} />
          <meshBasicMaterial color={GREEN} transparent opacity={0.28} />
        </mesh>
      </group>
    </Float>
  );
}

/* ---- 5. Sparkles ---- */
function SparkleField({ scroll }: { scroll: React.RefObject<number> }) {
  const section = useSection((s) => s.section);
  const group = useRef<THREE.Group>(null);
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    []
  );
  const primaryCount = isMobile ? 18 : 35;

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = 0.15 - 0.5 * scroll.current;
      group.current.rotation.y = 0.12 * clock.elapsedTime;
    }
  });

  return (
    <group ref={group} position={[2.6, 0.15, -0.5]}>
      <Sparkles
        count={section === "work" ? 55 : section === "contact" ? 20 : primaryCount}
        scale={3.2}
        size={2.5}
        speed={0.35}
        color={GREEN}
        opacity={section === "work" ? 0.85 : 0.5}
      />
      <Sparkles
        count={Math.floor(0.4 * primaryCount)}
        scale={5}
        size={1.2}
        speed={0.15}
        color="#e8ffc8"
        opacity={0.25}
      />
    </group>
  );
}

export default function Scene() {
  const scroll = useScrollProgress();
  const mouse = useRef({ x: 0, y: 0 });

  // bind mouse once
  const bound = useRef(false);
  if (typeof window !== "undefined" && !bound.current) {
    bound.current = true;
    window.addEventListener("mousemove", (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(2 * (e.clientY / window.innerHeight - 0.5));
    });
  }

  return (
    <>
      <CameraRig scroll={scroll} />
      <Lights />
      <DustCloud scroll={scroll} />
      <WireframeRings scroll={scroll} />
      <Helix scroll={scroll} mouse={mouse} />
      <GlowSphere scroll={scroll} mouse={mouse} />
      <SparkleField scroll={scroll} />
    </>
  );
}
