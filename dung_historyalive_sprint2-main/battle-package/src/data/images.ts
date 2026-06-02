// Fallback bundle images (from src/assets) - imported at top level so TypeScript is happy
import img0 from '../../../src/assets/02d5d6afc60253518a2c4b2d0f9428a80995324f.png';
import img1 from '../../../src/assets/0eb6b50312ce796d871fbb9c02184424751ba66c.png';
import img2 from '../../../src/assets/10ac3bc0d3c7ee89a610ece143c092235cc6a75d.png';
import img3 from '../../../src/assets/10d10f63a6df806ceb624fec993f394d723e8045.png';

// Try to load any PNGs placed into battle-package/assets first (you can copy
// the original UI images into that folder). Fall back to the bundled src/assets
// images so the page still works if no copy was made.
const localModules = (import.meta as any).glob('../assets/*.png', { query: '?url', eager: true }) as Record<string, { default: string } | string>;
let SOURCE_IMAGES: string[] = [];
if (localModules && Object.keys(localModules).length > 0) {
  SOURCE_IMAGES = Object.keys(localModules).sort().map(k => {
    const v = (localModules as any)[k];
    return typeof v === 'string' ? v : (v as any).default || '';
  }).filter(Boolean);
} else {
  SOURCE_IMAGES = [img0, img1, img2, img3];
}

export { SOURCE_IMAGES };

export const ASSET_MAP: Record<string, string> = {
  asset1: SOURCE_IMAGES[0] || '',
  asset2: SOURCE_IMAGES[1] || '',
  asset3: SOURCE_IMAGES[2] || '',
  asset4: SOURCE_IMAGES[3] || '',
};
