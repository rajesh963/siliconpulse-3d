import React, { useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { ArchitectureDiagram, DiagramBlock, DiagramWire } from '../../types/diagram';
import { buildBlockDiagram3D, BUS_THICKNESS } from '../../utils/blockDiagram3d';
import type { Block3DNode, Line3D } from '../../types/block3d';

export type ViewPreset = 'iso' | 'top' | 'front';

const CANVAS_BRIDGE = '__blockDiagram3dSelect';
declare global {
  interface Window {
    [CANVAS_BRIDGE]?: (payload: { type: 'block' | 'wire'; id: string }) => void;
  }
}

interface BlockDiagram3DProps {
  diagram: ArchitectureDiagram;
  selectedBlock: DiagramBlock | null;
  selectedWire: DiagramWire | null;
  onSelectBlock: (block: DiagramBlock) => void;
  onSelectWire: (wire: DiagramWire) => void;
  onClear: () => void;
  matchedIds: Set<string>;
  view: ViewPreset;
}

const BODY_HEIGHT_SCALE = 1.6;

const bodyMaterial = (color: string, selected: boolean, dimmed: boolean) => (
  <meshStandardMaterial
    color={color}
    emissive={color}
    emissiveIntensity={selected ? 0.62 : 0.22}
    metalness={0.55}
    roughness={0.35}
    transparent
    opacity={dimmed ? 0.16 : 0.92}
  />
);

const Block3D: React.FC<{
  node: Block3DNode;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}> = ({ node, selected, dimmed, onSelect }) => {
  const color = node.block.color ?? '#94a3b8';
  const { w, d, h, shape } = node;
  const lineMat = <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.2 : 0.95} />;

  return (
    <group position={[node.x, 0, node.z]} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      {shape === 'bus' ? (
        <group position={[0, h / 2, 0]}>
          <mesh>
            <boxGeometry args={[w, h, BUS_THICKNESS]} />
            {bodyMaterial(color, selected, dimmed)}
          </mesh>
          <mesh position={[-w * 0.48, h * 0.62, 0]}>
            <boxGeometry args={[w * 0.9, 0.03, 0.05]} />
            {lineMat}
          </mesh>
        </group>
      ) : (
        <group position={[0, h / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            {bodyMaterial(color, selected, dimmed)}
          </mesh>
          <mesh position={[0, h / 2 + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w * 0.94, d * 0.94]} />
            <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.04 : 0.1} side={THREE.DoubleSide} />
          </mesh>
          {shape === 'cpu' && (
            <group>
              <mesh position={[0, h / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[Math.min(w, d) * 0.17, Math.min(w, d) * 0.23, 24]} />
                {lineMat}
              </mesh>
              {[-1, 1].map(sx => (
                <mesh key={sx} position={[sx * (w / 2 - 0.06), h / 2 * 0.55, 0]}>
                  <boxGeometry args={[0.03, h * 0.7, d * 0.55]} />
                  {lineMat}
                </mesh>
              ))}
            </group>
          )}
          {shape === 'memory' && (
            <group>
              {[-0.27, 0, 0.27].map(offset => (
                <mesh key={offset} position={[0, h / 2 + 0.02, offset * d]}>
                  <boxGeometry args={[w * 0.82, 0.03, d * 0.16]} />
                  {lineMat}
                </mesh>
              ))}
            </group>
          )}
          {shape === 'crossbar' && (
            <group>
              {[-0.32, 0, 0.32].map(offset => (
                <mesh key={`h${offset}`} position={[offset * w, h / 2 + 0.02, 0]}>
                  <boxGeometry args={[0.05, 0.03, d * 1.25]} />
                  {lineMat}
                </mesh>
              ))}
              {[-0.32, 0, 0.32].map(offset => (
                <mesh key={`v${offset}`} position={[0, h / 2 + 0.028, offset * d]}>
                  <boxGeometry args={[w * 1.25, 0.03, 0.05]} />
                  {lineMat}
                </mesh>
              ))}
            </group>
          )}
          {shape === 'bridge' && (
            <group>
              <mesh position={[0, -h * 0.24, 0]}>
                <boxGeometry args={[w * 0.64, h * 0.14, d * 0.45]} />
                {lineMat}
              </mesh>
              <mesh position={[-w * 0.32, h / 2 + 0.02, 0]}>
                <boxGeometry args={[0.08, 0.04, d * 0.9]} />
                {lineMat}
              </mesh>
              <mesh position={[w * 0.32, h / 2 + 0.02, 0]}>
                <boxGeometry args={[0.08, 0.04, d * 0.9]} />
                {lineMat}
              </mesh>
            </group>
          )}
          {shape === 'security' && (
            <mesh position={[0, h / 2 + 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
              <planeGeometry args={[Math.min(w, d) * 0.5, Math.min(w, d) * 0.5]} />
              {lineMat}
            </mesh>
          )}
          {shape === 'accelerator' && (
            <group>
              {[-0.26, 0.26].map(sx => [-0.26, 0.26].map(sz => (
                <mesh key={`${sx}-${sz}`} position={[sx * w, -h * 0.18, sz * d]}>
                  <boxGeometry args={[w * 0.32, h * 0.3, d * 0.32]} />
                  {lineMat}
                </mesh>
              )))}
            </group>
          )}
          {shape === 'io' && (
            <group>
              {[-0.6, -0.3, 0, 0.3, 0.6].map(offset => (
                <mesh key={offset} position={[0, h / 2 + 0.02, offset * d * 0.7]}>
                  <boxGeometry args={[w * 0.9, 0.025, 0.04]} />
                  {lineMat}
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}

      <Html position={[0, 0, d / 2 + 0.04]} center sprite={false} zIndexRange={[10, 0]} style={{ pointerEvents: 'auto' }}>
        <div
          data-block3d={node.id}
          onClick={(event) => { event.stopPropagation(); onSelect(); }}
          className={`font-mono whitespace-nowrap rounded border cursor-pointer select-none px-1 py-[1px] leading-tight ${selected ? 'bg-slate-100 text-slate-900 border-white' : 'bg-slate-950/90 border-slate-700'}`}
          style={{
            color: selected ? '#0f172a' : node.block.color ?? '#e2e8f0',
            fontSize: selected ? 11 : 9.5,
            opacity: dimmed ? 0.3 : 1,
            transform: 'translateY(-50%)',
          }}
        >
          {node.block.label}
        </div>
      </Html>
    </group>
  );
};

const TraceMesh: React.FC<{ line: Line3D; hot: boolean; dimmed: boolean; onSelect: () => void }> = ({ line, hot, dimmed, onSelect }) => {
  const points = line.segments[0] ?? [];
  if (points.length < 2) return null;
  const a = points[0];
  const b = points[points.length - 1];
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dz);
  if (length < 0.0001) return null;
  const angle = Math.atan2(dx, dz);
  return (
    <group position={[(a.x + b.x) / 2, line.y, (a.z + b.z) / 2]} rotation={[0, angle, 0]}>
      <mesh onClick={(event) => { event.stopPropagation(); onSelect(); }}>
        <boxGeometry args={[Math.max(line.width, 0.05) * (hot ? 2.1 : 1.5), hot ? 0.075 : 0.045, length]} />
        <meshStandardMaterial color={hot ? '#fbbf24' : line.color} emissive={hot ? '#fbbf24' : line.color} emissiveIntensity={hot ? 0.9 : 0.3} transparent opacity={dimmed ? 0.1 : 0.92} />
      </mesh>
    </group>
  );
};

const Substrate: React.FC<{ width: number; depth: number }> = ({ width, depth }) => (
  <group>
    <mesh position={[0, -0.14, 0]} receiveShadow>
      <boxGeometry args={[width + 1.4, 0.22, depth + 1.4]} />
      <meshStandardMaterial color="#070b14" metalness={0.85} roughness={0.4} />
    </mesh>
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width + 1.4, depth + 1.4]} />
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.05} />
    </mesh>
    <gridHelper args={[Math.max(width, depth) + 2, Math.round(Math.max(width, depth) + 2), '#1e293b', '#0f172a']} position={[0, -0.02, 0]} />
  </group>
);

const VIEW_ANGLES: Record<ViewPreset, [number, number, number]> = {
  iso: [0.05, 1.02, 0.9],
  top: [0.001, 1.5, 0.06],
  front: [0.02, 0.28, 1.25],
};

const CameraRig: React.FC<{ radius: number; view: ViewPreset; halfW: number; halfD: number }> = ({ radius, view, halfW, halfD }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { size, camera } = useThree();
  // Distance that fits the footprint for a 42° vertical FOV, landscape and portrait.
  const perspective = camera as THREE.PerspectiveCamera;
  const vFov = (perspective.fov * Math.PI) / 180;
  const aspect = Math.max(size.width / Math.max(size.height, 1), 0.4);
  const fitHeight = (halfD * 1.08) / Math.tan(vFov / 2);
  const fitWidth = (halfW * 1.06) / (Math.tan(vFov / 2) * aspect);
  const distance = Math.max(fitHeight, fitWidth, 4) * 0.82;
  const [ax, ay, az] = VIEW_ANGLES[view];

  useLayoutEffect(() => {
    camera.position.set(distance * ax, distance * ay, distance * az);
    camera.lookAt(0, 0, 0);
  }, [camera, distance, ax, ay, az]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableRotate
      enableZoom
      minDistance={Math.max(radius * 0.12, 1.5)}
      maxDistance={Math.max(radius * 6, 90)}
      minPolarAngle={0.06}
      maxPolarAngle={Math.PI / 2.02}
      target={[0, 0, 0]}
    />
  );
};

export const BlockDiagram3D: React.FC<BlockDiagram3DProps> = ({
  diagram, selectedBlock, selectedWire, onSelectBlock, onSelectWire, onClear, matchedIds, view,
}) => {
  const layout = useMemo(() => buildBlockDiagram3D(diagram), [diagram]);
  const blockById = useMemo(() => new Map(diagram.blocks.map(block => [block.id, block])), [diagram.blocks]);
  const wireById = useMemo(() => new Map(diagram.wires.map(wire => [wire.id, wire])), [diagram.wires]);
  const incident = useMemo(() => {
    if (!selectedBlock) return new Set<string>();
    return new Set(diagram.wires.filter(wire => wire.from === selectedBlock.id || wire.to === selectedBlock.id).map(wire => wire.id));
  }, [selectedBlock, diagram.wires]);
  useEffect(() => {
    window[CANVAS_BRIDGE] = (payload) => {
      if (payload.type === 'block') {
        const block = blockById.get(payload.id);
        if (block) onSelectBlock(block);
      } else {
        const wire = wireById.get(payload.id);
        if (wire) onSelectWire(wire);
      }
    };
    return () => { window[CANVAS_BRIDGE] = undefined; };
  }, [blockById, wireById, onSelectBlock, onSelectWire]);

  const focused = !!selectedBlock || !!selectedWire || matchedIds.size > 0;
  const radius = Math.max(layout.width, layout.depth) / 2;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 20, 18], fov: 42, near: 0.1, far: 800 }}
      onPointerMissed={onClear}
      style={{ background: 'radial-gradient(circle at 50% 40%, #0b1220 0%, #05080f 70%)' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[12, 22, 9]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-10, 14, -8]} intensity={0.55} color="#38bdf8" />
      <pointLight position={[0, 14, 0]} intensity={0.6} color="#a78bfa" />
      <fog attach="fog" args={['#05080f', radius * 2.6, radius * 6.5]} />
      <CameraRig radius={radius} view={view} halfW={layout.width / 2} halfD={layout.depth / 2} />
      <Substrate width={layout.width} depth={layout.depth} />

      {layout.lines.map(line => {
        const wire = wireById.get(line.wireId);
        const hot = selectedWire?.id === line.wireId || (selectedBlock ? incident.has(line.wireId) : false) || (wire?.from ? matchedIds.has(wire.from) : false);
        const dim = !!focused && !hot;
        return <TraceMesh key={line.id} line={line} hot={!!hot} dimmed={dim} onSelect={() => wire && onSelectWire(wire)} />;
      })}

      {layout.nodes.map(node => {
        const selected = selectedBlock?.id === node.id;
        const related = selectedBlock
          ? node.id === selectedBlock.id || diagram.wires.some(wire => (wire.from === selectedBlock.id && wire.to === node.id) || (wire.to === selectedBlock.id && wire.from === node.id))
          : true;
        const matched = matchedIds.size > 0 && matchedIds.has(node.id);
        const dimmed = focused && !related && !matched;
        const isBusNode = node.shape === 'bus';
        return (
          <Block3D
            key={node.id}
            node={{ ...node, h: isBusNode ? Math.max(node.d, 0.2) : node.h * BODY_HEIGHT_SCALE }}
            selected={selected}
            dimmed={dimmed}
            onSelect={() => { const block = blockById.get(node.id); if (block) onSelectBlock(block); }}
          />
        );
      })}
    </Canvas>
  );
};
