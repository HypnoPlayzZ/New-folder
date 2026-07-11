// GPU steam: a single Points cloud animated entirely on the vertex shader.
// Each particle loops on its own lifetime — rising, swaying and dispersing —
// so thousands of puffs cost one draw call. Density (uReveal) tracks the lid lift.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { expState } from '../store';
import { STAGES, stageProgress } from '../config';

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uSize;
  attribute float aSeed;
  attribute float aSpeed;
  attribute float aScale;
  varying float vAlpha;
  void main() {
    float life = fract(uTime * aSpeed + aSeed);
    float rise = life * (3.4 + aSeed * 1.6);
    vec3 p = position;
    p.y += rise;
    // turbulent sway, widening as it rises (dispersion)
    float spread = 0.4 + life * 1.3;
    p.x += sin(uTime * 1.3 + aSeed * 30.0) * spread * 0.5;
    p.z += cos(uTime * 1.1 + aSeed * 24.0) * spread * 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float fade = sin(life * 3.14159265);           // 0→1→0 over life
    vAlpha = fade * uReveal;
    gl_PointSize = uSize * aScale * (0.5 + life) * uReveal * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vec3(0.92, 0.85, 0.78), vec3(1.0), soft); // warm steam
    gl_FragColor = vec4(col, soft * vAlpha * 0.5);
  }
`;

export default function Steam({ count = 1400 }) {
  const mat = useRef();
  const n = Math.max(60, count);

  const { geometry } = useMemo(() => {
    const positions = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    const speeds = new Float32Array(n);
    const scales = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.9;     // emit from basket mouth
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.3 + Math.random() * 0.2;
      positions[i * 3 + 2] = Math.sin(a) * r;
      seeds[i] = Math.random();
      speeds[i] = 0.05 + Math.random() * 0.09;
      scales[i] = 8 + Math.random() * 22;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    return { geometry: g };
  }, [n]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uSize: { value: 1 },
  }), []);

  useFrame((state) => {
    const { progress } = expState();
    const hero = stageProgress(progress, STAGES.hero.start, STAGES.hero.end);
    const reveal = Math.max(0, (hero - 0.3) / 0.7); // appears as lid lifts
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
      mat.current.uniforms.uReveal.value += (reveal - mat.current.uniforms.uReveal.value) * 0.08;
    }
  });

  return (
    <points geometry={geometry} position={[0, 0.2, 0]} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
