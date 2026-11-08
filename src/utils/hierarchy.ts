import { ModuleNode } from '../types/soc';

export interface LevelInfo {
  /** Modules drawn at the active level, already centred around the world origin. */
  nodes: ModuleNode[];
  isTop: boolean;
  isLeaf: boolean;
  /** True when the active module itself has to be drawn as a single leaf block. */
  renderActiveAsLeaf: boolean;
}

/**
 * Children rendered by the diagram scene for the active module.
 * Positions stored in the catalog are local to the parent; the renderer re-centres
 * the whole level so the substrate and the camera always agree on the same origin.
 */
export const getLevelNodes = (activeModule: ModuleNode, rootModule: ModuleNode): ModuleNode[] => {
  if (activeModule.id === rootModule.id) return rootModule.children ?? [];
  return activeModule.children ?? [];
};

export const getLevelInfo = (activeModule: ModuleNode, rootModule: ModuleNode): LevelInfo => {
  const isTop = activeModule.id === rootModule.id;
  const raw = getLevelNodes(activeModule, rootModule);
  const isLeaf = raw.length === 0;

  if (isLeaf) {
    return {
      nodes: [
        {
          ...activeModule,
          position: [0, activeModule.size[1] / 2, 0]
        }
      ],
      isTop,
      isLeaf,
      renderActiveAsLeaf: !isTop
    };
  }

  return {
    nodes: centreLevelNodes(raw),
    isTop,
    isLeaf,
    renderActiveAsLeaf: false
  };
};

/**
 * Shifts a level so its geometric bounding box is centred on the origin.
 * Without this, hand-authored local layouts can look off-centre inside the die plate.
 */
export const centreLevelNodes = (nodes: ModuleNode[]): ModuleNode[] => {
  if (nodes.length === 0) return nodes;

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const node of nodes) {
    const [x, , z] = node.position;
    const [w, , d] = node.size;
    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minZ = Math.min(minZ, z - d / 2);
    maxZ = Math.max(maxZ, z + d / 2);
  }

  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  return nodes.map(node => ({
    ...node,
    position: [node.position[0] - cx, node.position[1], node.position[2] - cz]
  }));
};

/**
 * Vertical separation used by the exploded view. The factor shrinks as we drill
 * down because the blocks themselves are smaller.
 */
export const explodeOffset = (level: number, factor: number): number => {
  const scale = level <= 1 ? 1 : level === 2 ? 0.45 : 0.25;
  return factor * scale;
};

export const prettyName = (name: string): string => name.replace(/_/g, ' ');

export const countDescendants = (node: ModuleNode): number =>
  (node.children ?? []).reduce((total, child) => total + 1 + countDescendants(child), 0);

export const countViolationsDeep = (node: ModuleNode): number => {
  const own = (node.ports ?? []).filter(p => p.cdcStatus === 'violation').length;
  return (node.children ?? []).reduce((total, child) => total + countViolationsDeep(child), own);
};

export const moduleInDomain = (
  node: ModuleNode,
  kind: 'clock' | 'reset' | 'power',
  name: string
): boolean => {
  if (kind === 'clock') return node.clockDomains.includes(name);
  if (kind === 'reset') return node.resetDomains.includes(name);
  return (node.powerDomains ?? []).includes(name);
};

export const findFirstModuleInDomain = (
  node: ModuleNode,
  kind: 'clock' | 'reset' | 'power',
  name: string
): ModuleNode | null => {
  if (node.level > 0 && moduleInDomain(node, kind, name)) return node;
  for (const child of node.children ?? []) {
    const found = findFirstModuleInDomain(child, kind, name);
    if (found) return found;
  }
  return null;
};

export const findNodeById = (node: ModuleNode, id: string): ModuleNode | null => {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

export const findPathToNode = (node: ModuleNode, id: string): ModuleNode[] | null => {
  if (node.id === id) return [node];
  for (const child of node.children ?? []) {
    const path = findPathToNode(child, id);
    if (path) return [node, ...path];
  }
  return null;
};
