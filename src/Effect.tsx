import {
  AccumulativeShadows,
  Environment,
  Float,
  Lightformer,
  PerformanceMonitor,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import {
  applyProps,
  Canvas,
  useFrame,
  type RootState,
} from "@react-three/fiber";
import { Color, Depth, LayerMaterial } from "lamina";
import { easing } from "maath";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

const CANVAS_STYLE = { height: "100vh" } as const;
const CAMERA_SETTINGS = { position: [5, 0, 15], fov: 30 } as const;
const PORSCHE_POSITION = [0.25, -1.5, 0] as const;
const PORSCHE_ROTATION = [0.2, Math.PI / 10, 0.125] as const;
const SHADOW_POSITION = [0, -1.16, 0] as const;
const LIGHT_POSITION = [0, 0, 0] as const;

export default function Effect() {
  const [degraded, degrade] = useState(false);
  // Use useCallback to memoize the function
  const handleDecline = useCallback(() => {
    degrade(true);
  }, []);

  return (
    <Canvas style={CANVAS_STYLE} camera={CAMERA_SETTINGS}>
      <ambientLight intensity={0.1} />
      <WolfyLogo
        scale={20}
        position={PORSCHE_POSITION}
        rotation={PORSCHE_ROTATION}
      />
      <AccumulativeShadows
        position={SHADOW_POSITION}
        frames={100}
        alphaTest={0.125}
        scale={10}
      >
        <RandomizedLight
          amount={10}
          radius={10}
          ambient={0.5}
          position={LIGHT_POSITION}
        />
      </AccumulativeShadows>
      <PerformanceMonitor onDecline={handleDecline} />
      <CameraRig />
      <Environment frames={degraded ? 1 : Infinity} resolution={256}>
        <Lightformers />
      </Environment>
    </Canvas>
  );
}

interface WolfyLogoProps {
  scale: number;
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
}

function WolfyLogo({ scale, position, rotation }: WolfyLogoProps) {
  const gltf = useGLTF("/wolfy-logo.glb");
  const { scene, materials } = gltf;

  useLayoutEffect(() => {
    const materialProps = {
      envMapIntensity: 0.5,
      roughness: 0.1,
      metalness: 1,
    };

    Object.entries({
      "May Mist": materials["May Mist"],
      Windsurf: materials.Windsurf,
      Bumblebee: materials.Bumblebee,
    }).forEach(([_, material]) => {
      if (material) {
        applyProps(material, materialProps);
      }
    });
  }, [materials]);

  return (
    <primitive
      object={scene}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

function CameraRig() {
  return useFrame((state: RootState, delta) => {
    if (state.camera instanceof THREE.PerspectiveCamera) {
      easing.damp3(
        state.camera.position,
        [
          Math.sin(-state.pointer.x) * 10,
          state.pointer.y * 5 - 2,
          15 + Math.cos(state.pointer.x),
        ],
        0.5,
        delta
      );
      state.camera.lookAt(0, 0, 0);
    }
  });
}

const CEILING_POSITION = [0, 5, -9];
const CEILING_SCALE = [10, 10, 1];
const GROUP_ROTATION = [0, 0.5, 0] as const;

const SIDE_LIGHTFORMER_1_POSITION = [-5, 1, -1] as const;
const SIDE_LIGHTFORMER_1_SCALE = [20, 0.1, 1] as const;
const SIDE_LIGHTFORMER_2_POSITION = [-1, -1, -1] as const;
const SIDE_LIGHTFORMER_2_SCALE = [20, 0.5, 1] as const;
const SIDE_LIGHTFORMER_3_POSITION = [5, 2, 0] as const;
const SIDE_LIGHTFORMER_3_SCALE = [20, 1, 1] as const;

const ACCENT_LIGHTFORMER_POSITION = [-15, 4, -18] as const;
const ACCENT_LIGHTFORMER_TARGET = [1, 1, 1] as const;

function Lightformers() {
  const positions = [2, 0, 2, 0, 2, 0, 2, 0];
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.z += delta * 10;
      if (groupRef.current.position.z > 20) {
        groupRef.current.position.z = -60;
      }
    }
  });

  return (
    <>
      <Lightformer
        intensity={0.5}
        rotation-x={Math.PI / 2}
        position={CEILING_POSITION}
        scale={CEILING_SCALE}
      />
      <group rotation={GROUP_ROTATION}>
        <group ref={groupRef}>
          {positions.map((x, i) => {
            const circlePosition = [x, 4, i * 4] as const;
            const circleScale = [3, 1, 1] as const;
            const circleRotation = [Math.PI / 2, 0.5, 0.5] as const;

            return (
              <Lightformer
                key={i}
                form="circle"
                intensity={2}
                rotation={circleRotation}
                position={circlePosition}
                scale={circleScale}
              />
            );
          })}
        </group>
      </group>
      {/* Sides */}

      <Lightformer
        intensity={4}
        rotation-y={Math.PI / 2}
        position={SIDE_LIGHTFORMER_1_POSITION}
        scale={SIDE_LIGHTFORMER_1_SCALE}
      />
      <Lightformer
        rotation-y={Math.PI / 2}
        position={SIDE_LIGHTFORMER_2_POSITION}
        scale={SIDE_LIGHTFORMER_2_SCALE}
      />
      <Lightformer
        rotation-y={-Math.PI / 2}
        position={SIDE_LIGHTFORMER_3_POSITION}
        scale={SIDE_LIGHTFORMER_3_SCALE}
      />
      {/* Accent (red) */}
      <Float speed={5} floatIntensity={5} rotationIntensity={1}>
        <Lightformer
          form="ring"
          color="red"
          intensity={0.3}
          scale={5}
          position={ACCENT_LIGHTFORMER_POSITION}
          target={ACCENT_LIGHTFORMER_TARGET}
        />
      </Float>
      <mesh scale={100}>
        <sphereGeometry args={[1, 28, 28]} />
        <LayerMaterial side={THREE.BackSide}>
          <Color color="#000" alpha={1} mode="darken" />
          <Depth
            colorA="red"
            colorB="black"
            alpha={0.3}
            mode="normal"
            near={0}
            far={300}
            origin={[100, 100, 100]}
          />
        </LayerMaterial>
      </mesh>
    </>
  );
}
