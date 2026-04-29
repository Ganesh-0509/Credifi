import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

const MAX_PARTICLES = 2500;

export default function ExperienceScene() {
  const scroll = useScroll();
  const { camera } = useThree();

  const sceneRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const positionAttrRef = useRef<THREE.BufferAttribute>(null!);
  const colorAttrRef = useRef<THREE.BufferAttribute>(null!);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const reducedMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(reducedMedia.matches);
    const update = () => setPrefersReducedMotion(reducedMedia.matches);
    reducedMedia.addEventListener('change', update);
    return () => reducedMedia.removeEventListener('change', update);
  }, []);

  const gold = useMemo(() => new THREE.Color('#fbbf24'), []);
  const emerald = useMemo(() => new THREE.Color('#10b981'), []);
  const ivory = useMemo(() => new THREE.Color('#ffffff'), []);
  const dim = useMemo(() => new THREE.Color('#1e293b'), []);

  const { positions, baseColors, velocities } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const col = new Float32Array(MAX_PARTICLES * 3);
    const vel = new Float32Array(MAX_PARTICLES);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 4 + Math.random() * 2;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = ivory.clone().lerp(gold, Math.random() * 0.3);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      vel[i] = 0.5 + Math.random();
    }
    return { positions: pos, baseColors: col, velocities: vel };
  }, [ivory, gold]);

  useFrame((state) => {
    const offset = scroll.offset;
    const time = state.clock.getElapsedTime();

    // Camera movement
    const camZ = isMobile ? 10 : 8;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ - offset * 4, 0.05);
    camera.lookAt(0, 0, 0);

    if (sceneRef.current) {
      sceneRef.current.rotation.y = time * 0.05 + offset * 2;
      sceneRef.current.rotation.z = offset * 0.5;
    }

    const posAttr = positionAttrRef.current;
    const colAttr = colorAttrRef.current;

    if (posAttr && colAttr) {
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      for (let i = 0; i < MAX_PARTICLES; i++) {
        const i3 = i * 3;
        
        // Subtle neural flow
        const noise = Math.sin(time * 0.2 + i) * 0.02;
        posArr[i3] += noise;
        posArr[i3 + 1] += noise;

        // Color shift based on scroll
        const tempColor = ivory.clone();
        if (offset > 0.2 && offset < 0.5) {
          tempColor.lerp(emerald, (offset - 0.2) / 0.3);
        } else if (offset >= 0.5) {
          tempColor.lerp(gold, (offset - 0.5) / 0.5);
        } else {
          tempColor.lerp(dim, 1 - offset * 5);
        }

        colArr[i3] = tempColor.r;
        colArr[i3 + 1] = tempColor.g;
        colArr[i3 + 2] = tempColor.b;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={sceneRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute ref={positionAttrRef} attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute ref={colorAttrRef} attach="attributes-color" args={[baseColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Decorative large light orbs */}
      <mesh position={[2, 2, -2]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.05} />
      </mesh>
      <mesh position={[-3, -1, -4]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.03} />
      </mesh>
    </group>
  );
}
