import './SkillInitialTile.css';

interface SkillInitialTileProps {
  readonly displayName: string;
}

interface TileColorPair {
  readonly background: string;
  readonly color: string;
}

const FALLBACK_INITIAL = 'S';

const TILE_COLOR_MAP: Record<string, TileColorPair> = {
  A: { background: '#eef2ff', color: '#5b6abf' },
  B: { background: '#fef2f2', color: '#c0392b' },
  C: { background: '#ecfdf5', color: '#2d9f7f' },
  D: { background: '#fff7ed', color: '#c2410c' },
  E: { background: '#f3f0ff', color: '#7c3aed' },
  F: { background: '#fefce8', color: '#b8860b' },
  G: { background: '#ecfdf5', color: '#2d9f7f' },
  H: { background: '#eef2ff', color: '#5b6abf' },
  I: { background: '#fef2f2', color: '#c0392b' },
  J: { background: '#fff7ed', color: '#c2410c' },
  K: { background: '#f3f0ff', color: '#7c3aed' },
  L: { background: '#fefce8', color: '#b8860b' },
  M: { background: '#ecfdf5', color: '#2d9f7f' },
  N: { background: '#eef2ff', color: '#5b6abf' },
  O: { background: '#fff7ed', color: '#c2410c' },
  P: { background: '#fefce8', color: '#b8860b' },
  Q: { background: '#f3f0ff', color: '#7c3aed' },
  R: { background: '#f3f0ff', color: '#7c3aed' },
  S: { background: '#fef2f2', color: '#c0392b' },
  T: { background: '#ecfdf5', color: '#2d9f7f' },
  U: { background: '#eef2ff', color: '#5b6abf' },
  V: { background: '#fff7ed', color: '#c2410c' },
  W: { background: '#fefce8', color: '#b8860b' },
  X: { background: '#f3f0ff', color: '#7c3aed' },
  Y: { background: '#ecfdf5', color: '#2d9f7f' },
  Z: { background: '#fef2f2', color: '#c0392b' },
};

const DEFAULT_TILE_COLOR: TileColorPair = {
  background: '#eef2ff',
  color: '#5b6abf',
};

export function SkillInitialTile({ displayName }: SkillInitialTileProps) {
  const initial = extractInitial(displayName);
  const tileColor = resolveTileColor(initial);

  return (
    <div
      className="skill-initial-tile"
      style={{ background: tileColor.background, color: tileColor.color }}
    >
      {initial}
    </div>
  );
}

function extractInitial(displayName: string): string {
  const trimmedName = displayName.trim();
  const hasName = trimmedName.length > 0;
  if (!hasName) {
    return FALLBACK_INITIAL;
  }
  return trimmedName.slice(0, 1).toUpperCase();
}

function resolveTileColor(initial: string): TileColorPair {
  const matchedColor = TILE_COLOR_MAP[initial];
  const hasMatch = matchedColor !== undefined;
  return hasMatch ? matchedColor : DEFAULT_TILE_COLOR;
}
