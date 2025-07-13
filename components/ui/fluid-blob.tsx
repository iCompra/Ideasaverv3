'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex shader for the blob effect
const vertexShader = `
  uniform float u_time;
  uniform float u_intensity;
  
  varying vec2 vUv;
  varying float vDisplacement;
  
  void main() {
    vUv = uv;
    
    vec3 newPosition = position;
    float displacement = sin(newPosition.x * 10.0 + u_time) * 0.1 +
                        sin(newPosition.y * 10.0 + u_time * 0.8) * 0.1 +
                        sin(newPosition.z * 10.0 + u_time * 0.5) * 0.1;
    
    newPosition += normal * displacement * u_intensity;
    vDisplacement = displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment shader for the blob effect
const fragmentShader = `
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_opacity;
  
  varying vec2 vUv;
  varying float vDisplacement;
  
  void main() {
    float mixValue = sin(vUv.x * 3.14159 + u_time) * 0.5 + 0.5;
    vec3 color = mix(u_color1, u_color2, mixValue + vDisplacement);
    
    float alpha = u_opacity * (0.8 + vDisplacement * 0.2);
    gl_FragColor = vec4(color, alpha);
  }
`;

interface LavaLampShaderProps {
  position: [number, number, number];
  scale: number;
  color1: string;
  color2: string;
  intensity: number;
  opacity: number;
  speed: number;
}

function LavaLampShader({ 
  position, 
  scale, 
  color1, 
  color2, 
  intensity, 
  opacity, 
  speed 
}: LavaLampShaderProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_intensity: { value: intensity },
    u_color1: { value: new THREE.Color(color1) },
    u_color2: { value: new THREE.Color(color2) },
    u_opacity: { value: opacity }
  }), [intensity, color1, color2, opacity]);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.u_time.value = state.clock.elapsedTime * speed;
      
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={[scale, scale, scale]}>
      <icosahedronGeometry args={[1, 4]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function LavaLamp() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        {/* Multiple animated blobs with different properties */}
        <LavaLampShader
          position={[-2, 1, 0]}
          scale={1.5}
          color1="#8A2BE2"
          color2="#5A55F5"
          intensity={0.3}
          opacity={0.6}
          speed={0.8}
        />
        
        <LavaLampShader
          position={[2, -1, -1]}
          scale={1.2}
          color1="#5A55F5"
          color2="#8A2BE2"
          intensity={0.4}
          opacity={0.5}
          speed={1.2}
        />
        
        <LavaLampShader
          position={[0, 2, -2]}
          scale={1.8}
          color1="#8A2BE2"
          color2="#5A55F5"
          intensity={0.2}
          opacity={0.4}
          speed={0.6}
        />
        
        <LavaLampShader
          position={[-1, -2, 1]}
          scale={1.0}
          color1="#5A55F5"
          color2="#8A2BE2"
          intensity={0.5}
          opacity={0.7}
          speed={1.0}
        />
      </Canvas>
    </div>
  );
}