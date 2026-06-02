import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const FIGMA_PREFIX = 'figma:asset/';
const VIRTUAL_PREFIX = '\0figma-asset:';
// 1×1 transparent PNG as data URI
const PLACEHOLDER_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const figmaAssetPlugin = () => {
  return {
    name: 'figma-asset-plugin',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id.startsWith(FIGMA_PREFIX)) {
        return VIRTUAL_PREFIX + id.slice(FIGMA_PREFIX.length);
      }
    },
    load(id: string) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return `export default "${PLACEHOLDER_PNG}";`;
      }
    },
  };
};

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    figmaAssetPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
